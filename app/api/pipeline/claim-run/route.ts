import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';

// The local poller calls this to grab the next queued job. Serialized PER PROJECT: it never hands
// out a new job for a video that already has one claimed/launched (no concurrent agents). First it
// reconciles finished 'launched' requests (their PipelineRun reached a terminal state, or they went
// stale) back to 'done' so the lock releases. Auth: CRON_SECRET bearer.
export const maxDuration = 30;

const TERMINAL = ['ready_for_review', 'halted', 'error', 'done'];
const STALE_MS = 90 * 60 * 1000;
const DASHBOARD = 'https://tutorial-manager-three.vercel.app/pipeline';

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    // 1) Close out launched requests whose run finished (or that went stale).
    const launched = await prisma.runRequest.findMany({ where: { status: 'launched' } });
    for (const lr of launched) {
      const latest = await prisma.pipelineRun.findFirst({
        where: { project_id: lr.project_id },
        orderBy: { started_at: 'desc' },
        select: { status: true, started_at: true },
      });
      const finished =
        !!latest && TERMINAL.includes(latest.status) && !!lr.launched_at && new Date(latest.started_at) >= new Date(lr.launched_at);
      const stale = !!lr.launched_at && Date.now() - new Date(lr.launched_at).getTime() > STALE_MS;
      if (finished || stale) {
        await prisma.runRequest.update({ where: { id: lr.id }, data: { status: 'done', finished_at: new Date() } });
      }
    }

    // 2) Claim the oldest queued job whose project is now free.
    const queued = await prisma.runRequest.findMany({
      where: { status: 'queued' },
      orderBy: { created_at: 'asc' },
      include: { project: { select: { auto_update: true } } },
    });
    for (const q of queued) {
      // The video was switched to notify-only after this was queued (or slipped
      // past the trigger guard). The original check-and-email system owns it —
      // retire the request instead of launching an agent at it.
      if (!q.project.auto_update) {
        await prisma.runRequest.update({
          where: { id: q.id },
          data: { status: 'done', finished_at: new Date(), detail: 'skipped — video is notify-only (manual update)' },
        });
        continue;
      }
      const busy = await prisma.runRequest.findFirst({
        where: { project_id: q.project_id, status: { in: ['claimed', 'launched'] } },
        select: { id: true },
      });
      if (busy) continue;
      const res = await prisma.runRequest.updateMany({ where: { id: q.id, status: 'queued' }, data: { status: 'claimed', claimed_at: new Date() } });
      if (res.count !== 1) continue; // lost the race to another claim
      const job = await prisma.runRequest.findUnique({ where: { id: q.id }, include: { project: { select: { title: true, editor_project: true } } } });
      if (!job) continue;
      // "launching" ping only if it was queued while the PC was off (the online path already pinged).
      if (job.queued_offline) {
        await notify(`🎬 Your computer is back — launching the queued auto-update for "${job.project.title}" (${job.sha.slice(0, 7)}).`, {
          title: `Updating ${job.project.title}`,
          click: DASHBOARD,
        });
      }
      return NextResponse.json({
        job: {
          id: job.id,
          projectId: job.project_id,
          video: job.project.title,
          editorProject: job.project.editor_project, // library slug for the agent's open_project
          repo: job.repo,
          sha: job.sha,
          detail: job.detail,
        },
      });
    }
    return NextResponse.json({ job: null });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 });
  }
}
