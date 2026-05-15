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

    const clients = await prisma.client.findMany({
      where: { monitoring_enabled: true },
      select: { id: true, name: true },
    });

    if (clients.length === 0) {
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

    // Two clients max in v1 — awaiting is fine inside the 60s budget. Each
    // scan-client has its own 60s budget; this entry function returns once all
    // scans return their fan-out summary.
    const results = await Promise.allSettled(
      clients.map((c) =>
        fetch(`${baseUrl}/api/cron/scan-client?clientId=${encodeURIComponent(c.id)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${cronSecret}` },
        }).then((r) => r.json())
      )
    );

    return NextResponse.json({
      clientsTriggered: clients.length,
      results: results.map((r, i) => ({
        clientName: clients[i].name,
        ok: r.status === 'fulfilled',
        value:
          r.status === 'fulfilled'
            ? r.value
            : r.reason instanceof Error
              ? r.reason.message
              : String(r.reason),
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
