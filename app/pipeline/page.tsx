'use client';

import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  CheckCircle2,
  CircleDashed,
  Loader2,
  AlertOctagon,
  PauseCircle,
  RefreshCw,
} from 'lucide-react';

// ── types (mirror /api/pipeline/runs) ───────────────────────────────────────
type Evt = { phase: string; status: string; detail: string | null; at: string };
type Run = {
  id: string;
  projectId: string;
  video: string | null;
  client: string | null;
  status: string;
  path: string | null;
  trigger: string | null;
  phase: string | null;
  detail: string | null;
  started_at: string;
  updated_at: string;
  finished_at: string | null;
  events: Evt[];
};
type Video = { id: string; title: string; client: string | null };
type Board = { generatedAt: string; videos: Video[]; runs: Run[] };

const PHASES = [
  'detect', 'brief', 'editing', 'written', 'reference',
  'render', 'splice', 'proxy', 'beats', 'resync', 'ready',
];

const STATUS: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  running: { label: 'Running', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30', icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  ready_for_review: { label: 'Ready for review', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  halted: { label: 'Halted', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: <PauseCircle className="h-3.5 w-3.5" /> },
  error: { label: 'Error', cls: 'bg-red-500/15 text-red-300 border-red-500/30', icon: <AlertOctagon className="h-3.5 w-3.5" /> },
  done: { label: 'Done', cls: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  idle: { label: 'No updates', cls: 'bg-zinc-800 text-zinc-500 border-zinc-700', icon: <CircleDashed className="h-3.5 w-3.5" /> },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.idle;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

function ago(iso: string | null) {
  if (!iso) return '—';
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }); } catch { return '—'; }
}

// One in-progress run, expanded with its phase progress + live event stream.
function ActiveRunCard({ run }: { run: Run }) {
  const idx = run.phase ? PHASES.indexOf(run.phase) : -1;
  return (
    <div className="rounded-xl border border-blue-500/30 bg-zinc-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-100">{run.video ?? 'Unknown video'}</div>
          <div className="truncate text-xs text-zinc-500">
            {run.client ? `${run.client} · ` : ''}{run.path ? `Path ${run.path} · ` : ''}{run.trigger ?? ''}
          </div>
        </div>
        <StatusBadge status={run.status} />
      </div>

      {/* phase progress */}
      <div className="mt-3 flex flex-wrap gap-1">
        {PHASES.map((p, i) => {
          const state = idx < 0 ? 'todo' : i < idx ? 'done' : i === idx ? 'now' : 'todo';
          const cls = state === 'done' ? 'bg-blue-500/40 text-blue-100'
            : state === 'now' ? 'bg-blue-400 text-zinc-900 font-semibold'
            : 'bg-zinc-800 text-zinc-500';
          return <span key={p} className={`rounded px-1.5 py-0.5 text-[10px] ${cls}`}>{p}</span>;
        })}
      </div>

      {run.detail && <div className="mt-3 text-sm text-zinc-300">{run.detail}</div>}

      {/* recent event stream */}
      <div className="mt-3 space-y-1 border-t border-zinc-800 pt-3">
        {run.events.map((e, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-14 shrink-0 text-zinc-500">{ago(e.at)}</span>
            <span className="w-16 shrink-0 font-mono text-zinc-400">{e.phase}</span>
            <span className={`truncate ${e.status === 'error' ? 'text-red-300' : 'text-zinc-300'}`}>{e.detail ?? e.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// A video tile in the grid (its latest run's status + when).
function VideoTile({ video, latest }: { video: Video; latest?: Run }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-100">{video.title}</div>
          <div className="truncate text-xs text-zinc-500">{video.client ?? ''}</div>
        </div>
        <StatusBadge status={latest?.status ?? 'idle'} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span>{latest ? `${latest.phase ?? latest.status} · updated ${ago(latest.updated_at)}` : 'no runs yet'}</span>
      </div>
      {latest?.trigger && <div className="mt-1 truncate text-xs text-zinc-600">{latest.trigger}</div>}
    </div>
  );
}

export default function PipelinePage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch('/api/pipeline/runs?limit=100', { cache: 'no-store' });
        if (res.status === 401) { if (alive) setError('unauthorized'); return; }
        const data = await res.json();
        if (alive) { setBoard(data); setError(null); }
      } catch {
        if (alive) setError('network');
      }
    };
    load();
    timer.current = setInterval(() => { load(); setTick((t) => t + 1); }, 4000);
    return () => { alive = false; if (timer.current) clearInterval(timer.current); };
  }, []);

  if (error === 'unauthorized') {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-zinc-200">
        <p className="text-sm text-zinc-400">Please <a className="text-blue-400 underline" href="/">sign in</a> to view the pipeline.</p>
      </main>
    );
  }

  const runs = board?.runs ?? [];
  const active = runs.filter((r) => r.status === 'running');
  const latestByVideo = new Map<string, Run>();
  for (const r of runs) if (r.projectId && !latestByVideo.has(r.projectId)) latestByVideo.set(r.projectId, r);
  const videos = board?.videos ?? [];

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-zinc-200 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <h1 className="text-lg font-semibold text-zinc-100">Pipeline</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <RefreshCw className={`h-3.5 w-3.5 ${tick % 2 ? 'text-blue-400' : ''}`} />
            live · {board ? ago(board.generatedAt) : 'connecting…'}
          </div>
        </header>

        {!board && !error && <div className="text-sm text-zinc-500">Loading…</div>}

        {active.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">In progress ({active.length})</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {active.map((r) => <ActiveRunCard key={r.id} run={r} />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Videos ({videos.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => <VideoTile key={v.id} video={v} latest={latestByVideo.get(v.id)} />)}
          </div>
          {videos.length === 0 && board && <div className="text-sm text-zinc-500">No videos yet.</div>}
        </section>
      </div>
    </main>
  );
}
