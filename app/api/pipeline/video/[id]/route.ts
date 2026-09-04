import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/pipeline/video/[id] — everything the merged video page needs: the
// script, the detected changes (PendingScriptEdit — both the cron's suggestions
// and the animation pipeline's auto-applied lines), and the pipeline runs.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const video = await prisma.project.findFirst({
      where: { id: params.id, user_id: session.user.id },
      select: {
        id: true, title: true, description: true, script: true, auto_update: true,
        editor_project: true, design_url: true, client_id: true, updated_at: true,
        client: { select: { name: true, auto_update_default: true } },
      },
    });
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [changes, runs] = await Promise.all([
      prisma.pendingScriptEdit.findMany({
        where: { project_id: video.id, status: { in: ['pending', 'accepted', 'auto_applied'] } },
        orderBy: [{ severity: 'asc' }, { detected_at: 'desc' }],
      }),
      prisma.pipelineRun.findMany({
        where: { project_id: video.id },
        orderBy: { started_at: 'desc' },
        take: 10,
        include: { events: { orderBy: { at: 'asc' } } },
      }),
    ]);

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        clientId: video.client_id,
        client: video.client?.name ?? null,
        script: video.script ?? '',
        autoUpdate: video.auto_update,
        editorProject: video.editor_project,
        designUrl: video.design_url,
        updatedAt: video.updated_at,
        // false = this client's videos are made outside the editor, so manual is the norm here
        clientAutoDefault: video.client?.auto_update_default ?? true,
      },
      changes: changes.map((c) => ({
        id: c.id,
        original_text: c.original_text,
        suggested_replacement: c.suggested_replacement,
        reason: c.reason,
        severity: c.severity,
        category: c.category,
        source_url: c.source_url,
        status: c.status,
        detected_at: c.detected_at,
      })),
      runs: runs.map((r) => ({
        id: r.id,
        projectId: r.project_id,
        video: video.title,
        clientId: video.client_id,
        client: video.client?.name ?? null,
        status: r.status,
        path: r.path,
        phase: r.phase,
        trigger: r.trigger,
        detail: r.detail,
        started_at: r.started_at,
        updated_at: r.updated_at,
        finished_at: r.finished_at,
        // The agent's plain-language "what changed" note for this update (may be null
        // on older runs and on halts) — the script page leads with it.
        brief: r.brief ?? null,
        brief_at: r.brief_at,
        events: r.events.map((e) => ({ phase: e.phase, status: e.status, detail: e.detail, at: e.at })),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// PATCH { action: 'approve' } — you've watched the finished video and it's good.
// Flips the latest ready_for_review run to 'reviewed' so the state stops being
// sticky. Previously a run sat on READY FOR REVIEW forever, because only the
// pipeline itself could emit a 'done' phase and it never does after 'ready'.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const project = await prisma.project.findFirst({
      where: { id: params.id, user_id: session.user.id },
      select: { id: true },
    });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { action } = await req.json().catch(() => ({ action: null }));
    if (action !== 'approve') {
      return NextResponse.json({ error: "action must be 'approve'" }, { status: 400 });
    }

    const run = await prisma.pipelineRun.findFirst({
      where: { project_id: project.id, status: 'ready_for_review' },
      orderBy: { started_at: 'desc' },
      select: { id: true },
    });
    if (!run) return NextResponse.json({ error: 'No run is awaiting review' }, { status: 404 });

    await prisma.pipelineRun.update({
      where: { id: run.id },
      data: { status: 'reviewed', finished_at: new Date(), detail: 'approved' },
    });
    await prisma.pipelineEvent.create({
      data: { run_id: run.id, phase: 'ready', status: 'done', detail: 'approved by you' },
    });

    return NextResponse.json({ runId: run.id, status: 'reviewed' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
