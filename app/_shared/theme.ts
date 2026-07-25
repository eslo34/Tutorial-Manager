// StepByStep design system, scoped to .sbs. One stylesheet for every page now
// that the dashboard and the pipeline board are the same app.
export const CSS = `
.sbs{
  --ground:#0A0C10;--raised:#12151B;--inset:#06080B;
  --line:rgba(151,164,190,.12);--line-2:rgba(151,164,190,.20);
  --text:#ECEDE7;--text-2:#A7ACB7;--text-3:#6C7280;
  --sync:#5FE38C;--sync-dim:rgba(95,227,140,.14);--sync-line:rgba(95,227,140,.34);
  --render:#F5B44C;--render-dim:rgba(245,180,76,.15);--render-line:rgba(245,180,76,.36);
  --review:#7FA8FF;--review-dim:rgba(127,168,255,.14);--review-line:rgba(127,168,255,.38);
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
.sbs .wrap.narrow{max-width:980px;}

/* ── split view (video page): fixed page, two independently scrolling panes ── */
.sbs.split{height:100vh;overflow:hidden;}
.sbs .split-wrap{max-width:1720px;height:100vh;padding:20px 22px 18px;display:flex;flex-direction:column;}
.sbs .vhead{flex-shrink:0;}
.sbs .vhead .head{margin-bottom:16px;}
.sbs .vhead .crumb{margin-bottom:10px;}
.sbs .vcols{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.12fr);gap:22px;}
.sbs .vcol{min-height:0;min-width:0;overflow-y:auto;overscroll-behavior:contain;}
.sbs .vcol.left{padding-right:10px;padding-bottom:28px;}
.sbs .vcol.right{display:flex;flex-direction:column;overflow:hidden;}
/* first section in a pane shouldn't push itself down from the pane top */
.sbs .vcol > *:first-child .eyebrow.sec,.sbs .vcol > .eyebrow.sec:first-child{margin-top:0;}
.sbs .vcol.right .editor{flex:1;min-height:0;}
.sbs .vcol.right .editor-area{height:100%;max-height:none;min-height:0;resize:none;}
.sbs .vcol.right .regen{flex-shrink:0;max-height:38vh;overflow:auto;}
.sbs .vcol.right .editbar{flex-shrink:0;}

/* ── header ─────────────────────────────────────────────────────────────── */
.sbs .head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:26px;}
.sbs .brand{display:flex;align-items:center;gap:14px;min-width:0;}
.sbs .logo{display:inline-flex;align-items:flex-end;gap:3px;height:20px;flex-shrink:0;}
.sbs .logo b{width:4px;border-radius:2px;background:var(--sync);box-shadow:0 0 8px var(--sync-line);animation:eq 1.6s var(--ease) infinite;}
.sbs .logo b:nth-child(1){height:9px;animation-delay:0s;}
.sbs .logo b:nth-child(2){height:15px;animation-delay:.2s;}
.sbs .logo b:nth-child(3){height:20px;animation-delay:.4s;}
.sbs .eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--text-3);}
.sbs .eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--sync);box-shadow:0 0 8px var(--sync);flex-shrink:0;}
.sbs .eyebrow .dot.dim{background:var(--text-3);box-shadow:none;}
.sbs .eyebrow.sec{margin:30px 0 14px;}
.sbs .headright{display:flex;align-items:center;gap:14px;flex-shrink:0;}
.sbs .live{display:inline-flex;align-items:center;gap:9px;font-size:10px;letter-spacing:.16em;color:var(--text-3);white-space:nowrap;}
.sbs .live .scan{width:22px;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,var(--sync),transparent);animation:scan 2.4s linear infinite;}
.sbs .note{color:var(--text-2);font-size:12px;letter-spacing:.06em;line-height:1.6;}
.sbs .crumb{margin-bottom:14px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;}
.sbs .crumb a{color:var(--text-3);}
.sbs .crumb a:hover{color:var(--sync);}
.sbs .ctitle{font-size:23px;font-weight:800;letter-spacing:-.02em;color:var(--text);margin:0 0 4px;}
.sbs .csub{font-size:12px;color:var(--text-3);margin:0 0 22px;letter-spacing:.03em;}

/* ── buttons ────────────────────────────────────────────────────────────── */
.sbs .btn{appearance:none;cursor:pointer;display:inline-flex;align-items:center;gap:7px;
  background:var(--raised);border:1px solid var(--line-2);color:var(--text-2);
  font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
  padding:8px 13px;border-radius:8px;transition:border-color .18s var(--ease),color .18s var(--ease),background .18s var(--ease);}
.sbs .btn:hover:not(:disabled){border-color:rgba(151,164,190,.42);color:var(--text);}
.sbs .btn:disabled{opacity:.45;cursor:default;}
.sbs .btn.primary{background:var(--sync-dim);border-color:var(--sync-line);color:var(--sync);}
.sbs .btn.primary:hover:not(:disabled){background:rgba(95,227,140,.2);border-color:var(--sync);color:var(--sync);}
.sbs .btn.danger{color:var(--stale);border-color:var(--stale-line);background:var(--stale-dim);}
.sbs .btn.ghost{background:transparent;}
.sbs .btn.sm{font-size:8.5px;padding:6px 10px;}

/* ── pills ──────────────────────────────────────────────────────────────── */
.sbs .pill{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:20px;font-family:var(--mono);
  font-size:10px;font-weight:600;letter-spacing:.13em;white-space:nowrap;flex-shrink:0;
  transition:background .5s var(--ease),border-color .5s var(--ease),color .5s var(--ease);}
.sbs .pill.sm{font-size:9px;padding:4px 9px;}
.sbs .pill .pdot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.sbs .pill.sync{color:var(--sync);background:var(--sync-dim);border:1px solid var(--sync-line);}
.sbs .pill.sync .pdot{background:var(--sync);box-shadow:0 0 8px var(--sync);}
.sbs .pill.render{color:var(--render);background:var(--render-dim);border:1px solid var(--render-line);}
.sbs .pill.render .pdot{background:var(--render);box-shadow:0 0 8px var(--render);animation:blink 1.3s var(--ease) infinite;}
.sbs .pill.review{color:var(--review);background:var(--review-dim);border:1px solid var(--review-line);}
.sbs .pill.review .pdot{background:var(--review);box-shadow:0 0 8px var(--review);}
.sbs .pill.stale{color:var(--stale);background:var(--stale-dim);border:1px solid var(--stale-line);}
.sbs .pill.stale .pdot{background:var(--stale);box-shadow:0 0 8px var(--stale);}

/* ── cards ──────────────────────────────────────────────────────────────── */
.sbs .card{background:var(--raised);border:1px solid var(--line-2);border-radius:var(--radius);box-shadow:var(--shadow);}
.sbs a.card,.sbs .card.link{color:inherit;text-decoration:none;display:block;transition:border-color .18s var(--ease),transform .18s var(--ease);}
.sbs a.card:hover,.sbs .card.link:hover{border-color:rgba(151,164,190,.42);transform:translateY(-1px);}
.sbs .clients-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;}
.sbs .client-card{padding:18px 20px;position:relative;}
.sbs .cc-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
.sbs .cc-name{font-size:17px;font-weight:700;color:var(--text);letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbs .cc-sub{font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);margin-top:6px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbs .cc-stats{display:flex;flex-wrap:wrap;gap:16px;margin-top:16px;font-size:11px;letter-spacing:.03em;color:var(--text-2);}
.sbs .cc-stats .stat{display:inline-flex;align-items:center;gap:7px;}
.sbs .cc-stats .stat b{width:7px;height:7px;border-radius:50%;display:inline-block;}
.sbs .cc-stats .stat.sync b{background:var(--sync);box-shadow:0 0 8px var(--sync);}
.sbs .cc-stats .stat.render b{background:var(--render);box-shadow:0 0 8px var(--render);}
.sbs .cc-stats .stat.review b{background:var(--review);box-shadow:0 0 8px var(--review);}
.sbs .cc-stats .stat.stale b{background:var(--stale);box-shadow:0 0 8px var(--stale);}
.sbs .cc-stats .stat.muted{color:var(--text-3);}
.sbs .cc-stats .stat.muted b{background:var(--text-3);box-shadow:none;}
.sbs .cardkill{position:absolute;top:12px;right:12px;z-index:3;appearance:none;cursor:pointer;
  background:transparent;border:0;color:var(--text-3);opacity:0;padding:5px;line-height:0;border-radius:6px;
  transition:opacity .18s var(--ease),color .18s var(--ease);}
.sbs .client-card:hover .cardkill,.sbs .tile:hover .cardkill{opacity:1;}
.sbs .cardkill:hover{color:var(--stale);background:var(--stale-dim);}

/* ── run flow motif ─────────────────────────────────────────────────────── */
.sbs .flows{display:flex;flex-direction:column;gap:14px;}
.sbs .flow{padding:16px 18px 14px;}
.sbs .flow-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
.sbs .flow-title{font-size:15px;font-weight:600;color:var(--text);letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbs .flow-sub{font-size:9.5px;letter-spacing:.1em;color:var(--text-3);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbs .motif{display:flex;align-items:center;gap:0;margin:16px 0 4px;}
.sbs .frame{flex:1;min-width:0;background:var(--inset);border:1px solid var(--line);border-radius:var(--radius-sm);overflow:hidden;}
.sbs .frame-bar{display:flex;align-items:center;gap:8px;height:30px;padding:0 11px;border-bottom:1px solid var(--line);}
.sbs .frame-bar i{width:7px;height:7px;border-radius:50%;background:rgba(151,164,190,.22);flex-shrink:0;}
.sbs .frame-url{flex:1;font-size:10px;letter-spacing:.04em;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-left:4px;}
.sbs .frame-body{padding:11px 12px;font-size:10.5px;color:var(--text-2);letter-spacing:.02em;line-height:1.4;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:38px;}
.sbs .eq{display:inline-flex;align-items:flex-end;gap:2px;height:12px;flex-shrink:0;}
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
.sbs .conn-track.review .conn-fill{background:var(--review);box-shadow:0 0 10px var(--review-line);}
.sbs .conn-track.stale .conn-fill{background:var(--stale);box-shadow:0 0 10px var(--stale-line);}
.sbs .conn-head{position:absolute;top:50%;width:9px;height:9px;margin-top:-4.5px;margin-left:-4.5px;border-radius:50%;transition:left .6s var(--ease);}
.sbs .conn-track.render .conn-head{background:var(--render);animation:headpulse 1.5s var(--ease) infinite;}
.sbs .conn-track.sync .conn-head{background:var(--sync);box-shadow:0 0 10px 2px var(--sync-line);}
.sbs .conn-track.review .conn-head{background:var(--review);box-shadow:0 0 10px 2px var(--review-line);}
.sbs .conn-track.stale .conn-head{background:var(--stale);box-shadow:0 0 9px 2px var(--stale-line);}
.sbs .conn-arrow{position:absolute;right:-8px;top:50%;margin-top:-5px;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:8px solid var(--line-2);}
.sbs .conn-track.sync .conn-arrow{border-left-color:var(--sync);}
.sbs .conn-track.render .conn-arrow{border-left-color:var(--render-line);}
.sbs .conn-track.review .conn-arrow{border-left-color:var(--review-line);}
.sbs .conn-track.stale .conn-arrow{border-left-color:var(--stale-line);}
.sbs .stream{margin-top:14px;border-top:1px solid var(--line);padding-top:11px;display:flex;flex-direction:column;gap:5px;}
.sbs .stream-row{display:flex;align-items:center;gap:12px;font-size:11px;}
.sbs .s-time{width:96px;flex-shrink:0;color:var(--text-3);}
.sbs .s-phase{width:66px;flex-shrink:0;color:var(--text-2);letter-spacing:.08em;text-transform:uppercase;font-size:9.5px;}
.sbs .s-detail{color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sbs .s-detail.err{color:var(--stale);}

/* ── video tiles ────────────────────────────────────────────────────────── */
.sbs .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:12px;}
.sbs .tile{padding:15px 16px;position:relative;}
.sbs .tile-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.sbs .tile-title{font-size:14px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:18px;}
.sbs .tile-client{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3);margin-top:4px;}
.sbs .tile-foot{font-size:9.5px;letter-spacing:.06em;color:var(--text-3);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sbs .tile-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;}
.sbs .mode{flex-shrink:0;font-family:var(--mono);font-size:8.5px;font-weight:600;letter-spacing:.16em;
  padding:3px 7px;border-radius:5px;border:1px solid var(--line-2);color:var(--text-3);white-space:nowrap;}
.sbs .mode.auto{color:var(--sync);border-color:var(--sync-line);background:rgba(95,227,140,.07);}
.sbs .mode.manual{color:var(--text-2);border-color:var(--line-2);background:rgba(151,164,190,.06);}

/* ── video page ─────────────────────────────────────────────────────────── */
.sbs .dhead{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:6px;}
.sbs .dtitle{margin:0;font-size:26px;font-weight:800;letter-spacing:-.03em;color:var(--text);}
.sbs .dsub{margin-top:7px;font-size:10px;letter-spacing:.1em;color:var(--text-3);}
.sbs .vdesc{margin:10px 0 0;font-size:13px;line-height:1.55;color:var(--text-2);max-width:70ch;}
.sbs .hpills{display:flex;align-items:center;gap:9px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;}

/* changes awaiting a decision */
.sbs .chgcards{display:flex;flex-direction:column;gap:10px;}
.sbs .chgcard{padding:14px 16px;}
.sbs .chgcard-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap;}
.sbs .src{font-size:9px;letter-spacing:.12em;color:var(--text-3);text-transform:uppercase;}
.sbs .src:hover{color:var(--sync);}
.sbs .chg-reason{margin:0 0 12px;font-size:13.5px;line-height:1.55;color:var(--text-2);}
.sbs .diff{display:flex;flex-direction:column;gap:7px;margin-bottom:13px;}
.sbs .diff-row{display:flex;gap:10px;font-size:12.5px;line-height:1.5;align-items:flex-start;}
.sbs .diff-tag{font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;padding:3px 6px;border-radius:4px;flex-shrink:0;margin-top:2px;}
.sbs .diff-row.old .diff-tag{background:var(--stale-dim);color:var(--stale);}
.sbs .diff-row.new .diff-tag{background:var(--sync-dim);color:var(--sync);}
.sbs .diff-row.old .diff-text{color:var(--text-3);text-decoration:line-through;text-decoration-color:var(--stale-line);}
.sbs .diff-row.new .diff-text{color:var(--text-2);}
.sbs .diff-text{min-width:0;word-break:break-word;}
.sbs .chg-actions{display:flex;gap:9px;flex-wrap:wrap;padding-top:12px;border-top:1px solid var(--line);}
.sbs .chg-hint{font-size:10px;color:var(--text-3);letter-spacing:.05em;padding-top:12px;border-top:1px solid var(--line);line-height:1.55;}

/* update mode */
.sbs .modebox{padding:16px 18px;}
.sbs .seg{display:inline-flex;border:1px solid var(--line-2);border-radius:9px;overflow:hidden;background:var(--inset);}
.sbs .seg button{appearance:none;background:transparent;border:0;cursor:pointer;color:var(--text-3);
  font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.14em;padding:8px 14px;
  transition:background .18s var(--ease),color .18s var(--ease);}
.sbs .seg button+button{border-left:1px solid var(--line-2);}
.sbs .seg button:hover:not(:disabled){color:var(--text-2);}
.sbs .seg button.on{background:var(--sync-dim);color:var(--sync);}
.sbs .seg button:disabled{cursor:default;opacity:.6;}
.sbs .mode-desc{margin:13px 0 0;font-size:13px;line-height:1.6;color:var(--text-2);max-width:74ch;}
.sbs .slugrow{display:flex;align-items:center;gap:11px;margin-top:15px;padding-top:14px;border-top:1px solid var(--line);flex-wrap:wrap;}
.sbs .slug-label{font-size:9px;letter-spacing:.16em;color:var(--text-3);}
.sbs .modeerr{margin:11px 0 0;font-size:11px;color:var(--stale);letter-spacing:.03em;}
.sbs .client-default{margin:10px 0 0;font-size:10px;line-height:1.55;letter-spacing:.05em;color:var(--text-3);}

/* inputs */
.sbs .inp{background:var(--inset);border:1px solid var(--line-2);border-radius:7px;color:var(--text);
  font-size:12.5px;letter-spacing:.02em;padding:9px 11px;outline:none;width:100%;font-family:var(--sans);
  transition:border-color .18s var(--ease);}
.sbs .inp.mono{font-family:var(--mono);font-size:11.5px;}
.sbs .inp::placeholder{color:var(--text-3);}
.sbs .inp:focus{border-color:var(--sync-line);}
.sbs textarea.inp{resize:vertical;line-height:1.6;}
.sbs .field{margin-bottom:14px;}
.sbs .field label{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-3);margin-bottom:7px;}

/* script editor: highlight layer under a transparent textarea */
.sbs .editor{position:relative;border-radius:var(--radius-sm);border:1px solid var(--line);background:var(--inset);overflow:hidden;}
.sbs .editor-layer,.sbs .editor-area{
  font:14px/1.72 var(--sans);padding:20px 22px;white-space:pre-wrap;word-break:break-word;
  letter-spacing:.01em;margin:0;border:0;}
.sbs .editor-layer{position:absolute;inset:0;pointer-events:none;color:transparent;overflow:hidden;z-index:0;}
.sbs .editor-area{position:relative;z-index:1;display:block;width:100%;min-height:340px;max-height:60vh;
  background:transparent;color:var(--text-2);resize:vertical;outline:none;overflow:auto;font-family:var(--sans);}
.sbs .editor-area:focus{outline:none;}
.sbs .editor.focused{border-color:var(--sync-line);}
.sbs .hl-accepted{background:rgba(95,227,140,.16);border-bottom:2px solid var(--sync);border-radius:3px;}
.sbs .hl-auto{background:rgba(127,168,255,.16);border-bottom:2px solid var(--review);border-radius:3px;}
.sbs .hl-pending{background:rgba(245,180,76,.16);border-bottom:2px solid var(--render);border-radius:3px;}
.sbs .hl-busy{background:rgba(127,168,255,.3);border-radius:3px;animation:blink 1.4s var(--ease) infinite;}
.sbs .editbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;flex-wrap:wrap;}
.sbs .legend{display:flex;gap:14px;flex-wrap:wrap;font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-3);}
.sbs .legend span{display:inline-flex;align-items:center;gap:6px;}
.sbs .legend i{width:9px;height:3px;border-radius:2px;display:inline-block;}
.sbs .legend i.a{background:var(--sync);}
.sbs .legend i.b{background:var(--review);}
.sbs .legend i.c{background:var(--render);}
.sbs .dirty{font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--render);}

/* selection → regenerate panel */
.sbs .regen{margin-top:12px;padding:14px 16px;}
.sbs .regen-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;}
.sbs .regen-label{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--review);}
.sbs .regen-quote{margin-top:8px;font-size:12px;line-height:1.55;color:var(--text-3);max-height:74px;overflow:auto;
  background:var(--inset);border-radius:7px;padding:9px 11px;border:1px solid var(--line);}

/* run timeline */
.sbs .runbox{padding:14px 16px;}
.sbs .runbox-top{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;letter-spacing:.12em;color:var(--text-2);text-transform:uppercase;padding-bottom:11px;border-bottom:1px solid var(--line);flex-wrap:wrap;}
.sbs .runbox-top .rt{color:var(--text-3);}
.sbs .tl{display:flex;flex-direction:column;gap:7px;padding-top:11px;max-height:340px;overflow:auto;}
.sbs .tl-row{display:flex;align-items:center;gap:11px;font-size:11px;}
.sbs .tl-dot{width:7px;height:7px;border-radius:50%;background:var(--text-3);flex-shrink:0;}
.sbs .tl-dot[data-s="done"]{background:var(--sync);box-shadow:0 0 7px var(--sync-line);}
.sbs .tl-dot[data-s="error"]{background:var(--stale);}
.sbs .tl-phase{width:66px;flex-shrink:0;color:var(--text-2);letter-spacing:.08em;text-transform:uppercase;font-size:9.5px;}
.sbs .tl-detail{flex:1;color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.sbs .tl-detail.err{color:var(--stale);}
.sbs .tl-time{color:var(--text-3);flex-shrink:0;font-size:10px;}

/* banners */
.sbs .banner{padding:13px 16px;border-radius:var(--radius-sm);font-size:12.5px;line-height:1.6;margin-bottom:14px;border:1px solid;}
.sbs .banner.review{background:var(--review-dim);border-color:var(--review-line);color:var(--review);}
.sbs .banner.sync{background:var(--sync-dim);border-color:var(--sync-line);color:var(--sync);}
.sbs .banner.stale{background:var(--stale-dim);border-color:var(--stale-line);color:var(--stale);}
.sbs .banner b{font-weight:700;}

/* ── modal ──────────────────────────────────────────────────────────────── */
.sbs .scrim{position:fixed;inset:0;background:rgba(4,6,10,.72);backdrop-filter:blur(3px);
  display:flex;align-items:center;justify-content:center;padding:20px;z-index:60;}
.sbs .modal{background:var(--raised);border:1px solid var(--line-2);border-radius:var(--radius);
  box-shadow:var(--shadow);width:100%;max-width:460px;max-height:86vh;overflow:auto;}
.sbs .modal.wide{max-width:560px;}
.sbs .modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 20px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--raised);z-index:1;}
.sbs .modal-title{font-size:15px;font-weight:700;letter-spacing:-.01em;color:var(--text);}
.sbs .modal-x{appearance:none;background:transparent;border:0;cursor:pointer;color:var(--text-3);padding:4px;line-height:0;border-radius:6px;}
.sbs .modal-x:hover{color:var(--text);}
.sbs .modal-body{padding:20px;}
.sbs .modal-foot{display:flex;justify-content:flex-end;gap:9px;padding:0 20px 20px;flex-wrap:wrap;}
.sbs .modal-note{font-size:12px;line-height:1.6;color:var(--text-2);margin:0 0 16px;}
.sbs .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.sbs .runlog{border:1px solid var(--line);border-radius:var(--radius-sm);max-height:180px;overflow:auto;}
.sbs .runlog-row{padding:9px 11px;font-size:11px;border-bottom:1px solid var(--line);}
.sbs .runlog-row:last-child{border-bottom:0;}
.sbs .runlog-top{display:flex;justify-content:space-between;gap:10px;color:var(--text-3);font-family:var(--mono);font-size:9.5px;}
.sbs .runlog-sum{color:var(--text-2);margin-top:4px;line-height:1.5;}

/* ── empty state ────────────────────────────────────────────────────────── */
.sbs .empty{text-align:center;padding:64px 20px;}
.sbs .empty h2{font-size:19px;font-weight:700;color:var(--text);margin:0 0 8px;letter-spacing:-.01em;}
.sbs .empty p{font-size:13px;color:var(--text-2);margin:0 auto 22px;max-width:46ch;line-height:1.65;}

@keyframes headpulse{0%,100%{box-shadow:0 0 6px 1px var(--render-line);transform:scale(1)}50%{box-shadow:0 0 15px 4px var(--render-line);transform:scale(1.3)}}
@keyframes eq{0%,100%{transform:scaleY(.55)}50%{transform:scaleY(1)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes scan{0%{transform:translateX(-6px);opacity:.3}50%{opacity:1}100%{transform:translateX(6px);opacity:.3}}

/* Below this the two panes don't have room — fall back to one normal scrolling page. */
@media (max-width:1080px){
  .sbs.split{height:auto;overflow:visible;}
  .sbs .split-wrap{height:auto;display:block;padding:22px 20px 0;}
  .sbs .vcols{display:block;}
  .sbs .vcol{overflow:visible;min-height:0;}
  .sbs .vcol.left{padding-right:0;padding-bottom:0;}
  .sbs .vcol.right{display:block;overflow:visible;margin-top:30px;}
  .sbs .vcol.right .editor{flex:none;}
  .sbs .vcol.right .editor-area{height:auto;min-height:340px;max-height:60vh;resize:vertical;}
  .sbs .vcol.right .regen{max-height:none;overflow:visible;}
  .sbs .vcol > *:first-child .eyebrow.sec{margin-top:0;}
}

@media (max-width:640px){
  .sbs .motif{flex-direction:column;gap:6px;}
  .sbs .conn{width:100%;padding:6px 0;}
  .sbs .conn-track{width:60%;margin:0 auto;}
  .sbs .frame{width:100%;}
  .sbs .flow-title,.sbs .flow-sub{white-space:normal;}
  .sbs .dhead{flex-direction:column;}
  .sbs .hpills{justify-content:flex-start;}
  .sbs .grid2{grid-template-columns:1fr;}
  .sbs .s-time{width:auto;}
}
@media (prefers-reduced-motion:reduce){
  .sbs .conn-head,.sbs .logo b,.sbs .eq b,.sbs .live .scan,.sbs .pill.render .pdot,.sbs .hl-busy{animation:none;}
}
`;
