'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBoard, RunFlow, VideoTile, ago, Run, CSS } from '../../_shared';

export default function ClientBoard() {
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId;
  const { board, error } = useBoard();

  const matchClient = (cid: string | null) => (clientId === '__none__' ? cid == null : cid === clientId);
  const videos = (board?.videos ?? []).filter((v) => matchClient(v.clientId));
  const runs = (board?.runs ?? []).filter((r) => matchClient(r.clientId));
  const clientName = videos[0]?.client ?? runs[0]?.client ?? (clientId === '__none__' ? 'Unassigned' : 'Client');

  const active = runs.filter((r) => r.status === 'running' || r.status === 'halted');
  const latestByVideo = new Map<string, Run>();
  for (const r of runs) if (r.projectId && !latestByVideo.has(r.projectId)) latestByVideo.set(r.projectId, r);

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

        <div className="mono crumb"><Link href="/pipeline">← CLIENTS</Link></div>
        <h1 className="ctitle">{clientName}</h1>

        {error === 'unauthorized' && (<p className="mono note">Please <a href="/">sign in</a> to view the pipeline.</p>)}
        {!board && !error && <p className="mono note">Loading…</p>}
        {board && videos.length === 0 && <p className="mono note">No videos for this client.</p>}

        {active.length > 0 && (
          <section>
            <div className="mono eyebrow sec"><span className="dot" />IN PROGRESS · {active.length}</div>
            <div className="flows">{active.map((r) => <RunFlow key={r.id} run={r} />)}</div>
          </section>
        )}

        {videos.length > 0 && (
          <section>
            <div className="mono eyebrow sec"><span className="dot dim" />VIDEOS · {videos.length}</div>
            <div className="grid">
              {videos.map((v) => <VideoTile key={v.id} video={v} latest={latestByVideo.get(v.id)} />)}
            </div>
          </section>
        )}
        <div style={{ height: 40 }} />
      </main>
    </div>
  );
}
