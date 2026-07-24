import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';

// The local poller pings this every ~30s so the cloud knows the PC is on (drives the
// "launching now" vs "will run next boot" decision in /api/pipeline/trigger).
// It also CLOSES an outage: if the watchdog had alerted that the runner went silent,
// the first heartbeat back clears that flag and pushes an all-clear.
// Auth: CRON_SECRET bearer (a machine caller).
function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({} as { runner?: string; detail?: string }));
  const id = (typeof body?.runner === 'string' && body.runner) || 'local';

  // Was this runner flagged as down? (read before the upsert overwrites it)
  const prev = await prisma.runnerHeartbeat.findUnique({ where: { id }, select: { alerted_at: true, last_seen_at: true } });
  const wasDown = !!prev?.alerted_at && new Date(prev.alerted_at) > new Date(prev.last_seen_at);

  await prisma.runnerHeartbeat.upsert({
    where: { id },
    update: { last_seen_at: new Date(), detail: body?.detail ?? null, alerted_at: null },
    create: { id, last_seen_at: new Date(), detail: body?.detail ?? null },
  });
  const queued = await prisma.runRequest.count({ where: { status: 'queued' } });

  if (wasDown) {
    const downMin = Math.round((Date.now() - new Date(prev!.last_seen_at).getTime()) / 60000);
    const forStr = downMin >= 120 ? `${Math.round(downMin / 60)}h` : `${downMin} min`;
    await notify(
      `✅ Runner "${id}" is back after ${forStr}.` + (queued > 0 ? ` Picking up ${queued} queued update${queued === 1 ? '' : 's'} now.` : ''),
      { title: 'Runner back online' }
    );
  }
  return NextResponse.json({ ok: true, queued, recovered: wasDown });
}
