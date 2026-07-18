import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// The local poller pings this every ~30s so the cloud knows the PC is on (drives the
// "launching now" vs "will run next boot" decision in /api/pipeline/trigger).
// Auth: CRON_SECRET bearer (a machine caller).
function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({} as { runner?: string; detail?: string }));
  const id = (typeof body?.runner === 'string' && body.runner) || 'local';
  await prisma.runnerHeartbeat.upsert({
    where: { id },
    update: { last_seen_at: new Date(), detail: body?.detail ?? null },
    create: { id, last_seen_at: new Date(), detail: body?.detail ?? null },
  });
  const queued = await prisma.runRequest.count({ where: { status: 'queued' } });
  return NextResponse.json({ ok: true, queued });
}
