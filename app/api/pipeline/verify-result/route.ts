import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';

// The local poller posts the verdict from the on-machine verify agent here. For every video the
// agent CONFIRMED is outdated, we queue a normal rebuild RunRequest (the same queue the animation
// pipeline already drains) — that's the "fully automatic" launch. Videos the agent cleared are just
// recorded. Auth: CRON_SECRET bearer.
export const maxDuration = 30;

const DASHBOARD = 'https://tutorial-manager-three.vercel.app/pipeline';

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

type Result = {
  videoId?: string;
  videoTitle?: string;
  affected?: boolean;
  confidence?: string;
  reason?: string;
  evidence?: unknown;
};

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { id?: string; results?: Result[]; error?: string };
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const scan = await prisma.repoScan.findUnique({ where: { id: body.id } });
    if (!scan) return NextResponse.json({ error: 'scan not found' }, { status: 404 });

    // The agent itself failed (couldn't verify) — record and stop; don't launch anything.
    // This is a DEAD END: the watch cursor already advanced past these commits, so nothing
    // will re-check them. Always tell the operator, or the change is silently unreviewed.
    if (body.error) {
      await prisma.repoScan.update({
        where: { id: scan.id },
        data: { status: 'error', detail: body.error.slice(0, 500), finished_at: new Date() },
      });
      await notify(
        `⚠️ Could not check ${scan.repo} @ ${scan.head_sha.slice(0, 7)} — ${body.error.slice(0, 200)}. These commits were NOT reviewed against your videos.`,
        { title: 'Video check FAILED', priority: 'high', click: DASHBOARD }
      );
      return NextResponse.json({ ok: true, status: 'error' });
    }

    const results = Array.isArray(body.results) ? body.results : [];
    const affected = results.filter((r) => r.affected && r.videoId);

    // Queue a rebuild for each confirmed video whose project is still auto-update.
    const launched: string[] = [];
    for (const r of affected) {
      const project = await prisma.project.findFirst({
        where: { id: r.videoId, auto_update: true },
        select: { id: true, title: true },
      });
      if (!project) continue;
      // Dedup: don't stack a second rebuild for the same video+sha already in flight.
      const dup = await prisma.runRequest.findFirst({
        where: { project_id: project.id, sha: scan.head_sha, status: { in: ['queued', 'claimed', 'launched'] } },
        select: { id: true },
      });
      if (dup) { launched.push(project.title); continue; }
      const ev = (r.evidence ?? {}) as Record<string, unknown>;
      await prisma.runRequest.create({
        data: {
          project_id: project.id,
          repo: scan.repo,
          sha: scan.head_sha,
          detail: (r.reason || 'confirmed UI/workflow change').slice(0, 300),
          status: 'queued',
          queued_offline: false,
          // Carry the verifier's finding so the local brief composer knows exactly what to change.
          change: {
            videoTitle: project.title,
            reason: r.reason ?? '',
            confidence: r.confidence ?? '',
            file: typeof ev.file === 'string' ? ev.file : '',
            oldText: typeof ev.oldText === 'string' ? ev.oldText : '',
            newText: typeof ev.newText === 'string' ? ev.newText : '',
            scriptQuote: typeof ev.scriptQuote === 'string' ? ev.scriptQuote : '',
          },
        },
      });
      launched.push(project.title);
    }

    await prisma.repoScan.update({
      where: { id: scan.id },
      data: {
        status: affected.length > 0 ? 'launched' : 'no_change',
        verdict: results as object[],
        detail: affected.length > 0 ? `confirmed: ${launched.join(', ')}` : 'no video affected',
        finished_at: new Date(),
      },
    });

    if (launched.length > 0) {
      await notify(
        `🎬 Confirmed change in ${scan.repo} — auto-rebuilding: ${launched.join(', ')}.`,
        { title: 'Video rebuild launching', priority: 'high', click: DASHBOARD }
      );
    } else {
      // Close the loop on the "checking a change" ping the scan-repo cron already sent.
      // Without this, a clean check is indistinguishable from a check that never ran.
      const checked = results.map((r) => r.videoTitle).filter(Boolean);
      await notify(
        `✅ Checked ${scan.repo} @ ${scan.head_sha.slice(0, 7)} — nothing your videos show has changed.` +
          (checked.length ? ` Cleared: ${checked.join(', ')}.` : ''),
        { title: 'Check complete - all clear', priority: 'low', click: DASHBOARD }
      );
    }
    return NextResponse.json({ ok: true, status: affected.length > 0 ? 'launched' : 'no_change', launched });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 });
  }
}
