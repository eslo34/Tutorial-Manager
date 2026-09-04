import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/pipeline/brief — the animation pipeline files its plain-language
// "what changed" note for a finished update. Auth: CRON_SECRET bearer (a machine
// caller, like /api/pipeline/event and /api/pipeline/script-edit).
//
// Body: { runId? | projectId? | video?, headline, items: [{ what, where?, at?, note? }] }
//   headline — one sentence, no jargon: what changed in the PRODUCT.
//   items[].what  — the concrete change ("Save is now Publish, in the record header")
//   items[].where — where in the product it lives ("EPD record page, top right")
//   items[].at    — timecode INTO THE FINISHED FILM ("1:24" or "1:24–1:38"), so the
//                   founder can jump straight to the seconds that changed.
//   items[].note  — anything worth flagging ("voiceover re-recorded for this line")
//
// Stored on the run (PipelineRun.brief) and rendered at the top of the video's
// script page. One brief per run: filing again overwrites it, so the agent can
// correct itself. Nothing here fails a run — the caller is best-effort.

export const maxDuration = 30;

const MAX_ITEMS = 12;
const MAX_LEN = 400;

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

// Trim + cap, and turn anything empty into undefined so the UI never renders a
// blank row or a stray dash.
function str(v: unknown, max = MAX_LEN): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  if (!t) return undefined;
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { runId, projectId, video, headline, items } = body ?? {};

    const head = str(headline, 600);
    const list = (Array.isArray(items) ? items : [])
      .map((i) => ({
        what: str(i?.what),
        where: str(i?.where),
        at: str(i?.at, 40),
        note: str(i?.note),
      }))
      .filter((i) => !!i.what)
      .slice(0, MAX_ITEMS);

    if (!head && list.length === 0) {
      return NextResponse.json({ error: 'headline or items[] required' }, { status: 400 });
    }

    // Resolve the run: by id, else the newest run of the resolved project. The
    // agent normally passes the runId it has been reporting events against; the
    // project fallback keeps the note landing even if .run-id was lost mid-run.
    let run = runId
      ? await prisma.pipelineRun.findUnique({ where: { id: runId }, select: { id: true, project_id: true } })
      : null;

    if (!run) {
      let pid: string | undefined = typeof projectId === 'string' ? projectId : undefined;
      if (!pid && video) {
        const p = await prisma.project.findFirst({
          where: { title: video },
          orderBy: { updated_at: 'desc' },
          select: { id: true },
        });
        pid = p?.id;
      }
      if (!pid) {
        return NextResponse.json(
          { error: `No run or project for "${video ?? projectId ?? runId ?? '(none)'}"` },
          { status: 404 }
        );
      }
      run = await prisma.pipelineRun.findFirst({
        where: { project_id: pid },
        orderBy: { started_at: 'desc' },
        select: { id: true, project_id: true },
      });
      if (!run) {
        return NextResponse.json({ error: `No pipeline run for project ${pid}` }, { status: 404 });
      }
    }

    await prisma.pipelineRun.update({
      where: { id: run.id },
      data: { brief: { headline: head ?? null, items: list }, brief_at: new Date() },
    });

    return NextResponse.json({ runId: run.id, items: list.length });
  } catch (error) {
    console.error('pipeline/brief error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
