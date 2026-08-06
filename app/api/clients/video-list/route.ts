import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeList, mergeTicks, listStats, VideoList } from '@/lib/video-list.mjs';

// The client's internal video list — a private planning note, read and edited
// only in its own modal. Deliberately kept off /api/board: the board polls every
// 4s and this has nothing to do with whether a video is in sync, so shipping it
// on every tick would be pure waste. Loaded on open, like the repo-updates
// dialog next to it.

// Confirm the client belongs to the signed-in user before reading or writing.
async function ownedClient(clientId: string, userId: string) {
  if (!clientId) return null;
  return prisma.client.findFirst({
    where: { id: clientId, user_id: userId },
    select: { id: true, name: true, video_list: true },
  });
}

// GET /api/clients/video-list?clientId=…
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const clientId = req.nextUrl.searchParams.get('clientId') ?? '';
    const client = await ownedClient(clientId, session.user.id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const list = (client.video_list as VideoList | null) ?? null;
    return NextResponse.json({ list, stats: listStats(list) });
  } catch (error) {
    console.error('video-list GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/video-list  { clientId, list, mode? }
//
// mode 'replace' (default) is the UI: it holds the whole list in state, ticks
// included, so what it sends is the truth. mode 'merge' is for a re-import,
// where ticks must survive rows being rewritten upstream.
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { clientId, list, mode = 'replace' } = body ?? {};

    const client = await ownedClient(String(clientId ?? ''), session.user.id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // null clears the list entirely.
    if (list === null) {
      await prisma.client.update({ where: { id: client.id }, data: { video_list: undefined } });
      return NextResponse.json({ list: null, stats: listStats(null) });
    }

    const { source, groups, truncated } = normalizeList(list);

    let merged = groups;
    let mergeInfo: { kept: number; added: number; removed: number } | null = null;
    if (mode === 'merge') {
      const previous = (client.video_list as VideoList | null) ?? null;
      const result = mergeTicks(groups, previous);
      merged = result.groups;
      mergeInfo = { kept: result.kept, added: result.added, removed: result.removed };
    }

    const saved: VideoList = {
      source: source || ((client.video_list as VideoList | null)?.source ?? ''),
      updatedAt: new Date().toISOString(),
      groups: merged,
    };

    await prisma.client.update({
      where: { id: client.id },
      // Prisma types a Json column's input as InputJsonValue; our shape is a
      // plain serialisable object, so the cast is safe and keeps VideoList as
      // the type the rest of the file reasons about.
      data: { video_list: saved as unknown as object },
    });

    return NextResponse.json({ list: saved, stats: listStats(saved), truncated, merge: mergeInfo });
  } catch (error) {
    console.error('video-list PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
