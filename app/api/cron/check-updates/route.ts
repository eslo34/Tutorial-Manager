import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

// Re-entrancy guard: if a CheckRun started within the last 5 minutes is still
// 'running', skip this invocation entirely. Prevents the daily cron and a
// manual "Run now" trigger from doubling up.
const RECENT_RUN_THRESHOLD_MS = 5 * 60 * 1000;

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const auth = request.headers.get('authorization');
  if (auth && process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }
  // Allow a logged-in session for manual "Run now" triggers from the browser.
  const session = await getServerSession(authOptions);
  return !!session?.user?.id;
}

async function handle(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recent = await prisma.checkRun.findFirst({
      where: {
        status: 'running',
        started_at: { gte: new Date(Date.now() - RECENT_RUN_THRESHOLD_MS) },
      },
      orderBy: { started_at: 'desc' },
    });
    if (recent) {
      return NextResponse.json({
        skipped: true,
        reason: 'A run is already in progress',
        runId: recent.id,
      });
    }

    const monitoringClients = await prisma.client.findMany({
      where: { monitoring_enabled: true },
      select: { id: true, name: true },
    });

    // Clients that watch a GitHub repo for feature-doc changes. This is a
    // separate flow from doc-crawl monitoring — a client may have either, both,
    // or neither.
    const repoWatches = await prisma.repoWatch.findMany({
      where: { enabled: true },
      select: { client_id: true, client: { select: { name: true } } },
    });

    if (monitoringClients.length === 0 && repoWatches.length === 0) {
      return NextResponse.json({ clientsTriggered: 0 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const cronSecret = process.env.CRON_SECRET;
    if (!baseUrl || !cronSecret) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_BASE_URL or CRON_SECRET missing' },
        { status: 500 }
      );
    }

    // Propagate `?force=1` to scan-client so the test harness can bypass the
    // Haiku gate end-to-end.
    const forceSuffix =
      new URL(request.url).searchParams.get('force') === '1' ? '&force=1' : '';

    const settle = (r: PromiseSettledResult<unknown>) =>
      r.status === 'fulfilled'
        ? r.value
        : r.reason instanceof Error
          ? r.reason.message
          : String(r.reason);

    // Each scan-* has its own 60s budget; this entry returns once all fan-out
    // summaries come back.
    const docResults = await Promise.allSettled(
      monitoringClients.map((c) =>
        fetch(`${baseUrl}/api/cron/scan-client?clientId=${encodeURIComponent(c.id)}${forceSuffix}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${cronSecret}` },
        }).then((r) => r.json())
      )
    );

    const repoResults = await Promise.allSettled(
      repoWatches.map((w) =>
        fetch(`${baseUrl}/api/cron/scan-repo?clientId=${encodeURIComponent(w.client_id)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${cronSecret}` },
        }).then((r) => r.json())
      )
    );

    return NextResponse.json({
      docClientsTriggered: monitoringClients.length,
      repoClientsTriggered: repoWatches.length,
      docResults: docResults.map((r, i) => ({
        clientName: monitoringClients[i].name,
        ok: r.status === 'fulfilled',
        value: settle(r),
      })),
      repoResults: repoResults.map((r, i) => ({
        clientName: repoWatches[i].client.name,
        ok: r.status === 'fulfilled',
        value: settle(r),
      })),
    });
  } catch (error) {
    console.error('check-updates entry error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Vercel cron fires GET; manual curl typically uses POST. Support both.
export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
