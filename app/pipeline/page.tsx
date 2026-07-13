'use client';

import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

// ── types (mirror /api/pipeline/runs) ───────────────────────────────────────
type Evt = { phase: string; status: string; detail: string | null; at: string };
type Run = {
  id: string; projectId: string; video: string | null; client: string | null;
  status: string; path: string | null; trigger: string | null; phase: string | null;
  detail: string | null; started_at: string; updated_at: string; finished_at: string | null;
  events: Evt[];
};
type Video = { id: string; title: string; client: string | null };
type Board = { generatedAt: string; videos: Video[]; runs: Run[] };

const PHASES = ['detect', 'brief', 'editing', 'written', 'reference', 'render', 'splice', 'proxy', 'beats', 'resync', 'ready'];

// map a run status -> brand state (sync=green, render=amber, stale=red)
function kindOf(status: string): 'sync' | 'render' | 'stale' {
  if (status === 'ready_for_review' || status === 'done') return 'sync';
  if (status === 'error') return 'stale';
  return 'render'; // running | halted
}
function labelOf(run: Run): string {
  if (run.status === 'ready_for_review') return 'READY FOR REVIEW';
  if (run.status === 'done') return 'IN SYNC';
  if (run.status === 'halted') return 'HALTED';
  if (run.status === 'error') return 'ERROR';
  return (run.phase ?? 'working').toUpperCase(); // running -> current phase
}
function ago(iso: string | null) {
  if (!iso) return '—';
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }); } catch { return '—'; }
}

// ── one active run, rendered as the SOURCE -> connector -> VIDEO motif ───────
function RunFlow({ run }: { run: Run }) {
  const kind = kindOf(run.status);
  const running = run.status === 'running';
  const idx = run.phase ? PHASES.indexOf(run.phase) : -1;
  const progress = idx < 0 ? 0 : idx / (PHASES.length - 1);

  return (
    <div className="card flow">
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
        {/* SOURCE mini-frame */}
        <div className="frame src">
          <div className="frame-bar"><i /><i /><i /><span className="mono frame-url">product change</span></div>
          <div className="frame-body mono">{run.trigger ?? 'change detected'}</div>
        </div>

        {/* connector: fill to phase-progress + a traveling pulse + arrowhead */}
        <div className="conn">
          <div className="conn-phase mono">{(run.phase ?? '').toUpperCase()}{idx >= 0 ? ` · ${idx + 1}/${PHASES.length}` : ''}</div>
          <div className={`conn-track ${kind} ${running ? 'live' : ''}`}>
            <div className="conn-fill" style={{ width: `${(kind === 'sync' ? 1 : progress) * 100}%` }} />
            {running && <span className="conn-pulse" />}
            <span className="conn-arrow" />
          </div>
        </div>

        {/* VIDEO mini-frame */}
        <div className="frame vid">
          <div className="frame-bar">
            <i /><i /><i />
            <span className="mono frame-url">{(run.video ?? 'video').toLowerCase().replace(/\s+/g, '-')}.mp4</span>
            {running && <span className="eq"><b /><b /><b /><b /></span>}
          </div>
          <div className="frame-body mono">{run.detail ?? labelOf(run).toLowerCase()}</div>
        </div>
      </div>

      {/* event stream */}
      <div className="stream">
        {run.events.slice(0, 5).map((e, i) => (
          <div className="stream-row mono" key={i}>
            <span className="s-time">{ago(e.at)}</span>
            <span className="s-phase">{e.phase}</span>
            <span className={`s-detail ${e.status === 'error' ? 'err' : ''}`}>{e.detail ?? e.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── a video tile in the grid ────────────────────────────────────────────────
function VideoTile({ video, latest }: { video: Video; latest?: Run }) {
  const kind = latest ? kindOf(latest.status) : 'sync';
  const label = latest ? labelOf(latest) : 'IN SYNC';
  return (
    <div className="card tile">
      <div className="tile-top">
        <div className="min0">
          <div className="tile-title">{video.title}</div>
          <div className="mono tile-client">{video.client ?? ''}</div>
        </div>
        <span className={`pill sm ${kind}`}><span className="pdot" />{label}</span>
      </div>
      <div className="mono tile-foot">
        {latest ? `updated ${ago(latest.updated_at)}` : 'no updates · in sync'}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [beat, setBeat] = useState(0);

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
    const id = setInterval(() => { load(); setBeat((b) => b + 1); }, 4000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const runs = board?.runs ?? [];
  const active = runs.filter((r) => r.status === 'running' || r.status === 'halted');
  const latestByVideo = new Map<string, Run>();
  for (const r of runs) if (r.projectId && !latestByVideo.has(r.projectId)) latestByVideo.set(r.projectId, r);
  const videos = board?.videos ?? [];

  return (
    <div className="sbs">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="glow" aria-hidden />
      <main className="wrap">
        <header className="head">
          <div className="brand">
            <span className="logo"><b /><b /><b /></span>
            <span className="mono eyebrow"><span className="dot" />PIPELINE · MISSION CONTROL</span>
          </div>
          <div className="mono live">
            <span className="scan" />{board ? `LIVE · ${ago(board.generatedAt)}` : 'CONNECTING…'}
          </div>
        </header>

        {error === 'unauthorized' && (
          <p className="mono note">Please <a href="/">sign in</a> to view the pipeline.</p>
        )}
        {!board && !error && <p className="mono note">Loading…</p>}

        {active.length > 0 && (
          <section>
            <div className="mono eyebrow sec"><span className="dot" />IN PROGRESS · {active.length}</div>
            <div className="flows">{active.map((r) => <RunFlow key={r.id} run={r} />)}</div>
          </section>
        )}

        <section>
          <div className="mono eyebrow sec"><span className="dot dim" />VIDEOS · {videos.length}</div>
          <div className="grid">
            {videos.map((v) => <VideoTile key={v.id} video={v} latest={latestByVideo.get(v.id)} />)}
          </div>
        </section>
        <div style={{ height: 40 }} />
      </main>
    </div>
  );
}

// ── StepByStep design system, scoped to .sbs ────────────────────────────────
const CSS = `
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

.sbs .card{background:var(--raised);border:1px solid var(--line-2);border-radius:var(--radius);box-shadow:var(--shadow);}
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

.sbs .conn{width:132px;flex-shrink:0;padding:0 10px;}
.sbs .conn-phase{font-size:9px;letter-spacing:.16em;color:var(--text-3);text-align:center;margin-bottom:8px;height:11px;text-transform:uppercase;}
.sbs .conn-track{position:relative;height:2px;background:var(--line-2);border-radius:2px;}
.sbs .conn-fill{position:absolute;left:0;top:0;bottom:0;border-radius:2px;transition:width .6s var(--ease);}
.sbs .conn-track.render .conn-fill{background:var(--render);box-shadow:0 0 10px var(--render-line);}
.sbs .conn-track.sync .conn-fill{background:var(--sync);box-shadow:0 0 10px var(--sync-line);}
.sbs .conn-track.stale .conn-fill{background:var(--stale);}
.sbs .conn-arrow{position:absolute;right:-1px;top:-4px;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:7px solid var(--line-2);}
.sbs .conn-track.sync .conn-arrow{border-left-color:var(--sync);}
.sbs .conn-track.render .conn-arrow{border-left-color:var(--render);}
.sbs .conn-pulse{position:absolute;top:50%;left:-26px;width:26px;height:3px;margin-top:-1.5px;border-radius:3px;
  background:linear-gradient(90deg,rgba(245,180,76,0),var(--render));animation:flow 1.5s linear infinite;}
.sbs .conn-pulse::after{content:"";position:absolute;right:-1px;top:50%;margin-top:-3.5px;width:7px;height:7px;border-radius:50%;background:var(--render);box-shadow:0 0 12px 3px var(--render-line);}

/* event stream */
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
.sbs .tile-foot{margin-top:12px;font-size:9.5px;letter-spacing:.06em;color:var(--text-3);}

@keyframes flow{0%{left:-26px;opacity:0}14%{opacity:1}82%{opacity:1}100%{left:100%;opacity:0}}
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
  .sbs .conn-pulse,.sbs .logo b,.sbs .eq b,.sbs .live .scan,.sbs .pill.render .pdot{animation:none;}
}
`;
