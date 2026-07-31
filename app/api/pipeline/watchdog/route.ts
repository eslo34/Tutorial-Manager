import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';

// The SILENT-RUNNER alarm. Everything else in the chain self-heals: a queued job survives the PC
// being off, and the local task restarts the poller within 5 min if it dies. What nothing catches
// is the runner going quiet while work is WAITING — the queue just stops draining and the dashboard
// keeps saying "updating". This endpoint notices and pushes to the phone.
//
// It only fires when there is actually something to lose: work in flight AND a silent runner. A
// silent runner with an empty queue is just a computer that's off, which is normal and not news.
// One alert per outage (RunnerHeartbeat.alerted_at), cleared by the next heartbeat.
//
// Auth: CRON_SECRET bearer. Called by the daily cron, and safe to call as often as you like from
// any external pinger for tighter alerting.
export const maxDuration = 30;

const SILENT_MIN = Number(process.env.SBS_RUNNER_SILENT_MIN || 30); // silence before it counts as down
const VERIFY_STUCK_MIN = Number(process.env.SBS_VERIFY_STUCK_MIN || 30); // a verify normally finishes in ~1 min
const IN_FLIGHT = ['queued', 'claimed', 'launched'];
const DASHBOARD = 'https://tutorial-manager-three.vercel.app/pipeline';

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

// A verify job the poller CLAIMED but never reported back on — the machine slept mid-run, the
// poller died, or the headless agent hung. verify-result never fires, so neither the all-clear nor
// the failure ping does either; claim-verify only hands out 'pending', so it's never retried. This
// is the one hole where a change silently goes unreviewed with no signal at all. Mark it errored
// (terminal, so this can't nag) and say so.
async function sweepStuckVerifies() {
  const cutoff = new Date(Date.now() - VERIFY_STUCK_MIN * 60000);
  const stuck = await prisma.repoScan.findMany({
    where: { status: 'claimed', claimed_at: { lt: cutoff } },
    orderBy: { created_at: 'asc' },
  });
  if (stuck.length === 0) return { stuckVerifies: 0 };

  await prisma.repoScan.updateMany({
    where: { id: { in: stuck.map((s) => s.id) } },
    data: {
      status: 'error',
      detail: `verify never reported back (claimed >${VERIFY_STUCK_MIN} min ago)`,
      finished_at: new Date(),
    },
  });
  const repos = Array.from(new Set(stuck.map((s) => s.repo)));
  await notify(
    `⚠️ ${stuck.length} code check${stuck.length === 1 ? '' : 's'} (${repos.join(', ')}) started on your machine but never finished. Those commits were NOT reviewed against your videos.`,
    { title: 'Video check never finished', priority: 'high', click: DASHBOARD }
  );
  return { stuckVerifies: stuck.length, stuckRepos: repos };
}

async function handle() {
  // Runs regardless of runner liveness — a verify can stall while the poller keeps heartbeating.
  const verifySweep = await sweepStuckVerifies();

  const [hb, waiting] = await Promise.all([
    prisma.runnerHeartbeat.findFirst({ orderBy: { last_seen_at: 'desc' } }),
    prisma.runRequest.findMany({
      where: { status: { in: IN_FLIGHT } },
      orderBy: { created_at: 'asc' },
      include: { project: { select: { title: true } } },
    }),
  ]);

  const silentMs = hb ? Date.now() - new Date(hb.last_seen_at).getTime() : Infinity;
  const silentMin = Math.round(silentMs / 60000);
  const silent = silentMin >= SILENT_MIN;

  if (!silent || waiting.length === 0) {
    return {
      ...verifySweep,
      alerted: false,
      silentMin: hb ? silentMin : null,
      waiting: waiting.length,
      reason: !silent ? 'runner is alive' : 'runner is quiet but nothing is waiting',
    };
  }

  // Already told them about THIS outage — don't nag every tick.
  if (hb?.alerted_at && new Date(hb.alerted_at) > new Date(hb.last_seen_at)) {
    return { ...verifySweep, alerted: false, silentMin, waiting: waiting.length, reason: 'already alerted for this outage' };
  }

  const titles = Array.from(new Set(waiting.map((w) => w.project.title)));
  const hours = silentMin >= 120 ? `${Math.round(silentMin / 60)}h` : `${silentMin} min`;
  const list = titles.slice(0, 3).join(', ') + (titles.length > 3 ? ` +${titles.length - 3} more` : '');
  await notify(
    `⚠️ ${waiting.length} update${waiting.length === 1 ? '' : 's'} waiting (${list}) but your computer's runner has been silent for ${hours}. Start it, or it'll run when the PC is next on.`,
    { title: 'Runner offline - work is waiting', priority: 'high', click: DASHBOARD }
  );
  if (hb) {
    await prisma.runnerHeartbeat.update({ where: { id: hb.id }, data: { alerted_at: new Date() } });
  }
  return { ...verifySweep, alerted: true, silentMin, waiting: waiting.length, videos: titles };
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json(await handle());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 });
  }
}

// Vercel cron fires GET; external pingers usually do too.
export async function GET(req: NextRequest) {
  return POST(req);
}
