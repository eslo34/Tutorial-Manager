import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditScriptAgainstPage } from '@/lib/script-audit';

export const maxDuration = 60;

// Overflow handler: scan-client fans out one (snapshot × project) pair here
// when its own time budget is exhausted. Runs a single Sonnet audit and
// upserts any significant findings as PendingScriptEdit rows.

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { projectId, snapshotId } = await request.json();
    if (!projectId || !snapshotId) {
      return NextResponse.json(
        { error: 'projectId and snapshotId required' },
        { status: 400 }
      );
    }

    const [project, snapshot] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, title: true, script: true },
      }),
      prisma.docPageSnapshot.findUnique({ where: { id: snapshotId } }),
    ]);

    if (!project || !snapshot) {
      return NextResponse.json({ error: 'Project or snapshot not found' }, { status: 404 });
    }
    if (!project.script) {
      return NextResponse.json({ skipped: 'No script on project' });
    }

    const sections = await auditScriptAgainstPage({
      pageUrl: snapshot.url,
      pageTitle: snapshot.title,
      pageContent: snapshot.content_text,
      script: project.script,
    });
    const significant = sections.filter(
      (s) => s.severity === 'critical' || s.severity === 'moderate'
    );

    if (significant.length > 0) {
      await prisma.pendingScriptEdit.createMany({
        data: significant.map((s) => ({
          project_id: project.id,
          source_url: snapshot.url,
          source_snapshot_id: snapshot.id,
          original_text: s.original_text,
          suggested_replacement: s.suggested_replacement,
          reason: s.reason,
          severity: s.severity,
          category: s.category,
        })),
      });
    }

    return NextResponse.json({
      projectId,
      snapshotId,
      editsProposed: significant.length,
    });
  } catch (error) {
    console.error('scan-script failure:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
