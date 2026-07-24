'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// ── types (mirror /api/pipeline/runs) ───────────────────────────────────────
export type Evt = { phase: string; status: string; detail: string | null; at: string };
export type Run = {
  id: string; projectId: string; video: string | null; clientId: string | null; client: string | null;
  status: string; path: string | null; trigger: string | null; phase: string | null;
  detail: string | null; started_at: string; updated_at: string; finished_at: string | null;
  events: Evt[];
};
export type Video = {
  id: string; title: string; clientId: string | null; client: string | null; pending: number;
  autoUpdate?: boolean; // false/absent = notify-only: checked + emailed, updated by hand
};
export type Board = { generatedAt: string; videos: Video[]; runs: Run[] };

export const PHASES = ['detect', 'brief', 'editing', 'written', 'reference', 'render', 'splice', 'proxy', 'beats', 'resync', 'ready'];

export function kindOf(status: string): 'sync' | 'render' | 'stale' {
  if (status === 'ready_for_review' || status === 'done') return 'sync';
  if (status === 'error') return 'stale';
  return 'render'; // running | halted
}
export function labelOf(run: Run): string {
  if (run.status === 'ready_for_review') return 'READY FOR REVIEW';
  if (run.status === 'done') return 'IN SYNC';
  if (run.status === 'halted') return 'HALTED';
  if (run.status === 'error') return 'ERROR';
  return (run.phase ?? 'working').toUpperCase();
}
export function videoState(latest: Run | undefined, pending: number): { kind: 'sync' | 'render' | 'stale'; label: string } {
  if (latest?.status === 'running') return { kind: 'render', label: (latest.phase ?? 'updating').toUpperCase() };
  if (latest?.status === 'halted') return { kind: 'render', label: 'HALTED' };
  if (latest?.status === 'error') return { kind: 'stale', label: 'ERROR' };
  if (latest?.status === 'ready_for_review') return { kind: 'sync', label: 'READY FOR REVIEW' };
  if (pending > 0) return { kind: 'stale', label: `STALE · ${pending} CHANGE${pending > 1 ? 'S' : ''}` };
  return { kind: 'sync', label: 'IN SYNC' };
}
export function ago(iso: string | null) {
  if (!iso) return '—';
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }); } catch { return '—'; }
}

// Fetch + poll the whole board every 4s. Both the clients overview and the per-client
// board use this and filter client-side (the dataset is small).
export function useBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch('/api/pipeline/runs?limit=100', { cache: 'no-store' });
        if (res.status === 401) { if (alive) setError('unauthorized'); return; }
        const data = await res.json();
        if (alive) { setBoard(data); setError(null); }
      } catch { if (alive) setError('network'); }
    };
    load();
    const id = setInterval(load, 4000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return { board, error };
}

// ── one active run, rendered as the SOURCE -> connector -> VIDEO motif ───────
export function RunFlow({ run }: { run: Run }) {
  const kind = kindOf(run.status);
  const running = run.status === 'running';
  const idx = run.phase ? PHASES.indexOf(run.phase) : -1;
  const progress = idx < 0 ? 0 : idx / (PHASES.length - 1);

  return (
    <Link className="card flow" href={`/pipeline/${run.projectId}`}>
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
            <div className="conn-fill" style={{ width: `${(kind === 'sync' ? 1 : progress) * 100}%` }} />
            <span className="conn-head" style={{ left: `${(kind === 'sync' ? 1 : progress) * 100}%` }} />
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

// ── a video tile in the grid ────────────────────────────────────────────────
export function VideoTile({ video, latest }: { video: Video; latest?: Run }) {
  const st = videoState(latest, video.pending);
  const manual = video.autoUpdate === false;
  // A notify-only video is never auto-updated, so "stale" means "we emailed you,
  // it's waiting on a person" — say that instead of implying a run is coming.
  const foot = latest
    ? `updated ${ago(latest.updated_at)}`
    : video.pending > 0
      ? manual ? 'change detected · emailed · update manually' : 'change detected · needs update'
      : 'no updates · in sync';
  return (
    <Link className="card tile" href={`/pipeline/${video.id}`}>
      <div className="tile-top">
        <div className="min0">
          <div className="tile-title">{video.title}</div>
          <div className="mono tile-client">{video.client ?? ''}</div>
        </div>
        <span className={`pill sm ${st.kind}`}><span className="pdot" />{st.label}</span>
      </div>
      <div className="tile-bottom">
        <span className="mono tile-foot">{foot}</span>
        <span className={`mode ${manual ? 'manual' : 'auto'}`}>{manual ? 'MANUAL' : 'AUTO'}</span>
      </div>
    </Link>
  );
}

// ── StepByStep design system, scoped to .sbs ────────────────────────────────
export const CSS = `
.sbs{
  --ground:#0A0C10;--raised:#12151B;--inset:#06080B;
  --line:rgba(151,164,190,.12);--line-2:rgba(151,164,190,.20);
  --text:#ECEDE7;--text-2:#A7ACB7;--text-3:#6C7280;
  --sync:#5FE38C;--sync-dim:rgba(95,227,140,.14);--sync-line:rgba(95,227,140,.34);
  --render:#F5B44C;--render-dim:rgba(245,180,76,.15);--render-line:rgba(245,180,76,.36);
  --stale:#FF6B6B;--stale-dim:rgba(255,107,107,.14);--stale-line:rgba(255,107,107,.40);
  --radius:16px;--radius-sm:10px;--shadow:0 24px 70px -28px rgba(0,0,0,.75);
  --ease:cubic-bezier(.22,1,.36,1);
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI Variable Display","Segoe UI",system-ui,Roboto,Helvetica,Arial,sans-serif;
  --mono:ui-monospace,"Cascadia Code","SF Mono","Segoe UI Mono",Menlo,Consolas,monospace;
  position:relative;min-height:100vh;background:var(--ground);color:var(--text);
  font-family:var(--sans);-webkit-font-smoothing:antialiased;overflow-x:hidden;
}
.sbs .mono{font-family:var(--mono);font-variant-numeric:tabular-nums;}
.sbs .min0{min-width:0;}
.sbs a{color:var(--sync);text-decoration:none;}
.sbs .glow{position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(60% 50% at 12% 0%,rgba(95,227,140,.06),transparent 70%),
             radial-gradient(50% 45% at 92% 8%,rgba(108,92,231,.07),transparent 70%);}
.sbs .wrap{position:relative;z-index:1;max-width:1240px;margin:0 auto;padding:22px 20px 0;}

.sbs .head{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px;}
.sbs .brand{display:flex;align-items:center;gap:14px;}
.sbs .logo{display:inline-flex;align-items:flex-end;gap:3px;height:20px;}
.sbs .logo b{width:4px;border-radius:2px;background:var(--sync);box-shadow:0 0 8px var(--sync-line);animation:eq 1.6s var(--ease) infinite;}
.sbs .logo b:nth-child(1){height:9px;animation-delay:0s;}
.sbs .logo b:nth-child(2){height:15px;animation-delay:.2s;}
.sbs .logo b:nth-child(3){height:20px;animation-delay:.4s;}
.sbs .eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--text-3);}
.sbs .eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--sync);box-shadow:0 0 8px var(--sync);}
.sbs .eyebrow .dot.dim{background:var(--text-3);box-shadow:none;}
.sbs .eyebrow.sec{margin:0 0 14px;}
.sbs .live{display:inline-flex;align-items:center;gap:9px;font-size:10px;letter-spacing:.16em;color:var(--text-3);}
.sbs .live .scan{width:22px;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,var(--sync),transparent);animation:scan 2.4s linear infinite;}
.sbs .note{color:var(--text-2);font-size:12px;letter-spacing:.08em;}

/* breadcrumb + section title (per-client page) */
.sbs .crumb{margin-bottom:14px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;}
.sbs .crumb a{color:var(--text-3);}
.sbs .crumb a:hover{color:var(--sync);}
.sbs .ctitle{font-size:23px;font-weight:800;letter-spacing:-.02em;color:var(--text);margin:0 0 22px;}

.sbs .card{background:var(--raised);border:1px solid var(--line-2);border-radius:var(--radius);box-shadow:var(--shadow);}
.sbs a.card{color:inherit;text-decoration:none;display:block;transition:border-color .18s var(--ease),transform .18s var(--ease);}
.sbs a.card:hover{border-color:rgba(151,164,190,.42);transform:translateY(-1px);}
.sbs .flows{display:flex;flex-direction:column;gap:14px;margin-bottom:34px;}
.sbs .flow{padding:16px 18px 14px;}
.sbs .flow-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
.sbs .flow-title{font-size:15px;font-weight:600;color:var(--text);letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbs .flow-sub{font-size:9.5px;letter-spacing:.1em;color:var(--text-3);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* pills */
.sbs .pill{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:20px;font-family:var(--mono);
  font-size:10px;font-weight:600;letter-spacing:.13em;white-space:nowrap;flex-shrink:0;
  transition:background .5s var(--ease),border-color .5s var(--ease),color .5s var(--ease);}
.sbs .pill.sm{font-size:9px;padding:4px 9px;}
.sbs .pill .pdot{width:7px;height:7px;border-radius:50%;}
.sbs .pill.sync{color:var(--sync);background:var(--sync-dim);border:1px solid var(--sync-line);}
.sbs .pill.sync .pdot{background:var(--sync);box-shadow:0 0 8px var(--sync);}
.sbs .pill.render{color:var(--render);background:var(--render-dim);border:1px solid var(--render-line);}
.sbs .pill.render .pdot{background:var(--render);box-shadow:0 0 8px var(--render);animation:blink 1.3s var(--ease) infinite;}
.sbs .pill.stale{color:var(--stale);background:var(--stale-dim);border:1px solid var(--stale-line);}
.sbs .pill.stale .pdot{background:var(--stale);box-shadow:0 0 8px var(--stale);}

/* client cards (overview level) */
.sbs .clients-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;}
.sbs .client-card{padding:18px 20px;}
.sbs .cc-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
.sbs .cc-name{font-size:17px;font-weight:700;color:var(--text);letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbs .cc-sub{font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);margin-top:6px;}
.sbs .cc-stats{display:flex;flex-wrap:wrap;gap:16px;margin-top:16px;font-size:11px;letter-spacing:.03em;color:var(--text-2);}
.sbs .cc-stats .stat{display:inline-flex;align-items:center;gap:7px;}
.sbs .cc-stats .stat b{width:7px;height:7px;border-radius:50%;display:inline-block;}
.sbs .cc-stats .stat.sync b{background:var(--sync);box-shadow:0 0 8px var(--sync);}
.sbs .cc-stats .stat.render b{background:var(--render);box-shadow:0 0 8px var(--render);}
.sbs .cc-stats .stat.stale b{background:var(--stale);box-shadow:0 0 8px var(--stale);}
.sbs .cc-stats .stat.muted{color:var(--text-3);}
.sbs .cc-stats .stat.muted b{background:var(--text-3);box-shadow:none;}

/* the SOURCE -> connector -> VIDEO motif */
.sbs .motif{display:flex;align-items:center;gap:0;margin:16px 0 4px;}
.sbs .frame{flex:1;min-width:0;background:var(--inset);border:1px solid var(--line);border-radius:var(--radius-sm);overflow:hidden;}
.sbs .frame-bar{display:flex;align-items:center;gap:8px;height:30px;padding:0 11px;border-bottom:1px solid var(--line);}
.sbs .frame-bar i{width:7px;height:7px;border-radius:50%;background:rgba(151,164,190,.22);}
.sbs .frame-url{flex:1;font-size:10px;letter-spacing:.04em;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-left:4px;}
.sbs .frame-body{padding:11px 12px;font-size:10.5px;color:var(--text-2);letter-spacing:.02em;line-height:1.4;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:38px;}
.sbs .eq{display:inline-flex;align-items:flex-end;gap:2px;height:12px;}
.sbs .eq b{width:2.5px;border-radius:2px;background:var(--sync);}
.sbs .eq b:nth-child(1){height:5px;animation:eq 1s var(--ease) infinite .0s;}
.sbs .eq b:nth-child(2){height:10px;animation:eq 1s var(--ease) infinite .15s;}
.sbs .eq b:nth-child(3){height:6px;animation:eq 1s var(--ease) infinite .3s;}
.sbs .eq b:nth-child(4){height:9px;animation:eq 1s var(--ease) infinite .45s;}

.sbs .conn{width:152px;flex-shrink:0;padding:0 16px;}
.sbs .conn-phase{font-size:9px;letter-spacing:.16em;color:var(--text-3);text-align:center;margin-bottom:9px;height:11px;text-transform:uppercase;}
.sbs .conn-track{position:relative;height:3px;background:var(--line-2);border-radius:3px;}
.sbs .conn-fill{position:absolute;left:0;top:0;bottom:0;border-radius:3px;transition:width .6s var(--ease);}
.sbs .conn-track.render .conn-fill{background:var(--render);box-shadow:0 0 10px var(--render-line);}
.sbs .conn-track.sync .conn-fill{background:var(--sync);box-shadow:0 0 10px var(--sync-line);}
.sbs .conn-track.stale .conn-fill{background:var(--stale);box-shadow:0 0 10px var(--stale-line);}
.sbs .conn-head{position:absolute;top:50%;width:9px;height:9px;margin-top:-4.5px;margin-left:-4.5px;border-radius:50%;transition:left .6s var(--ease);}
.sbs .conn-track.render .conn-head{background:var(--render);animation:headpulse 1.5s var(--ease) infinite;}
.sbs .conn-track.sync .conn-head{background:var(--sync);box-shadow:0 0 10px 2px var(--sync-line);}
.sbs .conn-track.stale .conn-head{background:var(--stale);box-shadow:0 0 9px 2px var(--stale-line);}
.sbs .conn-arrow{position:absolute;right:-8px;top:50%;margin-top:-5px;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:8px solid var(--line-2);}
.sbs .conn-track.sync .conn-arrow{border-left-color:var(--sync);}
.sbs .conn-track.render .conn-arrow{border-left-color:var(--render-line);}
.sbs .conn-track.stale .conn-arrow{border-left-color:var(--stale-line);}

.sbs .stream{margin-top:14px;border-top:1px solid var(--line);padding-top:11px;display:flex;flex-direction:column;gap:5px;}
.sbs .stream-row{display:flex;align-items:center;gap:12px;font-size:11px;}
.sbs .s-time{width:76px;flex-shrink:0;color:var(--text-3);}
.sbs .s-phase{width:66px;flex-shrink:0;color:var(--text-2);letter-spacing:.08em;text-transform:uppercase;font-size:9.5px;}
.sbs .s-detail{color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbs .s-detail.err{color:var(--stale);}

/* video grid */
.sbs .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;}
.sbs .tile{padding:15px 16px;}
.sbs .tile-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.sbs .tile-title{font-size:14px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbs .tile-client{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3);margin-top:4px;}
.sbs .tile-foot{font-size:9.5px;letter-spacing:.06em;color:var(--text-3);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sbs .tile-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;}

/* update mode: AUTO = the pipeline owns it, MANUAL = check + email only */
.sbs .mode{flex-shrink:0;font-family:var(--mono);font-size:8.5px;font-weight:600;letter-spacing:.16em;
  padding:3px 7px;border-radius:5px;border:1px solid var(--line-2);color:var(--text-3);}
.sbs .mode.auto{color:var(--sync);border-color:var(--sync-line);background:rgba(95,227,140,.07);}
.sbs .mode.manual{color:var(--text-2);border-color:var(--line-2);background:rgba(151,164,190,.06);}

@keyframes headpulse{0%,100%{box-shadow:0 0 6px 1px var(--render-line);transform:scale(1)}50%{box-shadow:0 0 15px 4px var(--render-line);transform:scale(1.3)}}
@keyframes eq{0%,100%{transform:scaleY(.55)}50%{transform:scaleY(1)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes scan{0%{transform:translateX(-6px);opacity:.3}50%{opacity:1}100%{transform:translateX(6px);opacity:.3}}

@media (max-width:640px){
  .sbs .motif{flex-direction:column;gap:6px;}
  .sbs .conn{width:100%;padding:6px 0;transform:none;}
  .sbs .conn-track{width:60%;margin:0 auto;}
  .sbs .frame{width:100%;}
  .sbs .flow-title,.sbs .flow-sub{white-space:normal;}
}
@media (prefers-reduced-motion:reduce){
  .sbs .conn-head,.sbs .logo b,.sbs .eq b,.sbs .live .scan,.sbs .pill.render .pdot{animation:none;}
}
`;
