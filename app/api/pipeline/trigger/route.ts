import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';

// GitHub webhook (push) for a watched repo (OD-Test). Verifies the HMAC signature, queues a
// RunRequest for the target video, and pings the phone: "launching now" if the local runner is
// online (recent heartbeat), else "it'll run when your computer next starts". The local poller
// does the actual pull + brief + launch — this endpoint only detects + queues + notifies.
export const maxDuration = 30;

const HEARTBEAT_FRESH_MS = 2 * 60 * 1000;
const VIDEO_TITLE = process.env.SBS_VIDEO || 'Using Versions';
const WATCH_BRANCH = 'refs/heads/main';
const DASHBOARD = 'https://tutorial-manager-three.vercel.app/pipeline';

function verify(raw: string, sig: string | null, secret: string): boolean {
  if (!sig) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const raw = await req.text();
  if (!secret || !verify(raw, req.headers.get('x-hub-signature-256'), secret)) {
    return NextResponse.json({ error: 'bad signature' }, { status: 401 });
  }

  const event = req.headers.get('x-github-event');
  if (event === 'ping') return NextResponse.json({ ok: true, pong: true });
  if (event !== 'push') return NextResponse.json({ ok: true, ignored: event });

  let p: { ref?: string; after?: string; deleted?: boolean; repository?: { full_name?: string }; head_commit?: { message?: string } };
  try {
    p = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }
  if (p.ref !== WATCH_BRANCH || p.deleted) return NextResponse.json({ ok: true, ignored: `ref ${p.ref}` });
  const sha = p.after ?? '';
  if (!sha || /^0+$/.test(sha)) return NextResponse.json({ ok: true, ignored: 'no sha' });
  const repo = p.repository?.full_name ?? 'unknown';
  const msg = (p.head_commit?.message ?? '').split('\n')[0].slice(0, 200);

  const project = await prisma.project.findFirst({
    where: { title: VIDEO_TITLE },
    orderBy: { updated_at: 'desc' },
    select: { id: true, title: true, auto_update: true },
  });
  if (!project) return NextResponse.json({ error: `no project "${VIDEO_TITLE}"` }, { status: 404 });

  // Notify-only video (not built in the editor): the original system owns it —
  // the daily check audits the script and emails a digest. Never queue a run.
  if (!project.auto_update) {
    return NextResponse.json({ ok: true, skipped: 'notify-only', video: project.title });
  }

  // Idempotent against webhook redelivery: skip if this sha is already in flight.
  const dup = await prisma.runRequest.findFirst({
    where: { project_id: project.id, sha, status: { in: ['queued', 'claimed', 'launched'] } },
    select: { id: true },
  });
  if (dup) return NextResponse.json({ ok: true, deduped: dup.id });

  // Is the local runner online? (poller heartbeat within the last couple minutes)
  const hb = await prisma.runnerHeartbeat.findFirst({ orderBy: { last_seen_at: 'desc' }, select: { last_seen_at: true } });
  const online = !!hb && Date.now() - new Date(hb.last_seen_at).getTime() < HEARTBEAT_FRESH_MS;

  const rr = await prisma.runRequest.create({
    data: { project_id: project.id, repo, sha, ref: p.ref, detail: msg, queued_offline: !online, status: 'queued' },
  });

  const short = sha.slice(0, 7);
  if (online) {
    await notify(`🎬 ${repo} changed (${short}) — auto-updating "${project.title}" now.`, {
      title: `Updating ${project.title}`,
      priority: 'default',
      click: DASHBOARD,
    });
  } else {
    await notify(`🕓 ${repo} changed (${short}). "${project.title}" will auto-update the next time your computer starts.`, {
      title: `${project.title} queued`,
      priority: 'default',
      click: DASHBOARD,
    });
  }
  return NextResponse.json({ ok: true, queued: rr.id, online });
}
