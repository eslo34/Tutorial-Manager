import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// The poller reports a claimed request's progress: 'launched' once it has spawned the agent, or
// 'error' if compose/launch failed (so the per-project lock releases). Auth: CRON_SECRET bearer.
const ALLOWED = ['launched', 'error', 'done'];

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, status, detail } = await req.json().catch(() => ({} as { id?: string; status?: string; detail?: string }));
  if (!id || !status || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: 'id + status (launched|error|done) required' }, { status: 400 });
  }
  const data: { status: string; detail?: string; launched_at?: Date; finished_at?: Date } = { status };
  if (detail) data.detail = detail;
  if (status === 'launched') data.launched_at = new Date();
  if (status === 'error' || status === 'done') data.finished_at = new Date();
  await prisma.runRequest.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
