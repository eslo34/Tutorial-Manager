// ── One state model for the whole app ───────────────────────────────────────
// Before the merge there were two: the board's videoState() and the old
// dashboard's pendingEditsCount badge, which disagreed about what "needs
// attention" meant. Everything now derives from the types + functions here.

export type Kind = 'sync' | 'render' | 'review' | 'stale';

export type Evt = { phase: string; status: string; detail: string | null; at: string };

export type Run = {
  id: string;
  projectId: string;
  video: string | null;
  clientId: string | null;
  client: string | null;
  status: string; // running | ready_for_review | reviewed | halted | error | done
  path: string | null;
  trigger: string | null;
  phase: string | null;
  detail: string | null;
  started_at: string;
  updated_at: string;
  finished_at: string | null;
  events: Evt[];
};

export type Video = {
  id: string;
  title: string;
  description: string;
  clientId: string | null;
  client: string | null;
  // Split by status so the UI can tell "you must act" from "already handled".
  pending: number;      // status 'pending'      → needs accept/decline
  accepted: number;     // status 'accepted'     → applied, awaiting re-recording
  autoApplied: number;  // status 'auto_applied' → pipeline already did it, informational
  autoUpdate: boolean;  // false = MANUAL: check + email, you update the video
  editorProject: string | null;
  updatedAt: string;
};

export type ClientRow = {
  id: string;
  name: string;
  company: string;
  createdAt: string;
  repoWatch: { owner: string; name: string; enabled: boolean } | null;
};

export type Board = {
  generatedAt: string;
  clients: ClientRow[];
  videos: Video[];
  runs: Run[];
};

export type Change = {
  id: string;
  original_text: string;
  suggested_replacement: string;
  reason: string;
  severity: string;
  category: string;
  source_url: string;
  status: string;
  detected_at: string;
};

export const PHASES = [
  'detect', 'brief', 'editing', 'written', 'reference',
  'render', 'splice', 'proxy', 'beats', 'resync', 'ready',
];

// A run is only "live" while the machine is actually working on it.
export function isActive(run: Run | undefined): boolean {
  return run?.status === 'running' || run?.status === 'halted';
}

/**
 * The single source of truth for "what's up with this video".
 *
 * Precedence, most urgent first:
 *   1. machine is working        → render  (nothing for you to do yet)
 *   2. machine broke             → stale   (needs intervention)
 *   3. edits waiting on you      → review  (accept/decline, or re-record)
 *   4. a run finished            → review  (approve the result)
 *   5. otherwise                 → sync
 *
 * Note (3) now outranks (4): previously a finished run rendered green even when
 * unreviewed script edits were queued behind it, which hid real work.
 */
export function videoState(video: Video, latest: Run | undefined): { kind: Kind; label: string } {
  if (latest?.status === 'running') {
    return { kind: 'render', label: (latest.phase ?? 'updating').toUpperCase() };
  }
  if (latest?.status === 'halted') return { kind: 'stale', label: 'HALTED' };
  if (latest?.status === 'error') return { kind: 'stale', label: 'ERROR' };

  const ready = latest?.status === 'ready_for_review';

  if (video.pending > 0) {
    return {
      kind: 'review',
      label: ready
        ? `READY · ${video.pending} TO REVIEW`
        : `${video.pending} CHANGE${video.pending > 1 ? 'S' : ''} TO REVIEW`,
    };
  }
  if (video.accepted > 0) {
    return { kind: 'review', label: `${video.accepted} TO RE-RECORD` };
  }
  if (ready) return { kind: 'review', label: 'READY FOR REVIEW' };
  return { kind: 'sync', label: 'IN SYNC' };
}

// One-line explanation under the pill. Mode-aware: a MANUAL video is never
// auto-updated, so "changes waiting" means a person has to act, not a robot.
export function videoFoot(video: Video, latest: Run | undefined): string {
  if (latest?.status === 'running') return latest.detail ?? 'pipeline is working…';
  if (video.pending > 0) {
    return video.autoUpdate
      ? 'script changes need your call'
      : 'change detected · emailed · review + re-record';
  }
  if (video.accepted > 0) return 'accepted · waiting on re-recording';
  if (latest?.status === 'ready_for_review') return 'pipeline finished · approve the result';
  if (latest) return `updated ${ago(latest.updated_at)}`;
  if (video.autoApplied > 0) return `${video.autoApplied} line${video.autoApplied > 1 ? 's' : ''} auto-updated`;
  return 'no updates · in sync';
}

export function labelOf(run: Run): string {
  if (run.status === 'ready_for_review') return 'READY FOR REVIEW';
  if (run.status === 'reviewed' || run.status === 'done') return 'IN SYNC';
  if (run.status === 'halted') return 'HALTED';
  if (run.status === 'error') return 'ERROR';
  return (run.phase ?? 'working').toUpperCase();
}

export function kindOfRun(run: Run): Kind {
  if (run.status === 'ready_for_review') return 'review';
  if (run.status === 'reviewed' || run.status === 'done') return 'sync';
  if (run.status === 'error' || run.status === 'halted') return 'stale';
  return 'render';
}

// Roll a client's videos up into one headline state, using the same precedence.
export function clientState(states: { kind: Kind }[]): { kind: Kind; label: string } {
  const n = (k: Kind) => states.filter((s) => s.kind === k).length;
  const working = n('render');
  const broken = n('stale');
  const needsYou = n('review');
  if (broken > 0) return { kind: 'stale', label: `${broken} NEED${broken === 1 ? 'S' : ''} ATTENTION` };
  if (working > 0) return { kind: 'render', label: `${working} UPDATING` };
  if (needsYou > 0) return { kind: 'review', label: `${needsYou} TO REVIEW` };
  return { kind: 'sync', label: 'ALL IN SYNC' };
}

// ── time ────────────────────────────────────────────────────────────────────
const UNITS: [number, string][] = [
  [60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.35, 'week'], [12, 'month'],
];

// Local relative-time formatter (replaces the date-fns dependency the two old
// pages each imported separately).
export function ago(iso: string | null | undefined): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  let diff = (Date.now() - then) / 1000;
  if (diff < 45) return 'just now';
  let unit = 'second';
  for (const [size, name] of UNITS) {
    if (diff < size) break;
    diff /= size;
    unit = name;
  }
  const n = Math.round(diff);
  const suffix = n === 1 ? '' : 's';
  return `${n} ${unit}${suffix} ago`;
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
