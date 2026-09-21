import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildReport } from '@/lib/work-log.mjs';

// GET /api/work/report[?client=…][&sessions=1] — the whole time-tracking picture
// as one JSON document: every video's tracked minutes and notes, with client
// and grand totals. The same report the local MCP server's get_time_report
// returns, for an AI that isn't running through Claude Code (save it and hand
// it over).
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const url = new URL(req.url);
    const report = await buildReport(prisma, {
      userId: session.user.id,
      client: url.searchParams.get('client') ?? undefined,
      includeSessions: url.searchParams.get('sessions') === '1',
    });
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
