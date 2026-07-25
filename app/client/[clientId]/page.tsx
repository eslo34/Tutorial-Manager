'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, GitBranch, Pencil } from 'lucide-react';
import { ago, shortDate, videoState } from '../../_shared/model';
import { Header, Modal, RunFlow, Shell, VideoTile, useBoard, latestRuns } from '../../_shared/ui';

type RepoRun = { id: string; started_at: string; status: string; summary: string | null };

export default function ClientBoard() {
  const { clientId } = useParams<{ clientId: string }>();
  const { board, error, reload } = useBoard();

  // new video
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  // edit client
  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState({ name: '', company: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);

  // repo-updates config
  const [showRepo, setShowRepo] = useState(false);
  const [repoLoaded, setRepoLoaded] = useState(false);
  const [tokenOk, setTokenOk] = useState(false);
  const [repoActive, setRepoActive] = useState(false);
  const [repoSaving, setRepoSaving] = useState(false);
  const [repoMsg, setRepoMsg] = useState<string | null>(null);
  const [rw, setRw] = useState({ owner: '', name: '', branch: 'main', docsPath: 'docs/features' });
  const [repoRuns, setRepoRuns] = useState<RepoRun[]>([]);

  const isUnassigned = clientId === '__none__';
  const client = board?.clients.find((c) => c.id === clientId) ?? null;
  const videos = (board?.videos ?? []).filter((v) =>
    isUnassigned ? !v.clientId || !board?.clients.some((c) => c.id === v.clientId) : v.clientId === clientId
  );
  const runs = (board?.runs ?? []).filter((r) => (isUnassigned ? !r.clientId : r.clientId === clientId));
  const latest = latestRuns(board?.runs ?? []);
  const active = runs.filter((r) => r.status === 'running' || r.status === 'halted');
  const clientName = client?.name ?? (isUnassigned ? 'Unassigned' : 'Client');

  const needsYou = videos.filter((v) => videoState(v, latest.get(v.id)).kind === 'review').length;

  const createVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || isUnassigned) return;
    setSaving(true);
    setFormErr(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          title: form.title.trim(),
          description: form.description.trim(),
          documentationUrls: [],
          prompt: '',
          status: 'planning',
          sourceType: 'code',
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setFormErr(j.error ?? 'Could not create the video.');
        return;
      }
      setForm({ title: '', description: '' });
      setShowNew(false);
      await reload();
    } catch {
      setFormErr('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const deleteVideo = async (id: string) => {
    const v = videos.find((x) => x.id === id);
    if (!confirm(`Delete "${v?.title ?? 'this video'}"? Its script and change history go with it. This cannot be undone.`)) return;
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    await reload();
  };

  const openEdit = () => {
    if (!client) return;
    setEdit({ name: client.name, company: client.company });
    setEditErr(null);
    setShowEdit(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !edit.name.trim()) return;
    setEditSaving(true);
    setEditErr(null);
    try {
      const res = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id, name: edit.name.trim(), company: edit.company.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setEditErr(j.error ?? 'Could not save.');
        return;
      }
      setShowEdit(false);
      await reload();
    } catch {
      setEditErr('Network error.');
    } finally {
      setEditSaving(false);
    }
  };

  const openRepo = async () => {
    if (isUnassigned) return;
    setRepoMsg(null);
    setRepoLoaded(false);
    setShowRepo(true);
    try {
      const res = await fetch(`/api/repo-watch?clientId=${clientId}`);
      const data = await res.json();
      if (res.ok) {
        setTokenOk(!!data.tokenConfigured);
        setRepoRuns(Array.isArray(data.recentRuns) ? data.recentRuns : []);
        if (data.watch) {
          setRw({
            owner: data.watch.owner, name: data.watch.name,
            branch: data.watch.branch, docsPath: data.watch.docs_path,
          });
          setRepoActive(!!data.watch.enabled);
        } else {
          setRepoActive(false);
        }
      }
    } catch {
      setRepoMsg('Could not load the current config.');
    } finally {
      setRepoLoaded(true);
    }
  };

  const saveRepo = async (enabled: boolean) => {
    if (!rw.owner.trim() || !rw.name.trim()) return;
    setRepoSaving(true);
    setRepoMsg(null);
    try {
      const res = await fetch('/api/repo-watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          owner: rw.owner.trim(),
          name: rw.name.trim(),
          branch: rw.branch.trim(),
          docsPath: rw.docsPath.trim(),
          enabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setRepoMsg(data.error ?? 'Failed to save.'); return; }
      setRepoActive(enabled);
      setRepoMsg(enabled
        ? 'Repo updates are on. The daily check watches this repo from now on.'
        : 'Repo updates paused.');
      await reload();
    } catch (err) {
      setRepoMsg(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRepoSaving(false);
    }
  };

  return (
    <Shell>
      <Header
        live={board ? ago(board.generatedAt) : null}
        right={
          !isUnassigned && (
            <>
              <button type="button" className="btn" onClick={openEdit} disabled={!client} title="Rename this client / edit what they do">
                <Pencil className="w-3.5 h-3.5" />Edit
              </button>
              <button type="button" className="btn" onClick={openRepo} title="Watch a GitHub repo's feature docs for changes">
                <GitBranch className="w-3.5 h-3.5" />Repo updates
              </button>
              <button type="button" className="btn primary" onClick={() => setShowNew(true)}>
                <Plus className="w-3.5 h-3.5" />New video
              </button>
            </>
          )
        }
      />

      <div className="mono crumb"><Link href="/">← ALL CLIENTS</Link></div>
      <h1 className="ctitle">{clientName}</h1>
      <p className="csub">
        {client?.company ?? ''}
        {client ? ` · added ${shortDate(client.createdAt)}` : ''}
      </p>

      {error === 'network' && <p className="mono note">Lost contact with the server — retrying…</p>}
      {!board && !error && <p className="mono note">Loading…</p>}

      {board && active.length > 0 && (
        <section>
          <div className="mono eyebrow sec"><span className="dot" />IN PROGRESS · {active.length}</div>
          <div className="flows">{active.map((r) => <RunFlow key={r.id} run={r} />)}</div>
        </section>
      )}

      {board && (
        <section>
          <div className="mono eyebrow sec">
            <span className={`dot${needsYou > 0 ? '' : ' dim'}`} />
            VIDEOS · {videos.length}{needsYou > 0 ? ` · ${needsYou} WAITING ON YOU` : ''}
          </div>
          {videos.length === 0 ? (
            <div className="card empty">
              <h2>No videos yet</h2>
              <p>Add a video, paste in its script, and the daily repo check will tell you when the product drifts away from it.</p>
              {!isUnassigned && (
                <button type="button" className="btn primary" onClick={() => setShowNew(true)}>
                  <Plus className="w-3.5 h-3.5" />Add the first video
                </button>
              )}
            </div>
          ) : (
            <div className="grid">
              {videos.map((v) => (
                <VideoTile key={v.id} video={v} latest={latest.get(v.id)} onDelete={deleteVideo} />
              ))}
            </div>
          )}
        </section>
      )}

      {showNew && (
        <Modal
          title="New video"
          onClose={() => { if (!saving) { setShowNew(false); setFormErr(null); } }}
          footer={
            <>
              <button type="button" className="btn" disabled={saving} onClick={() => { setShowNew(false); setFormErr(null); }}>Cancel</button>
              <button type="submit" form="newvideo" className="btn primary" disabled={saving || !form.title.trim() || !form.description.trim()}>
                {saving ? 'Creating…' : 'Create video'}
              </button>
            </>
          }
        >
          <p className="modal-note">
            New videos start on <b>auto-update</b> unless this client&rsquo;s videos are made outside
            the editor. You can switch either way on the video&rsquo;s own page.
          </p>
          <form id="newvideo" onSubmit={createVideo}>
            <div className="field">
              <label htmlFor="vtitle">Title</label>
              <input id="vtitle" className="inp" value={form.title} placeholder="How to create a property group" required
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="vdesc">What it covers</label>
              <textarea id="vdesc" className="inp" rows={3} value={form.description} placeholder="Describe what this video teaches…" required
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            {formErr && <p className="modeerr mono">{formErr}</p>}
          </form>
        </Modal>
      )}

      {showEdit && (
        <Modal
          title="Edit client"
          onClose={() => { if (!editSaving) { setShowEdit(false); setEditErr(null); } }}
          footer={
            <>
              <button type="button" className="btn" disabled={editSaving} onClick={() => { setShowEdit(false); setEditErr(null); }}>Cancel</button>
              <button type="submit" form="editclient" className="btn primary" disabled={editSaving || !edit.name.trim()}>
                {editSaving ? 'Saving…' : 'Save changes'}
              </button>
            </>
          }
        >
          <form id="editclient" onSubmit={saveEdit}>
            <div className="field">
              <label htmlFor="ecname">Client name</label>
              <input id="ecname" className="inp" value={edit.name} placeholder="Acme Corp" required
                onChange={(e) => setEdit((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="eccompany">What they do</label>
              <textarea id="eccompany" className="inp" rows={2} value={edit.company} placeholder="Describe this company…"
                onChange={(e) => setEdit((s) => ({ ...s, company: e.target.value }))} />
            </div>
            {editErr && <p className="modeerr mono">{editErr}</p>}
          </form>
        </Modal>
      )}

      {showRepo && (
        <Modal
          title="Repo updates"
          wide
          onClose={() => { if (!repoSaving) { setShowRepo(false); setRepoMsg(null); } }}
          footer={repoLoaded ? (
            <>
              {repoActive && (
                <button type="button" className="btn" disabled={repoSaving} onClick={() => saveRepo(false)} style={{ marginRight: 'auto' }}>
                  Pause
                </button>
              )}
              <button type="button" className="btn" disabled={repoSaving} onClick={() => { setShowRepo(false); setRepoMsg(null); }}>Cancel</button>
              <button type="button" className="btn primary" disabled={repoSaving || !rw.owner.trim() || !rw.name.trim()} onClick={() => saveRepo(true)}>
                {repoSaving ? 'Saving…' : repoActive ? 'Save' : 'Turn on'}
              </button>
            </>
          ) : undefined}
        >
          <p className="modal-note">
            Each day this checks the repo&rsquo;s feature docs for changes and audits the affected
            video scripts — no video-to-doc mapping needed. Read-only: it never writes to the repo.
          </p>

          {!repoLoaded ? (
            <p className="mono note">Loading…</p>
          ) : (
            <>
              {!tokenOk && (
                <div className="banner stale">
                  <b>GITHUB_RELEASE_TOKEN isn&rsquo;t set on the server.</b> You can save this config now,
                  but checks won&rsquo;t run until the token is added to the deployment&rsquo;s environment.
                </div>
              )}
              <div className="grid2">
                <div className="field">
                  <label htmlFor="rwo">Owner</label>
                  <input id="rwo" className="inp mono" value={rw.owner} placeholder="bimobject" disabled={repoSaving}
                    onChange={(e) => setRw((s) => ({ ...s, owner: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="rwn">Repo</label>
                  <input id="rwn" className="inp mono" value={rw.name} placeholder="bim-dictionary" disabled={repoSaving}
                    onChange={(e) => setRw((s) => ({ ...s, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="rwb">Branch</label>
                  <input id="rwb" className="inp mono" value={rw.branch} placeholder="main" disabled={repoSaving}
                    onChange={(e) => setRw((s) => ({ ...s, branch: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="rwd">Docs folder</label>
                  <input id="rwd" className="inp mono" value={rw.docsPath} placeholder="docs/features" disabled={repoSaving}
                    onChange={(e) => setRw((s) => ({ ...s, docsPath: e.target.value }))} />
                </div>
              </div>

              <div className="mono eyebrow" style={{ margin: '6px 0 10px' }}>
                <span className={`dot${repoActive ? '' : ' dim'}`} />RECENT CHECKS · {repoActive ? 'ACTIVE' : 'OFF'}
              </div>
              {repoRuns.length === 0 ? (
                <p className="mono note">
                  No checks logged yet. Every daily run (06:00 UTC) is recorded here — even on days
                  nothing changed — so you can confirm it ran.
                </p>
              ) : (
                <div className="runlog">
                  {repoRuns.map((r) => (
                    <div className="runlog-row" key={r.id}>
                      <div className="runlog-top">
                        <span>{new Date(r.started_at).toLocaleString()}</span>
                        <span style={{ color: r.status === 'error' ? 'var(--stale)' : r.status === 'partial' ? 'var(--render)' : 'var(--sync)' }}>
                          {r.status}
                        </span>
                      </div>
                      <div className="runlog-sum">{r.summary || '—'}</div>
                    </div>
                  ))}
                </div>
              )}

              {repoMsg && <p className="note" style={{ marginTop: 14 }}>{repoMsg}</p>}
            </>
          )}
        </Modal>
      )}
    </Shell>
  );
}
