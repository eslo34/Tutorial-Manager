// ── The client's internal video list ────────────────────────────────────────
//
// A private planning note, mirrored from Clients/<name>/VIDEO-LIST.md so it can
// be read and ticked off in the app instead of opening the markdown.
//
// This is deliberately NOT part of the app's state model. It never reaches
// /api/board, nothing here links to Project rows, and a ticked item means only
// "no longer just an idea" — it says nothing about whether a video is in sync.
// Keeping it a loose blob is the point: every client writes their list in a
// different shape (Prodikt uses markdown tables, OpenDictionary a numbered list
// with `[T] ~2m` markers) and none of them should force a schema change.
//
// Stored shape (Client.video_list):
//   { source?, updatedAt?, groups: [
//       { name, note?, items: [ { code?, title, meta?, note?, done } ] } ] }
//
// Plain .mjs so the local MCP server — which is dependency-free and imports the
// generated Prisma client the same way — can share this exact code with the
// Next app rather than keeping a second copy that drifts.

export const MAX_GROUPS = 60;
export const MAX_ITEMS = 2000;
const MAX_LINE = 300;
const MAX_NOTE = 4000;

// Collapse whitespace; for single-line fields (code, title, meta).
function line(value, max = MAX_LINE) {
  if (value === null || value === undefined) return '';
  const s = String(value).replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max) : s;
}

// Trim but keep newlines; for notes, which may be a paragraph.
function text(value, max = MAX_NOTE) {
  if (value === null || value === undefined) return '';
  const s = String(value).replace(/\r\n/g, '\n').trim();
  return s.length > max ? s.slice(0, max) : s;
}

function pick(obj, keys) {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

// Accepts what a human or an LLM would plausibly emit for "done".
function boolish(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value !== 'string') return false;
  return ['true', 'yes', 'y', 'x', 'done', '1', '✓', '✔'].includes(value.trim().toLowerCase());
}

// "A12 — Where did this value come from?" → code "A12", title the rest.
// Only fires on a genuine leading code so ordinary titles survive untouched.
const CODE_PREFIX = /^([A-Za-z]{1,3}\d{1,3})\s*[—–\-·.:)]\s+(.+)$/;

function normalizeItem(raw) {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === 'string' || typeof raw === 'number') {
    const s = line(raw);
    if (!s) return null;
    const m = CODE_PREFIX.exec(s);
    return m
      ? { code: m[1].toUpperCase(), title: line(m[2]), meta: '', note: '', done: false }
      : { code: '', title: s, meta: '', note: '', done: false };
  }
  if (typeof raw !== 'object') return null;

  let title = line(pick(raw, ['title', 'name', 'video', 'label']));
  let code = line(pick(raw, ['code', 'id', 'number', 'ref', 'num']), 12);

  // A title that still carries its own code, and no separate code field.
  if (!code && title) {
    const m = CODE_PREFIX.exec(title);
    if (m) {
      code = m[1].toUpperCase();
      title = line(m[2]);
    }
  }
  if (!title) return null;

  // `type` and `length` arrive as separate columns in a markdown table; a
  // pre-shaped list sends one `meta` string. Support both.
  let meta = line(pick(raw, ['meta', 'detail']), 80);
  if (!meta) {
    const parts = [
      line(pick(raw, ['type', 'kind']), 40),
      line(pick(raw, ['length', 'len', 'duration', 'runtime']), 40),
    ].filter(Boolean);
    meta = parts.join(' · ');
  }

  return {
    code: code.toUpperCase(),
    title,
    meta,
    note: text(pick(raw, ['note', 'covers', 'description', 'summary', 'what', 'notes'])),
    done: boolish(pick(raw, ['done', 'checked', 'complete', 'completed', 'made'])),
  };
}

// Does this object look like a group (has nested items) or a bare item?
function isGroupish(raw) {
  if (!raw || typeof raw !== 'object') return false;
  if (Array.isArray(raw)) return true;
  return ['items', 'videos', 'entries', 'rows', 'list', 'children'].some((k) => Array.isArray(raw[k]));
}

function normalizeGroup(raw, index) {
  if (Array.isArray(raw)) {
    return { name: `Group ${index + 1}`, note: '', items: raw.map(normalizeItem).filter(Boolean) };
  }
  if (!raw || typeof raw !== 'object') return null;

  const name = line(pick(raw, ['name', 'title', 'track', 'group', 'heading', 'category', 'section']))
    || `Group ${index + 1}`;
  const rawItems = pick(raw, ['items', 'videos', 'entries', 'rows', 'list', 'children']);

  return {
    name,
    note: text(pick(raw, ['note', 'description', 'summary']), 2000),
    items: Array.isArray(rawItems) ? rawItems.map(normalizeItem).filter(Boolean) : [],
  };
}

/**
 * Coerce anything list-shaped into the stored shape. Forgiving on purpose:
 * the MCP path hands this whatever Claude produced from a markdown file, and
 * failing on a key name it didn't guess would make that path useless.
 * Returns { source, groups, truncated }.
 */
export function normalizeList(input) {
  let source = '';
  let rawGroups = [];

  if (Array.isArray(input)) {
    // A bare array: groups if the entries nest, otherwise one implicit group.
    rawGroups = input.some(isGroupish) ? input : [{ name: 'Videos', items: input }];
  } else if (input && typeof input === 'object') {
    source = line(pick(input, ['source', 'file', 'path', 'from']));
    const g = pick(input, ['groups', 'tracks', 'sections', 'categories']);
    if (Array.isArray(g)) {
      rawGroups = g;
    } else {
      const items = pick(input, ['items', 'videos', 'list']);
      if (Array.isArray(items)) rawGroups = [{ name: 'Videos', items }];
    }
  }

  let truncated = false;
  if (rawGroups.length > MAX_GROUPS) {
    rawGroups = rawGroups.slice(0, MAX_GROUPS);
    truncated = true;
  }

  const groups = [];
  let total = 0;
  for (let i = 0; i < rawGroups.length; i++) {
    const group = normalizeGroup(rawGroups[i], i);
    if (!group) continue;
    if (total + group.items.length > MAX_ITEMS) {
      group.items = group.items.slice(0, Math.max(0, MAX_ITEMS - total));
      truncated = true;
    }
    total += group.items.length;
    // Drop groups that carry nothing at all; keep named-but-empty ones so a
    // group you just added in the UI doesn't vanish before you fill it.
    if (group.items.length === 0 && !group.note && /^Group \d+$/.test(group.name)) continue;
    groups.push(group);
  }

  return { source, groups, truncated };
}

// Identity for merging: the code if there is one, else the squashed title.
export function keyOf(item) {
  if (item.code) return `c:${item.code.toLowerCase()}`;
  return `t:${String(item.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
}

/**
 * Carry ticks from the stored list onto an incoming one, so re-importing a
 * refreshed markdown file never silently wipes what you already ticked off.
 * A tick only ever survives or is added — never removed by an import.
 * Returns { groups, kept, added, removed }.
 */
export function mergeTicks(incomingGroups, previous) {
  const before = new Map();
  for (const group of previous?.groups ?? []) {
    for (const item of group.items ?? []) before.set(keyOf(item), !!item.done);
  }

  const seen = new Set();
  let kept = 0;
  let added = 0;

  const groups = incomingGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const key = keyOf(item);
      seen.add(key);
      const had = before.has(key);
      if (!had) added++;
      const wasDone = before.get(key) === true;
      if (wasDone && !item.done) kept++;
      return { ...item, done: item.done || wasDone };
    }),
  }));

  let removed = 0;
  for (const key of before.keys()) if (!seen.has(key)) removed++;

  return { groups, kept, added, removed };
}

export function listStats(list) {
  let items = 0;
  let done = 0;
  for (const group of list?.groups ?? []) {
    for (const item of group.items ?? []) {
      items++;
      if (item.done) done++;
    }
  }
  return { groups: list?.groups?.length ?? 0, items, done };
}
