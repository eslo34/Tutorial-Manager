import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET ?projectId=… — list pending suggested edits for a project (the cron's
// output, fed into the existing ScriptWithOverlays UI).
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    // Verify ownership via the project's user_id
    const project = await prisma.project.findFirst({
      where: { id: projectId, user_id: session.user.id },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const edits = await prisma.pendingScriptEdit.findMany({
      where: { project_id: projectId, status: 'pending' },
      orderBy: [{ severity: 'asc' }, { detected_at: 'desc' }],
    });

    // Transform to match the overlay shape consumed by ScriptWithOverlays.
    // actual_matched_text is intentionally NOT stored — the client-side fuzzy
    // matcher re-derives it at render time against the current script content.
    const overlays = edits.map((e) => ({
      id: e.id,
      original_text: e.original_text,
      suggested_replacement: e.suggested_replacement,
      reason: e.reason,
      severity: e.severity,
      category: e.category,
      source_url: e.source_url,
      detected_at: e.detected_at,
    }));

    return NextResponse.json({ overlays });
  } catch (error) {
    console.error('pending-edits GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH { editId, action: 'accept' | 'decline' } — records the user's
// decision. Does NOT mutate the script itself — the frontend's existing
// handleAcceptSuggestion handles substitution and calls /api/save-script;
// this route only flips the status.
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { editId, action } = await request.json();
    if (!editId || (action !== 'accept' && action !== 'decline')) {
      return NextResponse.json(
        { error: 'editId and action (accept|decline) required' },
        { status: 400 }
      );
    }

    // Verify ownership via the edit's project's user_id
    const edit = await prisma.pendingScriptEdit.findFirst({
      where: { id: editId, project: { user_id: session.user.id } },
    });
    if (!edit) {
      return NextResponse.json({ error: 'Edit not found' }, { status: 404 });
    }

    const status = action === 'accept' ? 'accepted' : 'declined';
    await prisma.pendingScriptEdit.update({
      where: { id: editId },
      data: { status, resolved_at: new Date() },
    });

    return NextResponse.json({ id: editId, status });
  } catch (error) {
    console.error('pending-edits PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
