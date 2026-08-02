'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Check, Video as VideoIcon, X, Wand2, Pencil } from 'lucide-react';
import { Change, Kind, Run, ago, labelOf, PHASES } from '../../_shared/model';
import { Header, Modal, Shell } from '../../_shared/ui';
import { locate, buildRanges, Range } from './locate';

type VideoInfo = {
  id: string; title: string; description: string; clientId: string | null; client: string | null;
  script: string; autoUpdate: boolean; editorProject: string | null; designUrl: string | null; clientAutoDefault: boolean;
  updatedAt: string;
};
type Data = { video: VideoInfo; changes: Change[]; runs: Run[] };

const sevKind: Record<string, Kind> = { critical: 'stale', moderate: 'render', minor: 'sync' };

// Same precedence as the board's videoState, computed from the detail payload.
function stateOf(changes: Change[], latest: Run | undefined): { kind: Kind; label: string } {
  if (latest?.status === 'running') return { kind: 'render', label: (latest.phase ?? 'updating').toUpperCase() };
  if (latest?.status === 'halted') return { kind: 'stale', label: 'HALTED' };
  if (latest?.status === 'error') return { kind: 'stale', label: 'ERROR' };
  const pending = changes.filter((c) => c.status === 'pending').length;
  const accepted = changes.filter((c) => c.status === 'accepted').length;
  const ready = latest?.status === 'ready_for_review';
  if (pending > 0) {
    return { kind: 'review', label: ready ? `READY · ${pending} TO REVIEW` : `${pending} CHANGE${pending > 1 ? 'S' : ''} TO REVIEW` };
  }
  if (accepted > 0) return { kind: 'review', label: `${accepted} TO RE-RECORD` };
  if (ready) return { kind: 'review', label: 'READY FOR REVIEW' };
  return { kind: 'sync', label: 'IN SYNC' };
}

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  // script editing
  const [draft, setDraft] = useState('');
  const [savedScript, setSavedScript] = useState('');
  const [savingScript, setSavingScript] = useState(false);
  const [focused, setFocused] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // selection → regenerate
  const [sel, setSel] = useState<{ text: string; start: number; end: number } | null>(null);
  const [instruction, setInstruction] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // actions
  const [busyEdit, setBusyEdit] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [actionErr, setActionErr] = useState<string | null>(null);

  // update mode
  const [slugDraft, setSlugDraft] = useState<string | null>(null);
  const [savingMode, setSavingMode] = useState(false);
  const [modeErr, setModeErr] = useState<string | null>(null);

  // edit title / description
  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState({ title: '', description: '', designUrl: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);

  // The poll must not overwrite text you're mid-sentence on, so it checks this
  // before replacing the draft.
  const dirtyRef = useRef(false);
  useEffect(() => { dirtyRef.current = draft !== savedScript; }, [draft, savedScript]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/pipeline/video/${id}`, { cache: 'no-store' });
      if (res.status === 401) { setError('unauthorized'); return; }
      if (res.status === 404) { setError('notfound'); return; }
      const d: Data = await res.json();
      setData(d);
      setError(null);
      setSavedScript(d.video.script);
      // Never clobber text you're in the middle of writing.
      if (!dirtyRef.current) setDraft(d.video.script);
    } catch {
      setError('network');
    }
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000); // live while a run is in flight
    return () => clearInterval(t);
  }, [load]);

  const video = data?.video;
  const changes = data?.changes ?? [];
  const runs = data?.runs ?? [];
  const latest = runs[0];
  const auto = video?.autoUpdate === true;

  const pending = changes.filter((c) => c.status === 'pending');
  const accepted = changes.filter((c) => c.status === 'accepted');
  const autoApplied = changes.filter((c) => c.status === 'auto_applied');
  const st = stateOf(changes, latest);
  const dirty = draft !== savedScript;

  const ranges: Range[] = data ? buildRanges(draft, changes) : [];

  // ── script persistence ────────────────────────────────────────────────────
  const saveScript = async (next: string) => {
    setSavingScript(true);
    setActionErr(null);
    try {
      const res = await fetch('/api/save-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, script: next }),
      });
      const j = await res.json();
      if (!j.success) { setActionErr(j.error ?? 'Could not save the script.'); return false; }
      setSavedScript(next);
      setDraft(next);
      return true;
    } catch {
      setActionErr('Network error while saving.');
      return false;
    } finally {
      setSavingScript(false);
    }
  };

  // ── accept / decline / mark recorded ──────────────────────────────────────
  const acceptChange = async (change: Change) => {
    if (dirty) {
      setActionErr('Save or revert your script edits first — accepting rewrites the script.');
      return;
    }
    const hit = locate(savedScript, change.original_text, pending, change.id);
    if (!hit) {
      setActionErr('Could not find that wording in the current script. Edit it by hand below, then decline this suggestion.');
      return;
    }
    setBusyEdit(change.id);
    setActionErr(null);
    const next = savedScript.slice(0, hit.start) + change.suggested_replacement + savedScript.slice(hit.end);
    const ok = await saveScript(next);
    if (ok) {
      await fetch('/api/pending-edits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editId: change.id, action: 'accept' }),
      });
      await load();
    }
    setBusyEdit(null);
  };

  const resolveChange = async (change: Change, action: 'decline' | 'mark_recorded') => {
    setBusyEdit(change.id);
    setActionErr(null);
    try {
      await fetch('/api/pending-edits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editId: change.id, action }),
      });
      await load();
    } finally {
      setBusyEdit(null);
    }
  };

  const approveRun = async () => {
    setApproving(true);
    setActionErr(null);
    try {
      const res = await fetch(`/api/pipeline/video/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setActionErr(j.error ?? 'Could not approve the run.');
        return;
      }
      await load();
    } finally {
      setApproving(false);
    }
  };

  // ── update mode ───────────────────────────────────────────────────────────
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
      setSlugDraft(null);
      await load();
    } catch {
      setModeErr('Network error.');
    } finally {
      setSavingMode(false);
    }
  };

  // ── edit title / description / design URL ─────────────────────────────────
  const openEdit = () => {
    if (!video) return;
    setEdit({ title: video.title, description: video.description, designUrl: video.designUrl ?? '' });
    setEditErr(null);
    setShowEdit(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit.title.trim()) return;
    setEditSaving(true);
    setEditErr(null);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: edit.title.trim(), description: edit.description.trim(), designUrl: edit.designUrl.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setEditErr(j.error ?? 'Could not save.');
        return;
      }
      setShowEdit(false);
      await load();
    } catch {
      setEditErr('Network error.');
    } finally {
      setEditSaving(false);
    }
  };

  // ── partial regeneration ──────────────────────────────────────────────────
  const onSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (el.selectionStart === el.selectionEnd) { if (!regenerating) setSel(null); return; }
    setSel({ text: el.value.slice(el.selectionStart, el.selectionEnd), start: el.selectionStart, end: el.selectionEnd });
  };

  const regenerate = async () => {
    if (!sel || !instruction.trim()) return;
    setRegenerating(true);
    setActionErr(null);
    try {
      const res = await fetch('/api/regenerate-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id,
          currentScript: draft,
          selectedText: sel.text,
          beforeContext: draft.slice(Math.max(0, sel.start - 200), sel.start),
          afterContext: draft.slice(sel.end, Math.min(draft.length, sel.end + 200)),
          selectionStart: sel.start,
          selectionEnd: sel.end,
          modificationRequest: instruction,
        }),
      });
      const j = await res.json();
      if (!j.success) { setActionErr(j.error ?? 'Regeneration failed.'); return; }
      // The API persists the splice itself, so this is the new saved state.
      setDraft(j.newCompleteScript);
      setSavedScript(j.newCompleteScript);
      setInstruction('');
      setSel(null);
    } catch {
      setActionErr('Network error during regeneration.');
    } finally {
      setRegenerating(false);
    }
  };

  // keep the highlight layer aligned with the textarea
  const syncScroll = () => {
    if (layerRef.current && areaRef.current) {
      layerRef.current.scrollTop = areaRef.current.scrollTop;
      layerRef.current.scrollLeft = areaRef.current.scrollLeft;
    }
  };

  if (error === 'unauthorized') {
    return <Shell narrow><Header /><p className="mono note">Please <Link href="/">sign in</Link>.</p></Shell>;
  }
  if (error === 'notfound') {
    return <Shell narrow><Header /><p className="mono note">Video not found. <Link href="/">Back to clients</Link>.</p></Shell>;
  }
  if (!video) {
    return <Shell narrow><Header /><p className="mono note">Loading…</p></Shell>;
  }

  // ── section builders (ordered by mode below) ──────────────────────────────
  const changesSection = pending.length > 0 && (
    <section key="pending">
      <div className="mono eyebrow sec"><span className="dot" />CHANGES TO REVIEW · {pending.length}</div>
      <div className="chgcards">
        {pending.map((c) => {
          const hit = locate(draft, c.original_text, pending, c.id);
          const busy = busyEdit === c.id;
          return (
            <div className="card chgcard" key={c.id}>
              <div className="chgcard-top">
                <span className={`pill sm ${sevKind[c.severity] ?? 'render'}`}>
                  <span className="pdot" />{c.severity.toUpperCase()} · {c.category.replace(/_/g, ' ')}
                </span>
                {c.source_url && c.source_url !== 'animation-pipeline' && (
                  <a className="mono src" href={c.source_url} target="_blank" rel="noreferrer">source ↗</a>
                )}
              </div>
              <p className="chg-reason">{c.reason}</p>
              <div className="diff">
                <div className="diff-row old"><span className="diff-tag mono">NOW</span><span className="diff-text">{c.original_text}</span></div>
                <div className="diff-row new"><span className="diff-tag mono">NEW</span><span className="diff-text">{c.suggested_replacement}</span></div>
              </div>
              {hit ? (
                <div className="chg-actions">
                  <button type="button" className="btn primary" disabled={busy || savingScript} onClick={() => acceptChange(c)}>
                    <Check className="w-3.5 h-3.5" />{busy ? 'Applying…' : 'Accept'}
                  </button>
                  <button type="button" className="btn" disabled={busy} onClick={() => resolveChange(c, 'decline')}>
                    <X className="w-3.5 h-3.5" />Decline
                  </button>
                </div>
              ) : (
                <div className="chg-hint mono">
                  This wording isn&rsquo;t in the current script any more, so it can&rsquo;t be applied
                  automatically. Edit the script below by hand, then decline this suggestion.
                  <div style={{ marginTop: 9 }}>
                    <button type="button" className="btn sm" disabled={busy} onClick={() => resolveChange(c, 'decline')}>
                      <X className="w-3 h-3" />Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  const recordSection = accepted.length > 0 && (
    <section key="accepted">
      <div className="mono eyebrow sec"><span className="dot" />AWAITING RE-RECORDING · {accepted.length}</div>
      <div className="banner review">
        These edits are already in the script and highlighted green below. Film each section, then
        mark it recorded to clear it.
      </div>
      <div className="chgcards">
        {accepted.map((c) => (
          <div className="card chgcard" key={c.id}>
            <p className="chg-reason">{c.suggested_replacement}</p>
            <div className="chg-actions">
              <button type="button" className="btn primary" disabled={busyEdit === c.id} onClick={() => resolveChange(c, 'mark_recorded')}>
                <VideoIcon className="w-3.5 h-3.5" />{busyEdit === c.id ? 'Saving…' : 'Mark as recorded'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const autoSection = autoApplied.length > 0 && (
    <section key="auto">
      <div className="mono eyebrow sec"><span className="dot dim" />UPDATED BY THE PIPELINE · {autoApplied.length}</div>
      <div className="banner review">
        The pipeline regenerated these lines and the voiceover to match — script and audio are
        already in sync, so there&rsquo;s nothing to re-record. They&rsquo;re highlighted blue below.
      </div>
      <div className="chgcards">
        {autoApplied.map((c) => (
          <div className="card chgcard" key={c.id}>
            <p className="chg-reason">{c.reason}</p>
            <div className="diff" style={{ marginBottom: 0 }}>
              {c.original_text && (
                <div className="diff-row old"><span className="diff-tag mono">WAS</span><span className="diff-text">{c.original_text}</span></div>
              )}
              <div className="diff-row new"><span className="diff-tag mono">NOW</span><span className="diff-text">{c.suggested_replacement}</span></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const runSection = runs.length > 0 && (
    <section key="runs">
      <div className="mono eyebrow sec">
        <span className={`dot${latest?.status === 'running' ? '' : ' dim'}`} />PIPELINE · LATEST RUN
      </div>
      {latest && (
        <div className="card runbox">
          <div className="runbox-top mono">
            <span>
              {(latest.path ? `PATH ${latest.path} · ` : '') + labelOf(latest)}
              {latest.phase && latest.status === 'running'
                ? ` · ${PHASES.indexOf(latest.phase) + 1}/${PHASES.length}`
                : ''}
            </span>
            <span className="rt">
              started {ago(latest.started_at)}{latest.finished_at ? ` · finished ${ago(latest.finished_at)}` : ''}
            </span>
          </div>
          {latest.trigger && (
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', paddingTop: 10, letterSpacing: '.06em' }}>
              TRIGGER · {latest.trigger}
            </div>
          )}
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
  );

  const scriptPane = (
    <>
      {/* Label, legend and save controls share one row so the editor can start
          right under the header. */}
      <div className="editbar">
        <div className="editbar-left">
          <div className="mono eyebrow"><span className="dot dim" />SCRIPT</div>
          <div className="legend">
            {accepted.length > 0 && <span><i className="a" />accepted · re-record</span>}
            {autoApplied.length > 0 && <span><i className="b" />pipeline updated</span>}
            {pending.length > 0 && <span><i className="c" />change suggested</span>}
          </div>
        </div>
        <div className="editbar-right">
          {dirty && <span className="dirty">UNSAVED</span>}
          {dirty && (
            <button type="button" className="btn" disabled={savingScript} onClick={() => setDraft(savedScript)}>Revert</button>
          )}
          <button type="button" className="btn primary" disabled={!dirty || savingScript} onClick={() => saveScript(draft)}>
            {savingScript ? 'Saving…' : 'Save script'}
          </button>
        </div>
      </div>

      <div className={`editor${focused ? ' focused' : ''}`}>
        <div className="editor-layer" ref={layerRef} aria-hidden>
          {renderLayer(draft, ranges, regenerating && sel ? sel : null)}
        </div>
        <textarea
          ref={areaRef}
          className="editor-area"
          value={draft}
          spellCheck={false}
          placeholder="No script yet — paste or write it here. The daily check keeps it honest from then on."
          readOnly={regenerating}
          onChange={(e) => setDraft(e.target.value)}
          onScroll={syncScroll}
          onSelect={onSelect}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>

      {sel && (
        <div className="card regen">
          <div className="regen-top">
            <div className="min0">
              <div className="regen-label">
                {regenerating ? 'Rewriting selection…' : `Selected · ${sel.text.length} characters`}
              </div>
              <div className="regen-quote">{sel.text.length > 260 ? `${sel.text.slice(0, 260)}…` : sel.text}</div>
            </div>
            {!regenerating && (
              <button type="button" className="modal-x" onClick={() => { setSel(null); setInstruction(''); }} aria-label="Clear selection">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {!regenerating && (
            <>
              <textarea
                className="inp"
                rows={2}
                value={instruction}
                placeholder="How should this part change? e.g. 'mention the new Filters panel instead of the sidebar'"
                onChange={(e) => setInstruction(e.target.value)}
              />
              <div style={{ marginTop: 10 }}>
                <button type="button" className="btn primary" disabled={!instruction.trim()} onClick={regenerate}>
                  <Wand2 className="w-3.5 h-3.5" />Rewrite selection
                </button>
                {dirty && (
                  <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)', marginLeft: 10, letterSpacing: '.1em' }}>
                    SAVES YOUR OTHER EDITS TOO
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );

  const modeSection = (
    <section key="mode">
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
            ? 'Built in the StepByStep editor. When the product changes, the pipeline briefs an agent on your machine, updates the animation, re-renders, regenerates the affected narration and re-syncs the timeline — you just review the result here.'
            : 'Not built in the editor. When the product changes, the daily check audits this script and emails you a digest — then you accept the changes above and re-record the affected sections yourself. No agent ever touches it.'}
        </p>
        {video.clientAutoDefault === false && (
          <p className="mono client-default">
            {video.client}&rsquo;s videos are produced outside the editor — new videos for this client start on CHECK + EMAIL.
          </p>
        )}
        {auto && (
          <div className="mode-map mono">
            <div className="mm-row">
              <span className="mm-k">ANIMATION</span>
              {video.designUrl ? (
                <a className="mm-v" href={video.designUrl} target="_blank" rel="noreferrer">{video.designUrl}</a>
              ) : (
                <span className="mm-v muted">no Claude Design URL — add it with Edit</span>
              )}
            </div>
            <div className="mm-row">
              <span className="mm-k">EDITOR</span>
              <span className="mm-v muted">
                {video.editorProject ? `pinned: ${video.editorProject}` : 'found automatically by video name'}
              </span>
            </div>
          </div>
        )}
        <details className="slug-advanced">
          <summary className="mono">Advanced: pin editor project</summary>
          <div className="slugrow">
            <input
              id="editorproj"
              className="inp mono"
              style={{ flex: 1, minWidth: 170, width: 'auto' }}
              value={slugDraft ?? video.editorProject ?? ''}
              placeholder="— found by name; type a slug only to override —"
              spellCheck={false}
              onChange={(e) => setSlugDraft(e.target.value)}
            />
            {slugDraft !== null && slugDraft.trim() !== (video.editorProject ?? '') && (
              <button type="button" className="btn primary" disabled={savingMode} onClick={() => saveMode({ editorProject: slugDraft })}>
                Save
              </button>
            )}
          </div>
        </details>
        {modeErr && <p className="mono modeerr">{modeErr}</p>}
      </div>
    </section>
  );

  // MANUAL leads with the decisions you have to make; AUTO leads with what the
  // machine did and whether it's ready for your sign-off. The script isn't in
  // this list — it lives in its own pane on the right.
  const leftSections = auto
    ? [runSection, autoSection, changesSection, recordSection, modeSection]
    : [changesSection, recordSection, autoSection, runSection, modeSection];

  const nothingOutstanding =
    pending.length === 0 && accepted.length === 0 && autoApplied.length === 0 && runs.length === 0;

  return (
    <Shell split>
      {/* Only the brand row stays above the two panes — the state pills sit
          beside Edit, and the title block rides at the top of the left pane, so
          the script editor starts just under the header. */}
      <div className="vhead">
        <Header
          right={
            <>
              <div className="hpills">
                <span className={`mode ${auto ? 'auto' : 'manual'}`}>{auto ? 'AUTO' : 'MANUAL'}</span>
                <span className={`pill ${st.kind}`}><span className="pdot" />{st.label}</span>
              </div>
              <button type="button" className="btn" onClick={openEdit} title="Edit the title and description">
                <Pencil className="w-3.5 h-3.5" />Edit
              </button>
            </>
          }
        />
      </div>

      <div className="vcols">
        <div className="vcol left">
          <div className="mono crumb">
            <Link href="/">ALL CLIENTS</Link>
            {video.clientId && <> · <Link href={`/client/${video.clientId}`}>{video.client ?? 'CLIENT'}</Link></>}
          </div>

          <header className="dhead">
            <div className="min0">
              <h1 className="dtitle">{video.title}</h1>
              <div className="mono dsub">
                {[video.client, `updated ${ago(video.updatedAt)}`].filter(Boolean).join('  ·  ')}
              </div>
              {video.description && <p className="vdesc">{video.description}</p>}
            </div>
          </header>

          {actionErr && <div className="banner stale">{actionErr}</div>}

          {latest?.status === 'ready_for_review' && (
            <div className="banner review">
              <b>The pipeline finished this video.</b> Watch the result, then approve it to clear this state.
              <div style={{ marginTop: 11 }}>
                <button type="button" className="btn primary" disabled={approving} onClick={approveRun}>
                  <Check className="w-3.5 h-3.5" />{approving ? 'Approving…' : 'Approve this run'}
                </button>
              </div>
            </div>
          )}

          {!auto && pending.length > 0 && (
            <div className="banner review">
              <b>{pending.length} change{pending.length > 1 ? 's' : ''} detected by the daily check.</b>{' '}
              Accept the ones that are right — they get written into the script on the right — then re-record those sections.
            </div>
          )}

          {nothingOutstanding && (
            <div className="banner sync">
              <b>Nothing outstanding.</b> This script matched the product at the last check, and no
              pipeline run is in flight.
            </div>
          )}

          {leftSections.filter(Boolean)}
        </div>

        <div className="vcol right">{scriptPane}</div>
      </div>

      {showEdit && (
        <Modal
          title="Edit video"
          onClose={() => { if (!editSaving) { setShowEdit(false); setEditErr(null); } }}
          footer={
            <>
              <button type="button" className="btn" disabled={editSaving} onClick={() => { setShowEdit(false); setEditErr(null); }}>Cancel</button>
              <button type="submit" form="editvideo" className="btn primary" disabled={editSaving || !edit.title.trim()}>
                {editSaving ? 'Saving…' : 'Save changes'}
              </button>
            </>
          }
        >
          <p className="modal-note">
            The title and description are for organising videos here — editing them doesn&rsquo;t touch
            the script itself.
          </p>
          <form id="editvideo" onSubmit={saveEdit}>
            <div className="field">
              <label htmlFor="evtitle">Title</label>
              <input id="evtitle" className="inp" value={edit.title} placeholder="How to create a property group" required
                onChange={(e) => setEdit((s) => ({ ...s, title: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="evdesc">What it covers</label>
              <textarea id="evdesc" className="inp" rows={3} value={edit.description} placeholder="Describe what this video teaches…"
                onChange={(e) => setEdit((s) => ({ ...s, description: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="evdesign">Claude Design URL <span className="opt">optional</span></label>
              <input id="evdesign" className="inp" type="url" value={edit.designUrl} placeholder="https://claude.ai/design/p/…"
                onChange={(e) => setEdit((s) => ({ ...s, designUrl: e.target.value }))} />
              <p className="field-hint">The animation project the pipeline opens to edit this video. Clear it to unset.</p>
            </div>
            {editErr && <p className="modeerr mono">{editErr}</p>}
          </form>
        </Modal>
      )}
    </Shell>
  );
}

// Render the highlight layer: plain text with coloured spans behind the textarea.
function renderLayer(text: string, ranges: Range[], busy: { start: number; end: number } | null) {
  const all = busy
    ? [...ranges.filter((r) => r.end <= busy.start || r.start >= busy.end), { start: busy.start, end: busy.end, cls: 'hl-busy' }]
    : [...ranges];
  all.sort((a, b) => a.start - b.start);

  const out: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  for (const r of all) {
    if (r.start < cursor) continue; // overlapping, already covered
    if (r.start > cursor) out.push(<span key={key++}>{text.slice(cursor, r.start)}</span>);
    out.push(<span key={key++} className={r.cls}>{text.slice(r.start, r.end)}</span>);
    cursor = r.end;
  }
  // The trailing newline keeps the layer's height in step with the textarea's.
  out.push(<span key={key++}>{`${text.slice(cursor)}\n`}</span>);
  return out;
}
