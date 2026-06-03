import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { shouldIncludeFile, normalizeRepoPath, MAX_TOTAL_FILES } from '@/lib/repo';

export const maxDuration = 60;

interface IncomingFile {
  path: string;
  content: string;
}

// GET: report the current repo state for a client (file count + last sync).
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, user_id: session.user.id },
      include: { _count: { select: { repo_files: true } } },
    });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      repoLabel: client.repo_label,
      repoSource: client.repo_source,
      repoSyncedAt: client.repo_synced_at,
      fileCount: client._count.repo_files,
      tree: (client.repo_tree as string[] | null) ?? [],
    });
  } catch (error) {
    console.error('Error fetching repo status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: ingest a batch of uploaded files. The client sends files in batches to
// stay under request-size limits:
//   first batch: { clientId, label, source, clear: true, files }
//   middle:      { clientId, files }
//   last:        { clientId, files, final: true }
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, label, source, clear, final } = body as {
      clientId?: string;
      label?: string;
      source?: string;
      clear?: boolean;
      final?: boolean;
    };
    const files: IncomingFile[] = Array.isArray(body.files) ? body.files : [];

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    // Ownership check.
    const client = await prisma.client.findFirst({
      where: { id: clientId, user_id: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // First batch wipes any previously uploaded repo so a re-sync replaces it.
    if (clear) {
      await prisma.repoFile.deleteMany({ where: { client_id: clientId } });
      await prisma.client.update({
        where: { id: clientId },
        data: {
          repo_label: label ?? null,
          repo_source: source ?? null,
          repo_tree: [],
          repo_synced_at: null,
        },
      });
    }

    // Server-side guard: re-apply the filter and normalize paths even though the
    // client already filtered, then dedupe within this batch.
    const seen = new Set<string>();
    const rows: { client_id: string; path: string; content: string; size: number }[] = [];
    for (const f of files) {
      if (!f || typeof f.path !== 'string' || typeof f.content !== 'string') continue;
      const path = normalizeRepoPath(f.path);
      const size = Buffer.byteLength(f.content, 'utf8');
      if (!shouldIncludeFile(path, size)) continue;
      if (seen.has(path)) continue;
      seen.add(path);
      rows.push({ client_id: clientId, path, content: f.content, size });
    }

    if (rows.length > 0) {
      // Enforce the overall file cap.
      const existingCount = await prisma.repoFile.count({ where: { client_id: clientId } });
      const room = Math.max(0, MAX_TOTAL_FILES - existingCount);
      const toInsert = rows.slice(0, room);
      if (toInsert.length > 0) {
        await prisma.repoFile.createMany({ data: toInsert, skipDuplicates: true });
      }
    }

    // On the final batch, snapshot the full path list onto the client for the
    // AI's file picker and stamp the sync time.
    if (final) {
      const all = await prisma.repoFile.findMany({
        where: { client_id: clientId },
        select: { path: true },
        orderBy: { path: 'asc' },
      });
      await prisma.client.update({
        where: { id: clientId },
        data: {
          repo_tree: all.map((r) => r.path),
          repo_synced_at: new Date(),
        },
      });
      return NextResponse.json({ success: true, fileCount: all.length });
    }

    const fileCount = await prisma.repoFile.count({ where: { client_id: clientId } });
    return NextResponse.json({ success: true, fileCount });
  } catch (error) {
    console.error('Error uploading repo files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
