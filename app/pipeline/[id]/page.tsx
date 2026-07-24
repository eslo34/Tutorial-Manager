'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

type Change = {
  id: string; original_text: string; suggested_replacement: string; reason: string;
  severity: string; category: string; source_url: string; status: string; detected_at: string;
};
type Evt = { phase: string; status: string; detail: string | null; at: string };
type Run = {
  id: string; status: string; path: string | null; phase: string | null; trigger: string | null;
  detail: string | null; started_at: string; updated_at: string; finished_at: string | null; events: Evt[];
};
type Video = {
  id: string; title: string; client: string | null; script: string;
  autoUpdate: boolean; editorProject: string | null; clientAutoDefault: boolean;
};
type Data = { video: Video; changes: Change[]; runs: Run[] };

function ago(iso: string | null) {
  if (!iso) return '—';
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }); } catch { return '—'; }
}
function stateOf(latest: Run | undefined, pending: number): { kind: 'sync' | 'render' | 'stale'; label: string } {
  if (latest?.status === 'running') return { kind: 'render', label: (latest.phase ?? 'updating').toUpperCase() };
  if (latest?.status === 'halted') return { kind: 'render', label: 'HALTED' };
  if (latest?.status === 'error') return { kind: 'stale', label: 'ERROR' };
  if (latest?.status === 'ready_for_review') return { kind: 'sync', label: 'READY FOR REVIEW' };
  if (pending > 0) return { kind: 'stale', label: `STALE · ${pending} CHANGE${pending > 1 ? 'S' : ''}` };
  return { kind: 'sync', label: 'IN SYNC' };
}

// Split the script into plain segments + change segments. Anchor each change where it actually
// sits in the CURRENT script: the OLD text for not-yet-applied edits, or the NEW text for ones
// already applied (e.g. the pipeline's auto_applied voiceover changes). Either way we render old→new.
function buildSegments(script: string, changes: Change[]) {
  const marks = changes
    .map((c) => {
      let start = script.indexOf(c.original_text);
      let len = c.original_text.length;
      if (start < 0) { start = script.indexOf(c.suggested_replacement); len = c.suggested_replacement.length; }
      return { c, start, len };
    })
    .filter((m) => m.start >= 0)
    .sort((a, b) => a.start - b.start);
  const segs: ({ type: 'text'; text: string } | { type: 'chg'; c: Change })[] = [];
  let cursor = 0;
  for (const m of marks) {
    if (m.start < cursor) continue; // overlapping match, skip
    if (m.start > cursor) segs.push({ type: 'text', text: script.slice(cursor, m.start) });
    segs.push({ type: 'chg', c: m.c });
    cursor = m.start + m.len;
  }
  if (cursor < script.length) segs.push({ type: 'text', text: script.slice(cursor) });
  const unmatched = changes.filter((c) => script.indexOf(c.original_text) < 0 && script.indexOf(c.suggested_replacement) < 0);
  return { segs, unmatched };
}

const sevKind: Record<string, 'stale' | 'render' | 'sync'> = { critical: 'stale', moderate: 'render', minor: 'sync' };

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slugDraft, setSlugDraft] = useState<string | null>(null); // null = not editing
  const [savingMode, setSavingMode] = useState(false);
  const [modeErr, setModeErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/pipeline/video/${id}`, { cache: 'no-store' });
        if (res.status === 401) { if (alive) setError('unauthorized'); return; }
        if (res.status === 404) { if (alive) setError('notfound'); return; }
        const d = await res.json();
        if (alive) { setData(d); setError(null); }
      } catch { if (alive) setError('network'); }
    };
    load();
    const t = setInterval(load, 4000); // live while a run is in flight
    return () => { alive = false; clearInterval(t); };
  }, [id]);

  // Change how this video is kept up to date (auto pipeline vs check + email).
  const saveMode = async (patch: { autoUpdate?: boolean; editorProject?: string | null }) => {
    setSavingMode(true);
    setModeErr(null);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const j = await res.json();
      if (!res.ok) { setModeErr(j.error ?? 'Could not save.'); return; }
      setData((d) => (d ? { ...d, video: { ...d.video, autoUpdate: j.project.autoUpdate, editorProject: j.project.editorProject } } : d));
      setSlugDraft(null);
    } catch {
      setModeErr('Network error.');
    } finally {
      setSavingMode(false);
    }
  };

  const auto = data?.video.autoUpdate === true;
  const slugSaved = data?.video.editorProject ?? '';
  const slugValue = slugDraft ?? slugSaved;
  const slugDirty = slugDraft !== null && slugDraft.trim() !== slugSaved;

  const latest = data?.runs?.[0];
  // Only genuinely-pending edits drive the STALE state; already-applied ones (accepted / the
  // pipeline's auto_applied VO changes) are informational and must not mark the video stale.
  const pendingCount = data?.changes?.filter((c) => c.status === 'pending' || c.status === 'accepted').length ?? 0;
  const st = stateOf(latest, pendingCount);
  const { segs, unmatched } = data ? buildSegments(data.video.script, data.changes) : { segs: [], unmatched: [] };

  return (
    <div className="sbs">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="glow" aria-hidden />
      <main className="wrap">
        <div className="mono back"><Link href="/pipeline">← MISSION CONTROL</Link></div>

        {error === 'unauthorized' && <p className="mono note">Please <Link href="/">sign in</Link>.</p>}
        {error === 'notfound' && <p className="mono note">Video not found.</p>}
        {!data && !error && <p className="mono note">Loading…</p>}

        {data && (
          <>
            <header className="dhead">
              <div className="min0">
                <h1 className="dtitle">{data.video.title}</h1>
                <div className="mono dsub">{data.video.client ?? ''}{latest?.trigger ? `  ·  ${latest.trigger}` : ''}</div>
              </div>
              <div className="hpills">
                <span className={`mode ${auto ? 'auto' : 'manual'}`}>{auto ? 'AUTO' : 'MANUAL'}</span>
                <span className={`pill ${st.kind}`}><span className="pdot" />{st.label}</span>
              </div>
            </header>

            {/* UPDATE MODE */}
            <section>
              <div className="mono eyebrow sec"><span className="dot dim" />UPDATE MODE</div>
              <div className="card modebox">
                <div className="seg mono">
                  <button type="button" className={auto ? 'on' : ''} disabled={savingMode} onClick={() => saveMode({ autoUpdate: true })}>
                    AUTO-UPDATE
                  </button>
                  <button type="button" className={!auto ? 'on' : ''} disabled={savingMode} onClick={() => saveMode({ autoUpdate: false })}>
                    CHECK + EMAIL
                  </button>
                </div>
                <p className="mode-desc">
                  {auto
                    ? 'Built in the StepByStep editor. When the product changes, the pipeline updates the animation, re-renders, regenerates the affected narration and re-syncs the timeline — you just review the result.'
                    : 'Not built in the editor. When the product changes, the daily check audits this script and emails you a digest with what went out of date — then you update the video yourself. No agent ever touches it.'}
                </p>
                {data.video.clientAutoDefault === false && (
                  <p className="mono client-default">
                    {data.video.client}&rsquo;s videos are produced outside the editor — new videos for this client start on CHECK + EMAIL.
                  </p>
                )}
                <div className="slugrow">
                  <label className="mono slug-label" htmlFor="editorproj">EDITOR PROJECT</label>
                  <input
                    id="editorproj"
                    className="mono slug-input"
                    value={slugValue}
                    placeholder="— not made in the editor —"
                    spellCheck={false}
                    onChange={(e) => setSlugDraft(e.target.value)}
                  />
                  {slugDirty && (
                    <button type="button" className="mono slug-save" disabled={savingMode} onClick={() => saveMode({ editorProject: slugValue })}>
                      SAVE
                    </button>
                  )}
                </div>
                {modeErr && <p className="mono modeerr">{modeErr}</p>}
              </div>
            </section>

            {/* WHAT CHANGED */}
            <section>
              <div className="mono eyebrow sec"><span className="dot" />WHAT CHANGED · {data.changes.length}</div>
              {data.changes.length === 0 ? (
                <p className="mono note">No detected changes. This video is in sync with its product.</p>
              ) : (
                <div className="chgcards">
                  {data.changes.map((c) => (
                    <div className="card chgcard" key={c.id}>
                      <div className="chgcard-top">
                        <span className={`pill sm ${sevKind[c.severity] ?? 'render'}`}><span className="pdot" />{c.severity.toUpperCase()} · {c.category.replace(/_/g, ' ')}</span>
                        {c.source_url && <a className="mono src" href={c.source_url} target="_blank" rel="noreferrer">source ↗</a>}
                      </div>
                      <p className="chg-reason">{c.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SCRIPT with highlighted changes */}
            <section>
              <div className="mono eyebrow sec"><span className="dot dim" />SCRIPT{data.changes.length > 0 ? ' · CHANGES HIGHLIGHTED' : ''}</div>
              <div className="script">
                {segs.map((s, i) =>
                  s.type === 'text' ? (
                    <span key={i}>{s.text}</span>
                  ) : (
                    <span className="chg" key={i}>
                      <span className="chg-old">{s.c.original_text}</span>
                      <span className="chg-arrow"> → </span>
                      <span className="chg-new">{s.c.suggested_replacement}</span>
                    </span>
                  ),
                )}
              </div>
              {unmatched.length > 0 && (
                <p className="mono note" style={{ marginTop: 10 }}>
                  {unmatched.length} change{unmatched.length > 1 ? 's' : ''} couldn’t be located verbatim in the script (see the cards above).
                </p>
              )}
            </section>

            {/* PIPELINE RUN */}
            {data.runs.length > 0 && (
              <section>
                <div className="mono eyebrow sec"><span className="dot dim" />PIPELINE · LATEST RUN</div>
                {latest && (
                  <div className="card runbox">
                    <div className="runbox-top mono">
                      <span>{(latest.path ? `PATH ${latest.path} · ` : '') + (latest.phase ?? latest.status).toUpperCase()}</span>
                      <span className="rt">started {ago(latest.started_at)}{latest.finished_at ? ` · finished ${ago(latest.finished_at)}` : ''}</span>
                    </div>
                    <div className="tl">
                      {latest.events.map((e, i) => (
                        <div className="tl-row mono" key={i}>
                          <span className="tl-dot" data-s={e.status} />
                          <span className="tl-phase">{e.phase}</span>
                          <span className={`tl-detail ${e.status === 'error' ? 'err' : ''}`}>{e.detail ?? e.status}</span>
                          <span className="tl-time">{ago(e.at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
            <div style={{ height: 40 }} />
          </>
        )}
      </main>
    </div>
  );
}

const CSS = `
.sbs{
  --ground:#0A0C10;--raised:#12151B;--inset:#06080B;
  --line:rgba(151,164,190,.12);--line-2:rgba(151,164,190,.20);
  --text:#ECEDE7;--text-2:#A7ACB7;--text-3:#6C7280;
  --sync:#5FE38C;--sync-dim:rgba(95,227,140,.14);--sync-line:rgba(95,227,140,.34);
  --render:#F5B44C;--render-dim:rgba(245,180,76,.15);--render-line:rgba(245,180,76,.36);
  --stale:#FF6B6B;--stale-dim:rgba(255,107,107,.14);--stale-line:rgba(255,107,107,.40);
  --radius:16px;--radius-sm:10px;--shadow:0 24px 70px -28px rgba(0,0,0,.75);--ease:cubic-bezier(.22,1,.36,1);
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI Variable Display","Segoe UI",system-ui,Roboto,Helvetica,Arial,sans-serif;
  --mono:ui-monospace,"Cascadia Code","SF Mono","Segoe UI Mono",Menlo,Consolas,monospace;
  position:relative;min-height:100vh;background:var(--ground);color:var(--text);font-family:var(--sans);-webkit-font-smoothing:antialiased;overflow-x:hidden;
}
.sbs .mono{font-family:var(--mono);font-variant-numeric:tabular-nums;}
.sbs .min0{min-width:0;}
.sbs a{color:var(--sync);text-decoration:none;}
.sbs .glow{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(60% 50% at 12% 0%,rgba(95,227,140,.06),transparent 70%),radial-gradient(50% 45% at 92% 8%,rgba(108,92,231,.07),transparent 70%);}
.sbs .wrap{position:relative;z-index:1;max-width:940px;margin:0 auto;padding:22px 20px 0;}
.sbs .note{color:var(--text-2);font-size:12px;letter-spacing:.06em;}
.sbs .back{margin-bottom:18px;font-size:10px;letter-spacing:.18em;}
.sbs .back a{color:var(--text-3);}
.sbs .back a:hover{color:var(--sync);}
.sbs .eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--text-3);}
.sbs .eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--sync);box-shadow:0 0 8px var(--sync);}
.sbs .eyebrow .dot.dim{background:var(--text-3);box-shadow:none;}
.sbs .eyebrow.sec{margin:26px 0 12px;}

.sbs .dhead{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;}
.sbs .dtitle{margin:0;font-size:26px;font-weight:800;letter-spacing:-.03em;color:var(--text);}
.sbs .dsub{margin-top:7px;font-size:10px;letter-spacing:.1em;color:var(--text-3);}

.sbs .pill{display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:20px;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.13em;white-space:nowrap;flex-shrink:0;}
.sbs .pill.sm{font-size:9px;padding:4px 9px;}
.sbs .pill .pdot{width:7px;height:7px;border-radius:50%;}
.sbs .pill.sync{color:var(--sync);background:var(--sync-dim);border:1px solid var(--sync-line);}
.sbs .pill.sync .pdot{background:var(--sync);box-shadow:0 0 8px var(--sync);}
.sbs .pill.render{color:var(--render);background:var(--render-dim);border:1px solid var(--render-line);}
.sbs .pill.render .pdot{background:var(--render);box-shadow:0 0 8px var(--render);}
.sbs .pill.stale{color:var(--stale);background:var(--stale-dim);border:1px solid var(--stale-line);}
.sbs .pill.stale .pdot{background:var(--stale);box-shadow:0 0 8px var(--stale);}

.sbs .card{background:var(--raised);border:1px solid var(--line-2);border-radius:var(--radius);box-shadow:var(--shadow);}

/* update mode: AUTO = the pipeline owns it, MANUAL = check + email only */
.sbs .hpills{display:flex;align-items:center;gap:9px;flex-shrink:0;}
.sbs .mode{font-family:var(--mono);font-size:8.5px;font-weight:600;letter-spacing:.16em;padding:4px 8px;
  border-radius:5px;border:1px solid var(--line-2);color:var(--text-3);}
.sbs .mode.auto{color:var(--sync);border-color:var(--sync-line);background:rgba(95,227,140,.07);}
.sbs .mode.manual{color:var(--text-2);background:rgba(151,164,190,.06);}
.sbs .modebox{padding:16px 18px;}
.sbs .seg{display:inline-flex;border:1px solid var(--line-2);border-radius:9px;overflow:hidden;background:var(--inset);}
.sbs .seg button{appearance:none;background:transparent;border:0;cursor:pointer;color:var(--text-3);
  font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.14em;padding:8px 14px;
  transition:background .18s var(--ease),color .18s var(--ease);}
.sbs .seg button+button{border-left:1px solid var(--line-2);}
.sbs .seg button:hover:not(:disabled){color:var(--text-2);}
.sbs .seg button.on{background:var(--sync-dim);color:var(--sync);}
.sbs .seg button:disabled{cursor:default;opacity:.6;}
.sbs .mode-desc{margin:13px 0 0;font-size:13px;line-height:1.6;color:var(--text-2);max-width:70ch;}
.sbs .slugrow{display:flex;align-items:center;gap:11px;margin-top:15px;padding-top:14px;border-top:1px solid var(--line);flex-wrap:wrap;}
.sbs .slug-label{font-size:9px;letter-spacing:.16em;color:var(--text-3);}
.sbs .slug-input{flex:1;min-width:170px;background:var(--inset);border:1px solid var(--line-2);border-radius:7px;
  color:var(--text-2);font-size:11.5px;letter-spacing:.04em;padding:7px 10px;outline:none;}
.sbs .slug-input:focus{border-color:var(--sync-line);}
.sbs .slug-save{appearance:none;cursor:pointer;background:var(--sync-dim);border:1px solid var(--sync-line);color:var(--sync);
  border-radius:7px;font-size:9.5px;font-weight:600;letter-spacing:.14em;padding:7px 13px;}
.sbs .modeerr{margin:11px 0 0;font-size:11px;color:var(--stale);letter-spacing:.03em;}
.sbs .client-default{margin:10px 0 0;font-size:10px;line-height:1.55;letter-spacing:.05em;color:var(--text-3);}
.sbs .chgcards{display:flex;flex-direction:column;gap:10px;}
.sbs .chgcard{padding:14px 16px;}
.sbs .chgcard-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px;}
.sbs .src{font-size:9px;letter-spacing:.12em;color:var(--text-3);text-transform:uppercase;}
.sbs .src:hover{color:var(--sync);}
.sbs .chg-reason{margin:0;font-size:13.5px;line-height:1.55;color:var(--text-2);}

.sbs .script{white-space:pre-wrap;word-break:break-word;font:14px/1.72 var(--sans);color:var(--text-2);background:var(--inset);border:1px solid var(--line);border-radius:var(--radius-sm);padding:20px 22px;max-height:62vh;overflow:auto;}
.sbs .chg-old{background:var(--stale-dim);color:var(--stale);text-decoration:line-through;border-radius:4px;padding:1px 5px;-webkit-box-decoration-break:clone;box-decoration-break:clone;}
.sbs .chg-arrow{color:var(--text-3);}
.sbs .chg-new{background:var(--sync-dim);color:var(--sync);border-radius:4px;padding:1px 5px;-webkit-box-decoration-break:clone;box-decoration-break:clone;}

.sbs .runbox{padding:14px 16px;}
.sbs .runbox-top{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;letter-spacing:.12em;color:var(--text-2);text-transform:uppercase;padding-bottom:11px;border-bottom:1px solid var(--line);}
.sbs .runbox-top .rt{color:var(--text-3);}
.sbs .tl{display:flex;flex-direction:column;gap:7px;padding-top:11px;}
.sbs .tl-row{display:flex;align-items:center;gap:11px;font-size:11px;}
.sbs .tl-dot{width:7px;height:7px;border-radius:50%;background:var(--text-3);flex-shrink:0;}
.sbs .tl-dot[data-s="done"]{background:var(--sync);box-shadow:0 0 7px var(--sync-line);}
.sbs .tl-dot[data-s="error"]{background:var(--stale);}
.sbs .tl-phase{width:66px;flex-shrink:0;color:var(--text-2);letter-spacing:.08em;text-transform:uppercase;font-size:9.5px;}
.sbs .tl-detail{flex:1;color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbs .tl-detail.err{color:var(--stale);}
.sbs .tl-time{color:var(--text-3);flex-shrink:0;font-size:10px;}
`;
