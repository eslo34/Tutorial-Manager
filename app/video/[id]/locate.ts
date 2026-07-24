import { Change } from '../../_shared/model';

export type Range = { start: number; end: number; cls: string };

// Before the merge there were three different matchers deciding where a change
// sits in the script — the dashboard's keyword-similarity matcher, its plain
// indexOf highlighter, and the board's own indexOf. They disagreed, so the same
// edit could highlight on one screen and read "couldn't be located" on another.
// This is the only one now.
//
// It is deliberately exact-or-nothing. The old keyword fallback would accept a
// sentence with ~40% word overlap, which meant Accept could overwrite a
// completely different line. When we can't place text with confidence we say so
// and let you edit by hand instead of guessing.

const FOLD: Record<string, string> = {
  '“': '"', '”': '"', '„': '"', '«': '"', '»': '"',
  '‘': "'", '’': "'", '‚': "'", '′': "'", '`': "'",
  '–': '-', '—': '-', '−': '-',
  ' ': ' ', '…': '...',
};

// Normalized copy of `text` plus a map from each normalized offset back to the
// original one, so a match found in normalized space can be applied precisely.
function fold(text: string) {
  let out = '';
  const map: number[] = [];
  let prevSpace = false;
  for (let i = 0; i < text.length; i++) {
    const ch = FOLD[text[i]] ?? text[i];
    if (/\s/.test(ch)) {
      if (prevSpace) continue;
      prevSpace = true;
      out += ' ';
      map.push(i);
      continue;
    }
    prevSpace = false;
    // '…' folds to three chars — each maps back to the same original offset.
    for (const c of ch) { out += c; map.push(i); }
  }
  return { out, map };
}

function countOf(hay: string, needle: string): number {
  if (!needle) return 0;
  let n = 0;
  let at = hay.indexOf(needle);
  while (at >= 0) { n++; at = hay.indexOf(needle, at + needle.length); }
  return n;
}

/**
 * Find `needle` in `script`.
 *
 * `siblings` + `selfId` disambiguate the case where several changes target the
 * same repeated sentence: occurrences are handed out left-to-right in the order
 * the changes appear, so accepting the second one doesn't rewrite the first.
 */
export function locate(
  script: string,
  needle: string,
  siblings?: Change[],
  selfId?: string,
): { start: number; end: number } | null {
  if (!script || !needle) return null;

  if (siblings && selfId) {
    const twins = siblings.filter((s) => s.original_text === needle);
    if (twins.length > 1) {
      const rank = twins.findIndex((s) => s.id === selfId);
      if (rank >= 0) {
        let at = -1;
        let from = 0;
        for (let i = 0; i <= rank; i++) {
          at = script.indexOf(needle, from);
          if (at < 0) break;
          from = at + needle.length;
        }
        if (at >= 0) return { start: at, end: at + needle.length };
      }
    }
  }

  // 1. verbatim
  const direct = script.indexOf(needle);
  if (direct >= 0) return { start: direct, end: direct + needle.length };

  // 2. same text after folding smart quotes, dashes and whitespace runs
  const S = fold(script);
  const N = fold(needle);
  const target = N.out.trim();
  if (!target) return null;

  // Map a normalized [at, len) span back to original offsets. Returns null if the
  // map can't cover it, so a bad offset can never turn into a wrong replacement.
  const back = (at: number, len: number) => {
    const startAt = S.map[at];
    const endAt = S.map[at + len - 1];
    if (startAt === undefined || endAt === undefined) return null;
    return { start: startAt, end: endAt + 1 };
  };

  const at = S.out.indexOf(target);
  if (at >= 0) return back(at, target.length);

  // 3. case-insensitive, but only when it lands somewhere unambiguous
  const lowerHay = S.out.toLowerCase();
  const lowerNeedle = target.toLowerCase();
  // Case folding can change length for some scripts; bail rather than misalign.
  if (lowerHay.length === S.out.length && countOf(lowerHay, lowerNeedle) === 1) {
    return back(lowerHay.indexOf(lowerNeedle), lowerNeedle.length);
  }

  return null;
}

// Where each change should be highlighted in the current script, and in what
// colour. Pending edits anchor on the OLD wording (still present); accepted and
// auto-applied ones anchor on the NEW wording (already written in).
export function buildRanges(script: string, changes: Change[]): Range[] {
  const pending = changes.filter((c) => c.status === 'pending');
  const out: Range[] = [];

  for (const c of changes) {
    const isPending = c.status === 'pending';
    const anchor = isPending ? c.original_text : c.suggested_replacement;
    const hit = isPending ? locate(script, anchor, pending, c.id) : locate(script, anchor);
    if (!hit) continue;
    out.push({
      start: hit.start,
      end: hit.end,
      cls: isPending ? 'hl-pending' : c.status === 'accepted' ? 'hl-accepted' : 'hl-auto',
    });
  }

  // Sort and drop overlaps — the earliest range wins.
  out.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Range[] = [];
  for (const r of out) {
    if (merged.length === 0 || r.start >= merged[merged.length - 1].end) merged.push(r);
  }
  return merged;
}
