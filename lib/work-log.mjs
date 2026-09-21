// ── Time tracking: the hours behind each video ──────────────────────────────
//
// The whole model is two things. A WorkSession row is one stretch of work on a
// video (the timer is a row with no ended_at; a stretch typed in by hand for
// untracked time is a row with both ends). Project.work_notes is one free-text
// note per video — what made it slow or fast, what was charged, whatever a
// pricing review should know.
//
// buildReport() assembles all of it — every video with its total, its
// sessions, its note, plus per-client and grand totals — and is what both the
// MCP server's get_time_report and GET /api/work/report return, so an AI asked
// "what should I charge" gets the same picture whichever door it comes in by.
//
// Plain .mjs so the dependency-free MCP server can import it alongside the Next
// app instead of keeping a second copy that drifts (same as video-list.mjs).

const MAX_NOTES = 20000;

// The per-video free-text note; keeps newlines.
export function normalizeNotes(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).replace(/\r\n/g, '\n').trim();
  if (!s) return null;
  return s.length > MAX_NOTES ? s.slice(0, MAX_NOTES) : s;
}

// Seconds in one session; a running one counts up to `now`.
export function secondsOf(session, now = Date.now()) {
  const start = new Date(session.started_at).getTime();
  const end = session.ended_at ? new Date(session.ended_at).getTime() : now;
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 1000));
}

// Totals across a video's sessions.
export function summarize(sessions, now = Date.now()) {
  let total_sec = 0;
  let running = null;
  const days = new Set();
  let first = null;
  let last = null;
  for (const s of sessions) {
    total_sec += secondsOf(s, now);
    if (!s.ended_at) running = s;
    const startIso = new Date(s.started_at).toISOString();
    days.add(startIso.slice(0, 10));
    if (!first || startIso < first) first = startIso;
    const endIso = s.ended_at ? new Date(s.ended_at).toISOString() : new Date(now).toISOString();
    if (!last || endIso > last) last = endIso;
  }
  return { total_sec, running, sessions: sessions.length, days_worked: days.size, first_worked_at: first, last_worked_at: last };
}

// "1h 08m" / "42m" / "0m" — for totals.
export function fmtDuration(sec) {
  const m = Math.round(sec / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm}m`;
  return `${h}h ${String(mm).padStart(2, '0')}m`;
}

// "0:12:33" — for a ticking timer.
export function fmtClock(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function minutes(sec) {
  return Math.round(sec / 60);
}

function hours(sec) {
  return Math.round((sec / 3600) * 10) / 10;
}

// The whole picture, for pricing decisions. `userId` scopes it to one account
// (the web API); the local MCP server passes none and sees everything. `client`
// filters by client name/company substring. Each video's individual sessions
// are left out unless asked for — the per-video total and note are what a
// pricing question needs, and every session of every video is a lot of tokens
// for an AI to carry.
export async function buildReport(prisma, { userId, client, includeSessions } = {}) {
  const now = Date.now();
  const where = {};
  if (userId) where.user_id = userId;
  if (client) {
    where.client = {
      OR: [
        { name: { contains: client, mode: 'insensitive' } },
        { company: { contains: client, mode: 'insensitive' } },
      ],
    };
  }
  const projects = await prisma.project.findMany({
    where,
    orderBy: [{ client_id: 'asc' }, { created_at: 'asc' }],
    select: {
      id: true, title: true, status: true, video_type: true, source_type: true,
      client_id: true, created_at: true, work_notes: true,
      client: { select: { name: true, company: true } },
      work_sessions: { orderBy: { started_at: 'asc' } },
    },
  });

  const clients = new Map();
  let grandSec = 0;
  let tracked = 0;
  const videos = [];

  for (const p of projects) {
    const sum = summarize(p.work_sessions, now);
    const video = {
      id: p.id,
      title: p.title,
      client: p.client?.name ?? null,
      client_id: p.client_id,
      status: p.status,
      video_type: p.video_type,
      source_type: p.source_type,
      created_at: p.created_at,
      total_min: minutes(sum.total_sec),
      total_hours: hours(sum.total_sec),
      sessions: sum.sessions,
      days_worked: sum.days_worked,
      first_worked_at: sum.first_worked_at,
      last_worked_at: sum.last_worked_at,
      timer_running: !!sum.running,
      notes: p.work_notes ?? null,
    };
    if (includeSessions) {
      video.session_list = p.work_sessions.map((s) => ({
        started_at: s.started_at,
        ended_at: s.ended_at,
        min: minutes(secondsOf(s, now)),
      }));
    }
    videos.push(video);

    grandSec += sum.total_sec;
    if (sum.total_sec > 0) tracked++;

    let c = clients.get(p.client_id);
    if (!c) {
      c = { id: p.client_id, name: p.client?.name ?? null, company: p.client?.company ?? null, videos: 0, tracked_videos: 0, total_sec: 0 };
      clients.set(p.client_id, c);
    }
    c.videos++;
    if (sum.total_sec > 0) c.tracked_videos++;
    c.total_sec += sum.total_sec;
  }

  const trackedMins = videos.filter((v) => v.total_min > 0).map((v) => v.total_min);
  return {
    generated_at: new Date(now).toISOString(),
    how_to_read:
      'total_min / total_hours are tracked working time per video (timer runs plus stretches typed in by hand). ' +
      'notes is the free text written on the video: what made it slow or fast, what was charged, and so on. ' +
      'A video with total_min 0 was never tracked. timer_running means a stretch is still open and counting.',
    totals: {
      videos: projects.length,
      tracked_videos: tracked,
      total_min: minutes(grandSec),
      total_hours: hours(grandSec),
      avg_min_per_tracked_video: trackedMins.length ? Math.round(trackedMins.reduce((a, b) => a + b, 0) / trackedMins.length) : null,
    },
    clients: [...clients.values()].map((c) => ({
      id: c.id,
      name: c.name,
      company: c.company,
      videos: c.videos,
      tracked_videos: c.tracked_videos,
      total_min: minutes(c.total_sec),
      total_hours: hours(c.total_sec),
    })),
    videos,
  };
}
