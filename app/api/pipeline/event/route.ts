import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/pipeline/event — the LOCAL animation pipeline reports progress here.
// Auth: CRON_SECRET bearer (a machine caller, like the cron routes). Body:
//   { runId?, video?, projectId?, phase, status?, detail?, data?, path?, trigger? }
// A run is created on its first event (phase "detect", no runId) and its id is
// returned; every later event passes that runId. The run's denormalized
// phase/status/detail are kept current so the board renders without walking the
// whole event stream.

export const maxDuration = 30;

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

// A notable phase/status maps the RUN to a lifecycle status; otherwise it stays 'running'.
function runStatusFor(phase: string, eventStatus: string): string | null {
  if (eventStatus === 'error') return 'error';
  if (phase === 'ready') return 'ready_for_review';
  if (phase === 'halt') return 'halted';
  if (phase === 'done') return 'done';
  return null;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { runId, video, projectId, phase, status = 'start', detail, data, path, trigger } = body ?? {};
    if (!phase || typeof phase !== 'string') {
      return NextResponse.json({ error: 'phase required' }, { status: 400 });
    }

    // Resolve the run: existing (runId) or create a fresh one for the video.
    let run = runId ? await prisma.pipelineRun.findUnique({ where: { id: runId } }) : null;

    if (!run) {
      let pid: string | undefined = projectId;
      if (!pid && video) {
        const p = await prisma.project.findFirst({
          where: { title: video },
          orderBy: { updated_at: 'desc' },
          select: { id: true },
        });
        pid = p?.id;
      }
      if (!pid) {
        return NextResponse.json(
          { error: `No project for video "${video ?? projectId ?? '(none)'}"` },
          { status: 404 }
        );
      }
      run = await prisma.pipelineRun.create({
        data: {
          project_id: pid,
          status: 'running',
          path: path ?? null,
          trigger: trigger ?? null,
          phase,
          detail: detail ?? null,
        },
      });
    }

    await prisma.pipelineEvent.create({
      data: { run_id: run.id, phase, status, detail: detail ?? null, data: data ?? undefined },
    });

    const newStatus = runStatusFor(phase, status);
    const terminal = !!newStatus && newStatus !== 'running';
    await prisma.pipelineRun.update({
      where: { id: run.id },
      data: {
        phase,
        detail: detail ?? run.detail,
        ...(path ? { path } : {}),
        ...(trigger ? { trigger } : {}),
        ...(newStatus ? { status: newStatus } : {}),
        ...(terminal ? { finished_at: new Date() } : {}),
      },
    });

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error('pipeline/event error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
