'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Play, Plus, Square, Trash2, X } from 'lucide-react';
import { fmtClock, fmtDuration, secondsOf } from '@/lib/work-log.mjs';
import { Modal } from '../../_shared/ui';

// The time behind one video: a start/stop timer, the stretches it produced
// (plus any typed in by hand for time that went untracked — each deletable),
// and one free-text note. Nothing here touches the board or the sync state; it
// exists so the hours behind every video can be read back together (the MCP
// server's get_time_report) when it's time to set prices.

type Session = { id: string; started_at: string; ended_at: string | null };
type Log = {
  sessions: Session[];
  running: Session | null;
  total_sec: number;
  days_worked: number;
  notes: string;
  stopped_elsewhere?: string[];
};

const LONG_RUN_SEC = 8 * 3600;

// Re-render once a second while something is counting.
export function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

// <input type="datetime-local"> speaks local wall-clock time without a zone.
function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(s: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function fmtDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Today';
  const y = new Date(today); y.setDate(today.getDate() - 1);
  if (same(d, y)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}) });
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function WorkLogModal({ projectId, title, onClose, onChange }: {
  projectId: string;
  title: string;
  onClose: () => void;
  // Fired after any change the page header should reflect (the timer, the total).
  onChange: () => void;
}) {
  const [log, setLog] = useState<Log | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // add a stretch by hand
  const [adding, setAdding] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // notes — autosaved a moment after you stop typing, like the checklist
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  const notesRef = useRef(notes);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const now = useNow(!!log?.running);

  const apply = useCallback((next: Log) => {
    setLog(next);
    if (next.stopped_elsewhere && next.stopped_elsewhere.length > 0) {
      setNotice(`Stopped the timer that was running on ${next.stopped_elsewhere.join(', ')}.`);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/work/${projectId}`, { cache: 'no-store' });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) { setErr(data.error ?? 'Could not load the time log.'); return; }
        apply(data);
        setNotes(data.notes ?? '');
        notesRef.current = data.notes ?? '';
      } catch {
        if (alive) setErr('Could not load the time log.');
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, [projectId, apply]);

  // ── timer / sessions ──────────────────────────────────────────────────────
  const post = async (body: Record<string, unknown>) => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/work/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error ?? 'Could not save.'); return false; }
      apply(data);
      onChange();
      return true;
    } catch {
      setErr('Network error — that change may not be saved.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const openAdd = () => {
    const end = Date.now();
    setFrom(toLocalInput(end - 60 * 60 * 1000));
    setTo(toLocalInput(end));
    setAdding(true);
  };
  const add = async () => {
    const startedAt = fromLocalInput(from);
    const endedAt = fromLocalInput(to);
    if (!startedAt || !endedAt) { setErr('Both times are needed.'); return; }
    if (new Date(endedAt) <= new Date(startedAt)) { setErr('The end must come after the start.'); return; }
    if (await post({ action: 'add', startedAt, endedAt })) setAdding(false);
  };
  const remove = async (s: Session) => {
    if (!confirm(`Delete this ${fmtDuration(secondsOf(s, now))} stretch? This cannot be undone.`)) return;
    await post({ action: 'delete', sessionId: s.id });
  };

  // ── notes ─────────────────────────────────────────────────────────────────
  const saveNotes = useCallback(async (value: string) => {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/work/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error ?? 'Could not save the notes.');
        return;
      }
      setSavedTick((n) => n + 1);
    } catch {
      setErr('Network error — your notes may not be saved.');
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const queueNotes = (value: string) => {
    setNotes(value);
    notesRef.current = value;
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => { notesTimer.current = null; saveNotes(value); }, 700);
  };

  // Closing flushes a save still waiting on the debounce…
  const close = async () => {
    if (notesTimer.current) {
      clearTimeout(notesTimer.current);
      notesTimer.current = null;
      await saveNotes(notesRef.current);
    }
    onClose();
  };
  // …and a hard navigation away still gets it out.
  useEffect(() => () => {
    if (!notesTimer.current) return;
    clearTimeout(notesTimer.current);
    fetch(`/api/work/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notesRef.current }),
      keepalive: true,
    }).catch(() => {});
  }, [projectId]);

  // ── render ────────────────────────────────────────────────────────────────
  const running = log?.running ?? null;
  const runningSec = running ? secondsOf(running, now) : 0;
  // The server's total was taken at load; the running session keeps counting here.
  const totalSec = log ? log.sessions.reduce((acc, s) => acc + secondsOf(s, now), 0) : 0;

  return (
    <Modal title={`Time · ${title}`} onClose={close} wide>
      {!loaded && <p className="mono note">Loading…</p>}
      {loaded && log && (
        <>
          <div className="wl-top">
            <div>
              <div className="wl-big mono">{fmtDuration(totalSec)}</div>
              <div className="wl-sub mono">
                {log.sessions.length} SESSION{log.sessions.length === 1 ? '' : 'S'} · {log.days_worked} DAY{log.days_worked === 1 ? '' : 'S'}
              </div>
            </div>
            {running ? (
              <div className="wl-timer on">
                <span className="wl-clock mono">{fmtClock(runningSec)}</span>
                <button type="button" className="btn primary" disabled={busy} onClick={() => post({ action: 'stop' })}>
                  <Square className="w-3.5 h-3.5" />Stop
                </button>
              </div>
            ) : (
              <div className="wl-timer">
                <button type="button" className="btn primary" disabled={busy} onClick={() => post({ action: 'start' })}>
                  <Play className="w-3.5 h-3.5" />Start timer
                </button>
              </div>
            )}
          </div>
          {running && runningSec > LONG_RUN_SEC && (
            <p className="wl-warn mono">Running for over 8 hours — if you forgot to stop it, stop now, delete the stretch and add the real time by hand.</p>
          )}

          {notice && <div className="banner review wl-notice">{notice}</div>}
          {err && <div className="banner stale wl-notice">{err}</div>}

          <div className="mono eyebrow sec"><span className="dot dim" />SESSIONS</div>
          <div className="wl-sessions">
            {log.sessions.length === 0 && !adding && (
              <p className="wl-empty">Nothing tracked yet. Start the timer, or add time you already put in.</p>
            )}
            {log.sessions.map((s) => (
              <div className={`wl-row${s.ended_at ? '' : ' live'}`} key={s.id}>
                <span className="wl-when mono">
                  {fmtDay(s.started_at)} · {fmtTime(s.started_at)}–{s.ended_at ? fmtTime(s.ended_at) : 'now'}
                </span>
                <span className="wl-dur mono">{fmtDuration(secondsOf(s, now))}</span>
                <button type="button" className="wl-icon del" disabled={busy} onClick={() => remove(s)} aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {adding && (
              <div className="wl-erow">
                <input type="datetime-local" className="inp mono" value={from} onChange={(e) => setFrom(e.target.value)} />
                <span className="wl-arrow mono">→</span>
                <input type="datetime-local" className="inp mono" value={to} onChange={(e) => setTo(e.target.value)} />
                <button type="button" className="btn primary sm" disabled={busy} onClick={add}><Check className="w-3 h-3" />Add</button>
                <button type="button" className="wl-icon" onClick={() => setAdding(false)} aria-label="Cancel"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
          {!adding && (
            <button type="button" className="vl-add" onClick={openAdd}><Plus className="w-3.5 h-3.5" />Add time by hand</button>
          )}

          <div className="mono eyebrow sec wl-sec">
            <span className="dot dim" />NOTES
            <span className="vl-saved">{saving ? 'saving…' : savedTick > 0 ? 'saved' : ''}</span>
          </div>
          <textarea
            className="inp wl-notes"
            rows={8}
            value={notes}
            placeholder="Anything about the time on this one — what was slow, what was fast, what you charged. Saved as you type."
            onChange={(e) => queueNotes(e.target.value)}
          />
        </>
      )}
      {loaded && !log && err && <div className="banner stale">{err}</div>}
    </Modal>
  );
}
