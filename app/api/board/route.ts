import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/board — everything the merged UI needs in one poll: clients (including
// ones with no videos yet), every video with its edit counts split by status, and
// recent pipeline runs. Replaces the old /api/pipeline/runs, which only knew about
// clients that already had videos and collapsed pending+accepted into one number.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const [clients, projects, runs, editCounts] = await Promise.all([
      prisma.client.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'asc' },
        select: {
          id: true, name: true, company: true, created_at: true,
          repo_watch: { select: { owner: true, name: true, enabled: true } },
        },
      }),
      prisma.project.findMany({
        where: { user_id: userId },
        orderBy: { updated_at: 'desc' },
        // Deliberately no `script` here — the board polls every 4s and never renders
        // script bodies, so selecting them would ship every script on every tick.
        // The video page fetches its own script from /api/pipeline/video/[id].
        select: {
          id: true, title: true, description: true, client_id: true, auto_update: true,
          editor_project: true, updated_at: true,
          client: { select: { name: true } },
        },
      }),
      prisma.pipelineRun.findMany({
        where: { project: { user_id: userId } },
        orderBy: { started_at: 'desc' },
        take: 100,
        include: {
          project: { select: { id: true, title: true, client_id: true, client: { select: { name: true } } } },
          events: { orderBy: { at: 'desc' }, take: 6 },
        },
      }),
      // Split by status: 'pending' needs a decision, 'accepted' needs re-recording,
      // 'auto_applied' is informational. Collapsing these was what made the old
      // badge silently ignore everything the animation pipeline did.
      prisma.pendingScriptEdit.groupBy({
        by: ['project_id', 'status'],
        where: { project: { user_id: userId }, status: { in: ['pending', 'accepted', 'auto_applied'] } },
        _count: { _all: true },
      }),
    ]);

    const countFor = (projectId: string, status: string) =>
      editCounts.find((c) => c.project_id === projectId && c.status === status)?._count._all ?? 0;

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      clients: clients.map((c) => ({
        id: c.id,
        name: c.name,
        company: c.company,
        createdAt: c.created_at,
        repoWatch: c.repo_watch
          ? { owner: c.repo_watch.owner, name: c.repo_watch.name, enabled: c.repo_watch.enabled }
          : null,
      })),
      videos: projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        clientId: p.client_id,
        client: p.client?.name ?? null,
        pending: countFor(p.id, 'pending'),
        accepted: countFor(p.id, 'accepted'),
        autoApplied: countFor(p.id, 'auto_applied'),
        autoUpdate: p.auto_update,
        editorProject: p.editor_project,
        updatedAt: p.updated_at,
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
    console.error('board error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
