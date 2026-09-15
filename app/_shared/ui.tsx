'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import {
  Board, Run, Video, PHASES, ago, kindOfRun, labelOf, videoState, videoFoot,
} from './model';
import { CSS } from './theme';

// ── data ────────────────────────────────────────────────────────────────────
// One board fetch feeds the clients overview and every client page; the dataset
// is small enough to filter client-side. Polls so a run that finishes while
// you're looking at the page actually shows up.
export function useBoard(pollMs: number | null = 4000) {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/board', { cache: 'no-store' });
      if (res.status === 401) { setError('unauthorized'); return false; }
      const data = await res.json();
      setBoard(data);
      setError(null);
      return true;
    } catch {
      setError('network');
      return false;
    }
  }, []);

  // pollMs null = don't fetch at all (e.g. while the sign-in form is showing).
  useEffect(() => {
    if (pollMs === null) return;
    let alive = true;
    const tick = () => { if (alive) load(); };
    tick();
    const id = setInterval(tick, pollMs);
    return () => { alive = false; clearInterval(id); };
  }, [load, pollMs]);

  return { board, error, reload: load, setBoard };
}

// Latest run per video, from a newest-first run list.
export function latestRuns(runs: Run[]): Map<string, Run> {
  const m = new Map<string, Run>();
  for (const r of runs) if (r.projectId && !m.has(r.projectId)) m.set(r.projectId, r);
  return m;
}

// ── chrome ──────────────────────────────────────────────────────────────────
// `split` = the video page's two-pane view: the page itself doesn't scroll, the
// two columns inside it do. Falls back to a normal scrolling page under 1080px.
export function Shell({ children, narrow, split }: {
  children: React.ReactNode;
  narrow?: boolean;
  split?: boolean;
}) {
  if (split) {
    return (
      <div className="sbs split">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="glow" aria-hidden />
        <main className="wrap split-wrap">{children}</main>
      </div>
    );
  }
  return (
    <div className="sbs">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="glow" aria-hidden />
      <main className={`wrap${narrow ? ' narrow' : ''}`}>{children}</main>
      <div style={{ height: 48 }} />
    </div>
  );
}

export function Header({ right, live }: { right?: React.ReactNode; live?: string | null }) {
  return (
    <header className="head">
      <Link className="brand" href="/">
        <span className="logo"><b /><b /><b /></span>
        <span className="mono eyebrow"><span className="dot" />SCRIPT MANAGER · MISSION CONTROL</span>
      </Link>
      <div className="headright">
        {live !== undefined && (
          <div className="mono live"><span className="scan" />{live ? `LIVE · ${live}` : 'CONNECTING…'}</div>
        )}
        {right}
      </div>
    </header>
  );
}

export function Modal({ title, onClose, children, footer, wide, xwide }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
  // xwide is for the video list, which is a long two-column scan (title + meta)
  // rather than a form — at `wide` the meta column wraps under every row.
  xwide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal${xwide ? ' xwide' : wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ── one in-flight run, as the SOURCE → connector → VIDEO motif ──────────────
export function RunFlow({ run }: { run: Run }) {
  const kind = kindOfRun(run);
  const running = run.status === 'running';
  const idx = run.phase ? PHASES.indexOf(run.phase) : -1;
  const progress = idx < 0 ? 0 : idx / (PHASES.length - 1);
  const fill = kind === 'sync' || kind === 'review' ? 1 : progress;

  return (
    <Link className="card flow" href={`/video/${run.projectId}`}>
      <div className="flow-head">
        <div className="min0">
          <div className="flow-title">{run.video ?? 'Unknown video'}</div>
          <div className="mono flow-sub">
            {[run.client, run.path ? `PATH ${run.path}` : null, run.trigger].filter(Boolean).join('  ·  ')}
          </div>
        </div>
        <span className={`pill ${kind}`}><span className="pdot" />{labelOf(run)}</span>
      </div>

      <div className="motif">
        <div className="frame src">
          <div className="frame-bar"><i /><i /><i /><span className="mono frame-url">product change</span></div>
          <div className="frame-body mono">{run.trigger ?? 'change detected'}</div>
        </div>

        <div className="conn">
          <div className="conn-phase mono">{(run.phase ?? '').toUpperCase()}{idx >= 0 ? ` · ${idx + 1}/${PHASES.length}` : ''}</div>
          <div className={`conn-track ${kind}`}>
            <div className="conn-fill" style={{ width: `${fill * 100}%` }} />
            <span className="conn-head" style={{ left: `${fill * 100}%` }} />
            <span className="conn-arrow" />
          </div>
        </div>

        <div className="frame vid">
          <div className="frame-bar">
            <i /><i /><i />
            <span className="mono frame-url">{(run.video ?? 'video').toLowerCase().replace(/\s+/g, '-')}.mp4</span>
            {running && <span className="eq"><b /><b /><b /><b /></span>}
          </div>
          <div className="frame-body mono">{run.detail ?? labelOf(run).toLowerCase()}</div>
        </div>
      </div>

      <div className="stream">
        {run.events.slice(0, 5).map((e, i) => (
          <div className="stream-row mono" key={i}>
            <span className="s-time">{ago(e.at)}</span>
            <span className="s-phase">{e.phase}</span>
            <span className={`s-detail ${e.status === 'error' ? 'err' : ''}`}>{e.detail ?? e.status}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}

// ── update mode: the one switch that decides whether the pipeline may rebuild ─
// AUTO = the animation pipeline rebuilds the film when the product changes.
// MANUAL (check + email) = the daily check audits the script and emails you; no
// agent ever touches the video. New videos start MANUAL: a film still in
// production, or not yet approved by the client, must never be rebuilt. AUTO
// needs the film's Claude Design project (the animation the agent edits), so
// switching it on asks for the link — the server refuses AUTO without one.
export type ModeTarget = { id: string; title: string; autoUpdate: boolean; designUrl: string | null };

export const MODE_COPY = {
  auto: 'Built in the StepByStep editor. When the product changes, the pipeline briefs an agent on your machine, updates the animation, re-renders, regenerates the affected narration and re-syncs the timeline — you just review the result here.',
  manual: 'When the product changes, the daily check audits this script and emails you a digest — then you accept the changes and re-record the affected sections yourself. No agent ever touches the video. Keep a film here while it is in production or waiting on client approval.',
};

// The AUTO/MANUAL chip. With onClick it becomes the switch (opens the modal).
export function ModeChip({ auto, onClick, className }: {
  auto: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `mode ${auto ? 'auto' : 'manual'}${className ? ` ${className}` : ''}`;
  const label = auto ? 'AUTO' : 'MANUAL';
  if (!onClick) return <span className={cls}>{label}</span>;
  return (
    <button
      type="button"
      className={`${cls} tog`}
      title={auto ? 'Auto-updating — click to switch this video to check + email' : 'Check + email — click to switch auto-update on'}
      aria-label={`Update mode: ${label}. Change`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
    >
      {label}
    </button>
  );
}

export function UpdateModeModal({ target, want, onClose, onSaved }: {
  target: ModeTarget;
  want?: boolean;               // preselect a mode (e.g. the page's AUTO button was pressed)
  onClose: () => void;
  onSaved: () => unknown;
}) {
  const [auto, setAuto] = useState<boolean>(want ?? target.autoUpdate);
  const [url, setUrl] = useState(target.designUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const urlTrim = url.trim();
  const needsUrl = auto && urlTrim === '';
  const changed = auto !== target.autoUpdate || (auto && urlTrim !== (target.designUrl ?? ''));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsUrl || !changed) return;
    setSaving(true);
    setErr(null);
    try {
      const body: Record<string, unknown> = { autoUpdate: auto };
      if (auto && urlTrim !== (target.designUrl ?? '')) body.designUrl = urlTrim;
      const res = await fetch(`/api/projects/${target.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(j.error ?? 'Could not save.'); return; }
      await onSaved();
      onClose();
    } catch {
      setErr('Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Update mode"
      onClose={() => { if (!saving) onClose(); }}
      footer={
        <>
          <button type="button" className="btn" disabled={saving} onClick={onClose}>Cancel</button>
          <button type="submit" form="updatemode" className="btn primary" disabled={saving || needsUrl || !changed}>
            {saving ? 'Saving…' : auto ? 'Switch auto-update on' : 'Switch to check + email'}
          </button>
        </>
      }
    >
      <p className="modal-note"><b>{target.title}</b></p>
      <form id="updatemode" onSubmit={save}>
        <div className="seg mono">
          <button type="button" className={auto ? 'on' : ''} disabled={saving} onClick={() => setAuto(true)}>AUTO-UPDATE</button>
          <button type="button" className={!auto ? 'on' : ''} disabled={saving} onClick={() => setAuto(false)}>CHECK + EMAIL</button>
        </div>
        <p className="mode-desc">{auto ? MODE_COPY.auto : MODE_COPY.manual}</p>
        {auto && (
          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="umdesign">Claude Design project <span className="opt">required</span></label>
            <input
              id="umdesign" className="inp" type="url" value={url} required autoFocus={!target.designUrl}
              placeholder="https://claude.ai/design/p/…" spellCheck={false}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="field-hint">
              The animation the pipeline edits. Auto-update can&rsquo;t be switched on without it — link the finished, client-approved film.
            </p>
          </div>
        )}
        {err && <p className="modeerr mono">{err}</p>}
      </form>
    </Modal>
  );
}

// One hook, one modal, any number of chips on the page.
export function useUpdateMode(onSaved: () => unknown) {
  const [state, setState] = useState<{ target: ModeTarget; want?: boolean } | null>(null);
  const open = useCallback((target: ModeTarget, want?: boolean) => setState({ target, want }), []);
  const close = useCallback(() => setState(null), []);
  const modal = state ? (
    <UpdateModeModal key={state.target.id} target={state.target} want={state.want} onClose={close} onSaved={onSaved} />
  ) : null;
  return { open, modal };
}

// ── a video in the client grid ──────────────────────────────────────────────
export function VideoTile({ video, latest, onDelete, onMode }: {
  video: Video;
  latest?: Run;
  onDelete?: (id: string) => void;
  onMode?: (video: Video) => void;   // makes the AUTO/MANUAL chip the switch
}) {
  const st = videoState(video, latest);
  return (
    <div className="card tile link" style={{ position: 'relative' }}>
      {onDelete && (
        <button
          type="button"
          className="cardkill"
          aria-label={`Delete ${video.title}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(video.id); }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <Link href={`/video/${video.id}`} style={{ display: 'block', color: 'inherit' }}>
        <div className="tile-top">
          <div className="min0">
            <div className="tile-title">{video.title}</div>
            <div className="mono tile-client">{video.client ?? ''}</div>
          </div>
          <span className={`pill sm ${st.kind}`}><span className="pdot" />{st.label}</span>
        </div>
        <div className="tile-bottom">
          <span className="mono tile-foot">{videoFoot(video, latest)}</span>
        </div>
      </Link>
      {/* Outside the link so a click switches the mode instead of opening the video. */}
      <ModeChip auto={video.autoUpdate} className="tile-mode" onClick={onMode ? () => onMode(video) : undefined} />
    </div>
  );
}
