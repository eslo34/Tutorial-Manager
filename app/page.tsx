'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Plus, LogOut, X } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import { ago, clientState, videoState, Kind } from './_shared/model';
import { Header, Modal, Shell, useBoard, latestRuns } from './_shared/ui';

type Row = {
  id: string;
  name: string;
  company: string;
  videoCount: number;
  counts: Record<Kind, number>;
  headline: { kind: Kind; label: string };
  repoWatch: { owner: string; name: string; enabled: boolean } | null;
};

export default function ClientsOverview() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // Don't poll the board while the sign-in form is up — it would just 401 in a loop.
  const { board, error, reload } = useBoard(status === 'authenticated' ? 4000 : null);

  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', company: '' });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  // Digest emails link to /?projectId=… — that used to land on the dashboard's
  // project view, which deliberately hid the very pending edits the email was
  // about. Send them straight to the video page instead.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('projectId');
    if (target) router.replace(`/video/${target}`);
  }, [router]);

  if (status === 'loading') {
    return (
      <Shell>
        <p className="mono note" style={{ paddingTop: 60 }}>Loading…</p>
      </Shell>
    );
  }
  if (!session) return <AuthForm onSuccess={() => window.location.reload()} />;

  const clients = board?.clients ?? [];
  const videos = board?.videos ?? [];
  const runs = board?.runs ?? [];
  const latest = latestRuns(runs);

  const rows: Row[] = clients.map((c) => {
    const mine = videos.filter((v) => v.clientId === c.id);
    const states = mine.map((v) => videoState(v, latest.get(v.id)));
    const counts: Record<Kind, number> = { sync: 0, render: 0, review: 0, stale: 0 };
    for (const s of states) counts[s.kind]++;
    return {
      id: c.id,
      name: c.name,
      company: c.company,
      videoCount: mine.length,
      counts,
      headline: mine.length === 0 ? { kind: 'sync' as Kind, label: 'NO VIDEOS' } : clientState(states),
      repoWatch: c.repoWatch,
    };
  });

  // Videos whose client was deleted out from under them, if any.
  const orphans = videos.filter((v) => !v.clientId || !clients.some((c) => c.id === v.clientId));
  if (orphans.length > 0) {
    const states = orphans.map((v) => videoState(v, latest.get(v.id)));
    const counts: Record<Kind, number> = { sync: 0, render: 0, review: 0, stale: 0 };
    for (const s of states) counts[s.kind]++;
    rows.push({
      id: '__none__', name: 'Unassigned', company: 'Videos with no client',
      videoCount: orphans.length, counts, headline: clientState(states), repoWatch: null,
    });
  }

  // Most urgent first: broken, then working, then waiting on you.
  const weight = (r: Row) => r.counts.stale * 1000 + r.counts.render * 100 + r.counts.review * 10;
  rows.sort((a, b) => weight(b) - weight(a) || a.name.localeCompare(b.name));

  const needsYou = videos.filter((v) => videoState(v, latest.get(v.id)).kind === 'review').length;
  const working = runs.filter((r) => r.status === 'running').length;

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.company.trim()) return;
    setSaving(true);
    setFormErr(null);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), company: form.company.trim(), email: '' }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setFormErr(j.error ?? 'Could not create the client.');
        return;
      }
      setForm({ name: '', company: '' });
      setShowNew(false);
      await reload();
    } catch {
      setFormErr('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async (row: Row) => {
    const msg = row.videoCount > 0
      ? `Delete ${row.name}? Its ${row.videoCount} video${row.videoCount === 1 ? '' : 's'} and their scripts will be deleted too. This cannot be undone.`
      : `Delete ${row.name}? This cannot be undone.`;
    if (!confirm(msg)) return;
    await fetch(`/api/clients?id=${row.id}`, { method: 'DELETE' });
    await reload();
  };

  return (
    <Shell>
      <Header
        live={board ? ago(board.generatedAt) : null}
        right={
          <>
            <button type="button" className="btn primary" onClick={() => setShowNew(true)}>
              <Plus className="w-3.5 h-3.5" />New client
            </button>
            <button type="button" className="btn ghost" onClick={() => signOut()}>
              <LogOut className="w-3.5 h-3.5" />Log out
            </button>
          </>
        }
      />

      {error === 'network' && <p className="mono note">Lost contact with the server — retrying…</p>}
      {!board && !error && <p className="mono note">Loading…</p>}

      {board && (
        <>
          <div className="mono eyebrow sec">
            <span className={`dot${needsYou === 0 && working === 0 ? ' dim' : ''}`} />
            CLIENTS · {rows.length}
            {working > 0 ? ` · ${working} UPDATING` : ''}
            {needsYou > 0 ? ` · ${needsYou} WAITING ON YOU` : ''}
          </div>

          {rows.length === 0 ? (
            <div className="card empty">
              <h2>No clients yet</h2>
              <p>Add a client, then add the videos you make for them. Their scripts get watched for product changes from there.</p>
              <button type="button" className="btn primary" onClick={() => setShowNew(true)}>
                <Plus className="w-3.5 h-3.5" />Add your first client
              </button>
            </div>
          ) : (
            <div className="clients-grid">
              {rows.map((r) => (
                <div key={r.id} className="card client-card link">
                  {r.id !== '__none__' && (
                    <button
                      type="button"
                      className="cardkill"
                      aria-label={`Delete ${r.name}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteClient(r); }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <Link href={`/client/${r.id}`} style={{ display: 'block', color: 'inherit' }}>
                    <div className="cc-top">
                      <div className="min0">
                        <div className="cc-name">{r.name}</div>
                        <div className="mono cc-sub">
                          {r.videoCount} video{r.videoCount === 1 ? '' : 's'}
                          {r.repoWatch?.enabled ? ` · watching ${r.repoWatch.owner}/${r.repoWatch.name}` : ''}
                        </div>
                      </div>
                      <span className={`pill sm ${r.headline.kind}`}><span className="pdot" />{r.headline.label}</span>
                    </div>
                    <div className="cc-stats">
                      <span className={`stat ${r.counts.sync > 0 ? 'sync' : 'muted'}`}><b />{r.counts.sync} in sync</span>
                      {r.counts.render > 0 && <span className="stat render"><b />{r.counts.render} updating</span>}
                      {r.counts.review > 0 && <span className="stat review"><b />{r.counts.review} to review</span>}
                      {r.counts.stale > 0 && <span className="stat stale"><b />{r.counts.stale} need attention</span>}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showNew && (
        <Modal
          title="New client"
          onClose={() => { if (!saving) { setShowNew(false); setFormErr(null); } }}
          footer={
            <>
              <button type="button" className="btn" disabled={saving} onClick={() => { setShowNew(false); setFormErr(null); }}>
                Cancel
              </button>
              <button type="submit" form="newclient" className="btn primary" disabled={saving || !form.name.trim() || !form.company.trim()}>
                {saving ? 'Creating…' : 'Create client'}
              </button>
            </>
          }
        >
          <form id="newclient" onSubmit={createClient}>
            <div className="field">
              <label htmlFor="cname">Client name</label>
              <input id="cname" className="inp" value={form.name} placeholder="Acme Corp" required
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="ccompany">What they do</label>
              <textarea id="ccompany" className="inp" rows={2} value={form.company} placeholder="Describe this company…" required
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
            </div>
            {formErr && <p className="modeerr mono">{formErr}</p>}
          </form>
        </Modal>
      )}
    </Shell>
  );
}
