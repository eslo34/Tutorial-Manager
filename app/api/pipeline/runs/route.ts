import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/pipeline/runs?limit=50 — board data for the mission-control dashboard.
// Auth: logged-in user (read-only). Returns every video the user owns (so idle
// ones still appear) + recent pipeline runs, each with its video/client and the
// last few events. The board polls this.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 50) || 50, 200);
    const userId = session.user.id;

    const [projects, runs, pending] = await Promise.all([
      prisma.project.findMany({
        where: { user_id: userId },
        select: { id: true, title: true, client_id: true, auto_update: true, client: { select: { name: true } } },
        orderBy: { updated_at: 'desc' },
      }),
      prisma.pipelineRun.findMany({
        where: { project: { user_id: userId } },
        orderBy: { started_at: 'desc' },
        take: limit,
        include: {
          project: { select: { id: true, title: true, client_id: true, client: { select: { name: true } } } },
          events: { orderBy: { at: 'desc' }, take: 6 },
        },
      }),
      // unresolved cron-detected changes per video -> drives the STALE state
      prisma.pendingScriptEdit.groupBy({
        by: ['project_id'],
        where: { project: { user_id: userId }, status: { in: ['pending', 'accepted'] } },
        _count: { _all: true },
      }),
    ]);
    const pendingBy = new Map(pending.map((x) => [x.project_id, x._count._all]));

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      videos: projects.map((p) => ({
        id: p.id,
        title: p.title,
        clientId: p.client_id,
        client: p.client?.name ?? null,
        pending: pendingBy.get(p.id) ?? 0,
        autoUpdate: p.auto_update, // false = check + email only (manual update)
      })),
      runs: runs.map((r) => ({
        id: r.id,
        projectId: r.project_id,
        video: r.project?.title ?? null,
        clientId: r.project?.client_id ?? null,
        client: r.project?.client?.name ?? null,
        status: r.status,
        path: r.path,
        trigger: r.trigger,
        phase: r.phase,
        detail: r.detail,
        started_at: r.started_at,
        updated_at: r.updated_at,
        finished_at: r.finished_at,
        events: r.events.map((e) => ({ phase: e.phase, status: e.status, detail: e.detail, at: e.at })),
      })),
    });
  } catch (error) {
    console.error('pipeline/runs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
