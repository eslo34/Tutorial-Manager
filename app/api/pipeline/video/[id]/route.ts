import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/pipeline/video/[id] — drill-down data for one video: the script, the
// cron-detected changes (PendingScriptEdit — the "what changed" + highlight data),
// and the animation pipeline runs. User-authed.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const video = await prisma.project.findFirst({
      where: { id: params.id, user_id: session.user.id },
      select: { id: true, title: true, script: true, client: { select: { name: true } } },
    });
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [changes, runs] = await Promise.all([
      prisma.pendingScriptEdit.findMany({
        where: { project_id: video.id, status: { in: ['pending', 'accepted'] } },
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
      video: { id: video.id, title: video.title, client: video.client?.name ?? null, script: video.script ?? '' },
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
        status: r.status,
        path: r.path,
        phase: r.phase,
        trigger: r.trigger,
        detail: r.detail,
        started_at: r.started_at,
        updated_at: r.updated_at,
        finished_at: r.finished_at,
        events: r.events.map((e) => ({ phase: e.phase, status: e.status, detail: e.detail, at: e.at })),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
