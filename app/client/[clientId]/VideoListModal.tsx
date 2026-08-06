'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import type { VideoList, VideoListGroup, VideoListItem } from '@/lib/video-list.mjs';
import { Modal } from '../../_shared/ui';

// The client's internal video list. A private planning note with checkboxes —
// a tick means "no longer just an idea", nothing more. It has no bearing on the
// board's sync state and never touches Project rows, which is why it lives
// behind its own button instead of on the page.

const EMPTY_ITEM: VideoListItem = { code: '', title: '', meta: '', note: '', done: false };

function clone(list: VideoList): VideoList {
  return JSON.parse(JSON.stringify(list)) as VideoList;
}

function countOf(groups: VideoListGroup[]) {
  let items = 0;
  let done = 0;
  for (const g of groups) {
    for (const i of g.items) {
      items++;
      if (i.done) done++;
    }
  }
  return { items, done };
}

export default function VideoListModal({ clientId, clientName, onClose }: {
  clientId: string;
  clientName: string;
  onClose: () => void;
}) {
  const [list, setList] = useState<VideoList | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<VideoList | null>(null);

  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  // The debounced tick-save reads the newest list through a ref, so a burst of
  // clicks doesn't post a stale snapshot from a closed-over render.
  const listRef = useRef<VideoList | null>(null);
  useEffect(() => { listRef.current = list; }, [list]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async (next: VideoList | null) => {
    if (!next) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch('/api/clients/video-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, list: next, mode: 'replace' }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error ?? 'Could not save.');
        return false;
      }
      setSavedTick((n) => n + 1);
      return true;
    } catch {
      setErr('Network error — your last change may not be saved.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [clientId]);

  const queueSave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { timer.current = null; save(listRef.current); }, 600);
  }, [save]);

  // Load on open. Collapse every group by default — the point of this window is
  // to scan 70-odd titles by track, not to be handed one long scroll.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/clients/video-list?clientId=${clientId}`, { cache: 'no-store' });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) { setErr(data.error ?? 'Could not load the list.'); return; }
        const loadedList: VideoList | null = data.list;
        setList(loadedList);
        if (loadedList) {
          setCollapsed(new Set(loadedList.groups.map((_, i) => i)));
        }
      } catch {
        if (alive) setErr('Could not load the list.');
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, [clientId]);

  // Closing flushes a pending save (see close()), but a hard navigation away
  // would not — keepalive lets that last PUT outlive the unmount.
  useEffect(() => () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    const pending = listRef.current;
    if (!pending) return;
    fetch('/api/clients/video-list', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, list: pending, mode: 'replace' }),
      keepalive: true,
    }).catch(() => {});
  }, [clientId]);

  const close = async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      await save(listRef.current);
    }
    onClose();
  };

  // Every edit goes through here so the working copy is never mutated in place.
  const mutate = (fn: (draft: VideoList) => void) => {
    setList((prev) => {
      const draft = clone(prev ?? { source: '', groups: [] });
      fn(draft);
      return draft;
    });
  };

  const toggleItem = (gi: number, ii: number) => {
    mutate((d) => { d.groups[gi].items[ii].done = !d.groups[gi].items[ii].done; });
    queueSave();
  };

  const toggleGroup = (gi: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(gi)) next.delete(gi); else next.add(gi);
      return next;
    });
  };

  const startEdit = () => {
    setSnapshot(list ? clone(list) : { source: '', groups: [] });
    setCollapsed(new Set());
    setEditing(true);
  };

  const cancelEdit = () => {
    setList(snapshot);
    setSnapshot(null);
    setEditing(false);
    setErr(null);
  };

  const commitEdit = async () => {
    // Drop rows left blank rather than saving empty lines.
    const cleaned = clone(list ?? { source: '', groups: [] });
    cleaned.groups = cleaned.groups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.title.trim()) }))
      .filter((g) => g.name.trim() || g.items.length > 0);
    setList(cleaned);
    const okSave = await save(cleaned);
    if (okSave !== false) {
      setSnapshot(null);
      setEditing(false);
    }
  };

  const startList = () => {
    setList({ source: '', groups: [{ name: 'Videos', note: '', items: [{ ...EMPTY_ITEM }] }] });
    setSnapshot({ source: '', groups: [] });
    setCollapsed(new Set());
    setEditing(true);
  };

  const groups = list?.groups ?? [];
  const { items, done } = countOf(groups);
  const pct = items === 0 ? 0 : Math.round((done / items) * 100);

  return (
    <Modal
      title={`Video list · ${clientName}`}
      xwide
      onClose={close}
      footer={editing ? (
        <>
          <button type="button" className="btn" disabled={saving} onClick={cancelEdit}>Cancel</button>
          <button type="button" className="btn primary" disabled={saving} onClick={commitEdit}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </>
      ) : (
        <button type="button" className="btn" onClick={close}>Close</button>
      )}
    >
      {!loaded ? (
        <p className="mono note">Loading…</p>
      ) : !list || groups.length === 0 ? (
        <div className="vl-empty">
          <h3>No video list yet</h3>
          <p>
            Ask Claude to bring one in — <span className="mono">&ldquo;read
            Clients/{clientName}/VIDEO-LIST.md and put it in ScriptManager under {clientName}&rdquo;</span>
            {' '}— or start one here by hand.
          </p>
          <button type="button" className="btn primary" onClick={startList}>
            <Plus className="w-3.5 h-3.5" />Start a list
          </button>
        </div>
      ) : (
        <>
          <div className="vl-head">
            <div className="vl-prog">
              <div className="mono vl-count">
                {done} / {items} done
                {list.source ? <span className="vl-src"> · {list.source}</span> : null}
              </div>
              <div className="vl-bar"><div className="vl-bar-fill" style={{ width: `${pct}%` }} /></div>
            </div>
            <div className="vl-tools">
              <span className="mono vl-saved">
                {saving ? 'saving…' : savedTick > 0 ? 'saved' : ''}
              </span>
              {!editing && (
                <>
                  <button
                    type="button"
                    className={`btn sm${showNotes ? ' primary' : ''}`}
                    onClick={() => setShowNotes((s) => !s)}
                    title="Show what each video covers"
                  >
                    Notes
                  </button>
                  <button type="button" className="btn sm" onClick={startEdit}>
                    <Pencil className="w-3 h-3" />Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {err && <p className="modeerr mono">{err}</p>}

          <div className="vl-groups">
            {groups.map((group, gi) => {
              const isShut = collapsed.has(gi) && !editing;
              const gCount = countOf([group]);
              return (
                <div className="vl-group" key={gi}>
                  <div className="vl-ghead">
                    <button
                      type="button"
                      // In edit mode the group's name lives in an input beside
                      // this, so the toggle shrinks to just its chevron.
                      className={`vl-gtoggle${editing ? ' bare' : ''}`}
                      onClick={() => toggleGroup(gi)}
                      aria-expanded={!isShut}
                    >
                      {isShut ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {editing ? null : <span className="vl-gname">{group.name}</span>}
                    </button>

                    {editing && (
                      <input
                        className="inp vl-ginp"
                        value={group.name}
                        placeholder="Track / category name"
                        onChange={(e) => mutate((d) => { d.groups[gi].name = e.target.value; })}
                      />
                    )}

                    <span className="mono vl-gcount">{gCount.done}/{gCount.items}</span>

                    {editing && (
                      <button
                        type="button"
                        className="vl-del"
                        aria-label={`Delete group ${group.name}`}
                        onClick={() => mutate((d) => { d.groups.splice(gi, 1); })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {!isShut && (
                    <div className="vl-items">
                      {group.note && !editing && <p className="vl-gnote">{group.note}</p>}

                      {group.items.map((item, ii) => (editing ? (
                        <div className="vl-erow" key={ii}>
                          <input
                            className="inp mono vl-ecode"
                            value={item.code}
                            placeholder="A1"
                            onChange={(e) => mutate((d) => { d.groups[gi].items[ii].code = e.target.value; })}
                          />
                          <input
                            className="inp vl-etitle"
                            value={item.title}
                            placeholder="Video title"
                            onChange={(e) => mutate((d) => { d.groups[gi].items[ii].title = e.target.value; })}
                          />
                          <input
                            className="inp mono vl-emeta"
                            value={item.meta}
                            placeholder="tutorial · 3:00"
                            onChange={(e) => mutate((d) => { d.groups[gi].items[ii].meta = e.target.value; })}
                          />
                          <button
                            type="button"
                            className="vl-del"
                            aria-label={`Delete ${item.title || 'row'}`}
                            onClick={() => mutate((d) => { d.groups[gi].items.splice(ii, 1); })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className={`vl-row${item.done ? ' done' : ''}`} key={ii}>
                          <input
                            type="checkbox"
                            className="vl-check"
                            checked={item.done}
                            onChange={() => toggleItem(gi, ii)}
                          />
                          <span className="vl-main">
                            <span className="vl-line">
                              {item.code && <span className="mono vl-code">{item.code}</span>}
                              <span className="vl-title">{item.title}</span>
                              {item.meta && <span className="mono vl-meta">{item.meta}</span>}
                            </span>
                            {showNotes && item.note && <span className="vl-note">{item.note}</span>}
                          </span>
                        </label>
                      )))}

                      {editing && (
                        <button
                          type="button"
                          className="vl-add"
                          onClick={() => mutate((d) => { d.groups[gi].items.push({ ...EMPTY_ITEM }); })}
                        >
                          <Plus className="w-3 h-3" />Add video
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {editing && (
            <button
              type="button"
              className="vl-add group"
              onClick={() => mutate((d) => { d.groups.push({ name: '', note: '', items: [{ ...EMPTY_ITEM }] }); })}
            >
              <Plus className="w-3.5 h-3.5" />Add group
            </button>
          )}
        </>
      )}
    </Modal>
  );
}
