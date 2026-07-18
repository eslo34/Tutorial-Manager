'use client';

import Link from 'next/link';
import { useBoard, videoState, ago, Run, Video, CSS } from './_shared';

type ClientRow = {
  id: string; name: string; videos: Video[];
  counts: { sync: number; render: number; stale: number };
  active: number;
};

export default function ClientsOverview() {
  const { board, error } = useBoard();
  const runs = board?.runs ?? [];
  const videos = board?.videos ?? [];

  // latest run per video
  const latestByVideo = new Map<string, Run>();
  for (const r of runs) if (r.projectId && !latestByVideo.has(r.projectId)) latestByVideo.set(r.projectId, r);

  // group videos by client + roll up each video's state
  const map = new Map<string, ClientRow>();
  for (const v of videos) {
    const cid = v.clientId ?? '__none__';
    if (!map.has(cid)) map.set(cid, { id: cid, name: v.client ?? 'Unassigned', videos: [], counts: { sync: 0, render: 0, stale: 0 }, active: 0 });
    const row = map.get(cid)!;
    row.videos.push(v);
    row.counts[videoState(latestByVideo.get(v.id), v.pending).kind]++;
  }
  for (const r of runs) {
    if (r.status !== 'running') continue;
    const row = map.get(r.clientId ?? '__none__');
    if (row) row.active++;
  }
  const clients = Array.from(map.values()).sort((a, b) => {
    const score = (c: ClientRow) => c.counts.stale * 100 + (c.counts.render + c.active) * 10;
    return score(b) - score(a) || a.name.localeCompare(b.name);
  });
  const totalActive = runs.filter((r) => r.status === 'running' || r.status === 'halted').length;

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

        {error === 'unauthorized' && (<p className="mono note">Please <a href="/">sign in</a> to view the pipeline.</p>)}
        {!board && !error && <p className="mono note">Loading…</p>}

        {board && (
          <section>
            <div className="mono eyebrow sec"><span className="dot dim" />CLIENTS · {clients.length}{totalActive > 0 ? ` · ${totalActive} RUNNING` : ''}</div>
            {clients.length === 0 ? (
              <p className="mono note">No videos yet.</p>
            ) : (
              <div className="clients-grid">
                {clients.map((c) => {
                  const kind = c.counts.stale > 0 ? 'stale' : (c.counts.render > 0 || c.active > 0) ? 'render' : 'sync';
                  const label = c.active > 0 ? `${c.active} RUNNING` : c.counts.stale > 0 ? `${c.counts.stale} NEED UPDATE` : c.counts.render > 0 ? `${c.counts.render} UPDATING` : 'ALL IN SYNC';
                  return (
                    <Link key={c.id} className="card client-card" href={`/pipeline/client/${c.id}`}>
                      <div className="cc-top">
                        <div className="min0">
                          <div className="cc-name">{c.name}</div>
                          <div className="mono cc-sub">{c.videos.length} video{c.videos.length === 1 ? '' : 's'}</div>
                        </div>
                        <span className={`pill sm ${kind}`}><span className="pdot" />{label}</span>
                      </div>
                      <div className="cc-stats">
                        <span className={`stat ${c.counts.sync > 0 ? 'sync' : 'muted'}`}><b />{c.counts.sync} in sync</span>
                        {c.counts.render > 0 && <span className="stat render"><b />{c.counts.render} updating</span>}
                        {c.counts.stale > 0 && <span className="stat stale"><b />{c.counts.stale} stale</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}
        <div style={{ height: 40 }} />
      </main>
    </div>
  );
}
