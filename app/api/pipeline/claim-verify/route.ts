import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// The local poller calls this to grab the next local-verify job (a RepoScan the cloud queued when a
// local_verify watch saw new commits). It returns the diff + the client's auto-update videos with
// their scripts, so the on-machine Claude Code agent has everything it needs to judge which videos a
// change outdates — WITHOUT any Anthropic API call. Serialized: a claimed scan won't be handed out
// again. Auth: CRON_SECRET bearer.
export const maxDuration = 30;

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pending = await prisma.repoScan.findMany({ where: { status: 'pending' }, orderBy: { created_at: 'asc' } });
    for (const s of pending) {
      const res = await prisma.repoScan.updateMany({
        where: { id: s.id, status: 'pending' },
        data: { status: 'claimed', claimed_at: new Date() },
      });
      if (res.count !== 1) continue; // lost the race
      const videos = await prisma.project.findMany({
        where: { client_id: s.client_id, auto_update: true, script: { not: null } },
        select: { id: true, title: true, script: true, editor_project: true },
      });
      return NextResponse.json({
        job: {
          id: s.id,
          repo: s.repo,
          baseSha: s.base_sha,
          headSha: s.head_sha,
          changedFiles: s.changed_files,
          commitMessages: s.commit_messages,
          videos: videos.map((v) => ({ id: v.id, title: v.title, script: v.script, editorProject: v.editor_project })),
        },
      });
    }
    return NextResponse.json({ job: null });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 });
  }
}
