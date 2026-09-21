import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeNotes, summarize } from '@/lib/work-log.mjs';

// The time behind one video — the timer, its sessions and the note. Read and
// edited only in the video page's "Time" modal; the page's own poll carries
// just the running session and total (see /api/pipeline/video/[id]) so the
// header can tick without this payload.
//
//   GET    → everything the modal shows
//   PATCH  { notes }                          the per-video free text
//   POST   { action: 'start' }                start the timer (stops any other running one)
//          { action: 'stop' }                 stop it
//          { action: 'add', startedAt, endedAt }   type in a stretch that went untracked
//          { action: 'delete', sessionId }

async function owned(id: string, userId: string) {
  return prisma.project.findFirst({
    where: { id, user_id: userId },
    select: { id: true, work_notes: true },
  });
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function payload(projectId: string, notes: string | null) {
  const sessions = await prisma.workSession.findMany({
    where: { project_id: projectId },
    orderBy: { started_at: 'desc' },
    select: { id: true, started_at: true, ended_at: true },
  });
  const sum = summarize(sessions);
  return {
    sessions,
    running: sum.running,
    total_sec: sum.total_sec,
    days_worked: sum.days_worked,
    notes: notes ?? '',
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return bad('Unauthorized', 401);
  const project = await owned(params.id, session.user.id);
  if (!project) return bad('Not found', 404);
  try {
    return NextResponse.json(await payload(project.id, project.work_notes));
  } catch (error) {
    return bad(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return bad('Unauthorized', 401);
  const project = await owned(params.id, session.user.id);
  if (!project) return bad('Not found', 404);
  try {
    const body = await req.json().catch(() => ({}));
    if (!('notes' in body)) return bad('Nothing to update');
    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { work_notes: normalizeNotes(body.notes) },
      select: { work_notes: true },
    });
    return NextResponse.json({ notes: updated.work_notes ?? '' });
  } catch (error) {
    return bad(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return bad('Unauthorized', 401);
  const userId = session.user.id;
  const project = await owned(params.id, userId);
  if (!project) return bad('Not found', 404);

  try {
    const body = await req.json().catch(() => ({}));
    const now = new Date();
    let stoppedElsewhere: string[] = [];

    switch (body.action) {
      case 'start': {
        // You can only be doing one thing at a time, so a timer left running on
        // another video is closed here rather than silently counting on.
        const others = await prisma.workSession.findMany({
          where: { ended_at: null, project: { user_id: userId } },
          select: { id: true, project_id: true, project: { select: { title: true } } },
        });
        if (others.length > 0) {
          await prisma.workSession.updateMany({
            where: { id: { in: others.map((o) => o.id) } },
            data: { ended_at: now },
          });
          stoppedElsewhere = others.filter((o) => o.project_id !== project.id).map((o) => o.project.title);
        }
        await prisma.workSession.create({ data: { project_id: project.id, started_at: now } });
        break;
      }
      case 'stop': {
        const r = await prisma.workSession.updateMany({
          where: { project_id: project.id, ended_at: null },
          data: { ended_at: now },
        });
        if (r.count === 0) return bad('No timer is running on this video', 409);
        break;
      }
      case 'add': {
        const startedAt = parseDate(body.startedAt);
        const endedAt = parseDate(body.endedAt);
        if (!startedAt || !endedAt) return bad('startedAt and endedAt must be valid dates');
        if (endedAt <= startedAt) return bad('The end must come after the start');
        await prisma.workSession.create({
          data: { project_id: project.id, started_at: startedAt, ended_at: endedAt },
        });
        break;
      }
      case 'delete': {
        const r = await prisma.workSession.deleteMany({
          where: { id: String(body.sessionId ?? ''), project_id: project.id },
        });
        if (r.count === 0) return bad('Session not found', 404);
        break;
      }
      default:
        return bad('action must be one of start | stop | add | delete');
    }

    const out = await payload(project.id, project.work_notes);
    return NextResponse.json({ ...out, stopped_elsewhere: stoppedElsewhere });
  } catch (error) {
    return bad(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
