import { generateWithFallback, SONNET, HAIKU, OPUS } from './anthropic';

// ----- Haiku gate: is this doc change semantically meaningful? -------------

export interface GateVerdict {
  verdict: 'matters' | 'trivial';
  reason: string;
  affected_workflow: string | null;
}

const HAIKU_GATE_SYSTEM = `You are a documentation change classifier. Read a diff between two versions of a single documentation page and decide whether the change matters for video tutorial scripts that teach end-users how to use the documented software.

A change MATTERS if it involves any of:
- A renamed button, menu item, field, tab, or other UI element
- A new step added to a workflow, or an existing step removed
- A reordering of steps in a procedure
- A changed navigation path
- New prerequisites or warnings
- A behavioral change (e.g. "click Save" became "changes auto-save")

A change is TRIVIAL if it is only:
- Prose rewording without semantic change
- Typo / grammar / punctuation
- Reordered paragraphs without changed procedure
- Marketing / intro copy outside procedural sections
- Date or version-number bumps
- Link-text edits that don't change destination relevance

Return ONLY valid JSON (no markdown fences, no commentary):
{ "verdict": "matters" | "trivial", "reason": "one-sentence justification", "affected_workflow": "short label or null" }`;

export async function gateChangeForRelevance(input: {
  pageUrl: string;
  pageTitle: string;
  diff: string;
}): Promise<GateVerdict | null> {
  try {
    const { text } = await generateWithFallback({
      system: HAIKU_GATE_SYSTEM,
      content: [
        {
          type: 'text',
          text: `PAGE: ${input.pageTitle} (${input.pageUrl})\n\nDIFF (yesterday vs today):\n${input.diff}`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      maxTokens: 512,
      models: [HAIKU, SONNET],
    });
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as GateVerdict;
  } catch (error) {
    console.error('Haiku gate failed:', error);
    return null;
  }
}

// ----- Sonnet per-script audit: which spans of THIS script are now outdated
//       given THIS specific doc page changing? ---------------------------

export interface OutdatedSection {
  original_text: string;
  suggested_replacement: string;
  reason: string;
  severity: string; // critical | moderate | minor
  category: string; // missing_step | wrong_ui_element | incorrect_sequence | missing_detail
}

export interface AuditResult {
  sections: OutdatedSection[];
  rawText: string;
  parseError?: string;
}

const AUDIT_SYSTEM = `You are an expert video script auditor. You will be given:
1. A single documentation page that recently changed.
2. A video tutorial script.

Your task: find sections of the script that are now outdated or incorrect GIVEN THIS PAGE'S CONTENT. If the script doesn't cover anything related to this page, return an empty outdated_sections array.

WHAT COUNTS AS OUTDATED:
- Wrong button names, field names, or UI element names (as updated in this page)
- Missing crucial steps that this page now documents
- Wrong navigation paths or menu locations
- Steps in wrong sequence per this page
- Missing important warnings or prerequisites added in this page

🚨 CRITICAL: For "original_text", copy the EXACT text from the script word-for-word, including exact punctuation, spacing, and line breaks. Complete sentences or paragraphs, not summaries. DO NOT paraphrase, summarize, or rewrite.

Return ONLY valid JSON (no markdown fences, no commentary):
{
  "outdated_sections": [
    {
      "original_text": "EXACT TEXT FROM SCRIPT",
      "reason": "specific explanation of what's wrong/missing",
      "suggested_replacement": "corrected text based on the documentation page",
      "severity": "critical" | "moderate" | "minor",
      "category": "missing_step" | "wrong_ui_element" | "incorrect_sequence" | "missing_detail"
    }
  ]
}

If nothing in the script is outdated by this page, return: { "outdated_sections": [] }`;

export async function auditScriptAgainstPage(input: {
  pageUrl: string;
  pageTitle: string;
  pageContent: string;
  script: string;
}): Promise<AuditResult> {
  let rawText = '';
  try {
    const { text } = await generateWithFallback({
      system: AUDIT_SYSTEM,
      content: [
        {
          type: 'text',
          text: `DOCUMENTATION PAGE (${input.pageTitle} — ${input.pageUrl}):\n${input.pageContent}`,
          // Cache the page so subsequent script-scans for the same page hit
          // the cache and save ~90% on input cost + latency.
          cache_control: { type: 'ephemeral' },
        },
        {
          type: 'text',
          text: `SCRIPT:\n${input.script}`,
        },
      ],
      maxTokens: 8192,
      models: [SONNET, HAIKU],
      // Be thorough — don't miss outdated references; we're not on a hot path,
      // each script gets its own 60s budget via overflow if needed.
      effort: 'high',
    });
    rawText = text;
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      const parsed = JSON.parse(cleaned) as { outdated_sections?: OutdatedSection[] };
      return { sections: parsed.outdated_sections ?? [], rawText };
    } catch (parseError) {
      const msg = parseError instanceof Error ? parseError.message : String(parseError);
      console.error('Failed to parse Sonnet audit JSON:', msg);
      return { sections: [], rawText, parseError: msg };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Sonnet audit failed:', error);
    return { sections: [], rawText, parseError: msg };
  }
}

// ----- Repo-release flow: audit a script against a changed feature doc -------
//
// Same OutdatedSection/AuditResult contract as the doc-page audit, but sourced
// from a git diff of a `docs/features/*.md` file rather than a crawled web page.
// Two differences that matter:
//   1. It's given the exact DIFF (what just changed) as the primary signal, plus
//      the full current doc for context — so it anchors on the change instead of
//      re-deriving staleness from the whole doc every run.
//   2. It runs on Opus 4.8 (with Sonnet fallback). This is the one judgment-
//      critical call in the pipeline and its volume is tiny (gated on real doc
//      changes), so the per-call premium is negligible.

// Pull the outermost { … } out of a model response, tolerating stray prose or
// fences around it. More robust than a plain fence-strip — matters when a
// higher-reasoning model occasionally prefixes the JSON with a sentence.
function extractJsonObject(text: string): string {
  const stripped = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return stripped.slice(start, end + 1);
  }
  return stripped;
}

const REPO_AUDIT_SYSTEM = `You are an expert tutorial-video-script auditor for a software product. You are given three things:
1. FEATURE DOC — the current documentation for one product feature.
2. WHAT CHANGED — the exact diff that was just merged to that doc. This is WHY you are auditing.
3. SCRIPT — a tutorial video script.

Your task: find sections of the SCRIPT that are now outdated or incorrect because of WHAT CHANGED. Anchor on the diff — a script line is outdated only if the change makes it wrong, incomplete, or misleading. If the script covers nothing affected by this change, return an empty array.

WHAT COUNTS AS OUTDATED (relative to the change):
- A capability or step the script describes that the change altered, removed, or replaced
- A UI element, field, tab, or navigation path the change renamed or moved
- A behaviour the script states that the change now contradicts
- A newly required step, option, or prerequisite the script omits and should now mention

🚨 CRITICAL: For "original_text", copy the EXACT text from the SCRIPT word-for-word — exact punctuation, spacing, and line breaks, a complete sentence or paragraph. DO NOT paraphrase, summarize, or rewrite. If the fix is an ADDITION with no single wrong sentence to anchor to, quote the nearest existing sentence the new content should follow.

Return ONLY valid JSON (no markdown fences, no commentary):
{
  "outdated_sections": [
    {
      "original_text": "EXACT TEXT FROM SCRIPT",
      "reason": "specific explanation tied to what changed",
      "suggested_replacement": "corrected text based on the current feature doc",
      "severity": "critical" | "moderate" | "minor",
      "category": "missing_step" | "wrong_ui_element" | "incorrect_sequence" | "missing_detail"
    }
  ]
}
If nothing in the script is outdated by this change, return: { "outdated_sections": [] }`;

export async function auditScriptAgainstRepoChange(input: {
  featureName: string;
  docPath: string;
  blobUrl: string;
  docContent: string;
  diff: string;
  script: string;
}): Promise<AuditResult> {
  let rawText = '';
  try {
    const { text } = await generateWithFallback({
      system: REPO_AUDIT_SYSTEM,
      content: [
        {
          type: 'text',
          text: `FEATURE DOC — ${input.featureName} (${input.docPath}):\n${input.docContent}`,
          // Cache the full doc so auditing several scripts against the same
          // changed doc reuses it (~90% cheaper on the repeat scripts).
          cache_control: { type: 'ephemeral' },
        },
        {
          type: 'text',
          text: `WHAT CHANGED (diff just merged to ${input.docPath}):\n${input.diff}`,
        },
        {
          type: 'text',
          text: `SCRIPT:\n${input.script}`,
        },
      ],
      maxTokens: 8192,
      // Opus 4.8 for the judgment; Sonnet 4.6 as availability fallback.
      models: [OPUS, SONNET],
      effort: 'high',
      // Adaptive thinking keeps Opus's reasoning in dedicated thinking blocks,
      // out of the visible text — so JSON parsing stays clean.
      thinking: 'adaptive',
    });
    rawText = text;
    try {
      const parsed = JSON.parse(extractJsonObject(text)) as {
        outdated_sections?: OutdatedSection[];
      };
      return { sections: parsed.outdated_sections ?? [], rawText };
    } catch (parseError) {
      const msg = parseError instanceof Error ? parseError.message : String(parseError);
      console.error('Failed to parse repo audit JSON:', msg);
      return { sections: [], rawText, parseError: msg };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Repo audit failed:', error);
    return { sections: [], rawText, parseError: msg };
  }
}

// A short, plain-language "what changed → how it works now" summary of a single
// feature-doc diff, for the digest email. Sonnet is plenty here; low effort.
const REPO_SUMMARY_SYSTEM = `You explain product changes to a non-technical video producer. Given a documentation diff for one feature, write a SHORT plain-language summary of what actually changed and what it means for how the feature now works. 1–2 sentences, concrete, no fluff, no markdown, no lead-in like "This change". State the change, then the resulting behaviour. Example: "Data Templates can now attach Property Groups as bundled sub-units, so a template can pull in a whole group of related properties at once instead of listing each property individually."`;

export async function summarizeRepoChange(input: {
  featureName: string;
  diff: string;
}): Promise<string> {
  try {
    const { text } = await generateWithFallback({
      system: REPO_SUMMARY_SYSTEM,
      content: `FEATURE: ${input.featureName}\n\nDIFF:\n${input.diff}`,
      maxTokens: 300,
      models: [SONNET, HAIKU],
      effort: 'low',
    });
    return text.trim();
  } catch (error) {
    console.error('Repo change summary failed:', error);
    return `Updated ${input.featureName}.`;
  }
}

// Cheap Haiku relevance router for the zero-config case (no explicit
// video↔doc mapping): "is this script even about this feature?" Prunes
// irrelevant (doc × script) pairs before the expensive Opus audit, so a
// Property-Group change never burns an Opus call on a Categories video.
// Fails OPEN — if the router errors, we let the Opus audit be the judge
// rather than silently skipping a potentially real match.
const COVERS_SYSTEM = `You are a fast relevance router. Given a product FEATURE (name + short description) and a tutorial video SCRIPT, decide whether the script is substantially about that feature — i.e. whether a change to that feature could plausibly make part of this script outdated. Answer with ONLY one word: "yes" or "no".`;

export async function scriptCoversFeature(input: {
  featureName: string;
  featureBrief: string; // a short excerpt of the feature doc
  script: string;
}): Promise<boolean> {
  try {
    const { text } = await generateWithFallback({
      system: COVERS_SYSTEM,
      content: `FEATURE: ${input.featureName}\n${input.featureBrief}\n\nSCRIPT:\n${input.script}`,
      maxTokens: 8,
      models: [HAIKU, SONNET],
    });
    return /\byes\b/i.test(text);
  } catch (error) {
    console.error('scriptCoversFeature failed (failing open):', error);
    return true;
  }
}

// ----- Option A: user-facing changes described in commit / PR messages ------
//
// Feature docs describe behaviour; they often miss the small UI stuff (a button
// renamed or moved, a page relaid out, a step reordered). Those are frequently
// described in the commit/PR messages, which we already fetch in the daily
// compare. This pass mines those messages for user-facing changes and audits
// the scripts against them — catching the minor drift the docs don't cover.

const UI_EXTRACT_SYSTEM = `You are given a list of git commit / pull-request descriptions from a software product. Extract ONLY the changes that affect what an end-user sees or does in the app — the kind of thing that could make a tutorial video subtly wrong:
- A button, menu item, tab, field, or link renamed, moved, added, or removed
- A page or screen layout change / redesign
- A step added to, removed from, or reordered in a workflow
- A changed default, toggle, or option the user interacts with
- A changed navigation path

IGNORE everything internal that a user never sees: backend, API, database, tests, refactors, dependency bumps, CI, performance, logging, types, build config.

For each real user-facing change, write ONE concise, concrete sentence describing it (include where in the app, if the message says). Merge duplicates. If there are no user-facing changes, return an empty list.

Return ONLY valid JSON (no markdown fences, no commentary):
{ "changes": ["...", "..."] }`;

export async function extractUiWorkflowChanges(input: {
  commitMessages: string[];
}): Promise<string[]> {
  const joined = input.commitMessages.map((m, i) => `${i + 1}. ${m}`).join('\n');
  try {
    const { text } = await generateWithFallback({
      system: UI_EXTRACT_SYSTEM,
      content: `COMMIT / PR DESCRIPTIONS:\n${joined}`,
      maxTokens: 1024,
      models: [SONNET, HAIKU],
      effort: 'low',
    });
    const parsed = JSON.parse(extractJsonObject(text)) as { changes?: unknown };
    if (!Array.isArray(parsed.changes)) return [];
    return parsed.changes
      .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      .map((c) => c.trim());
  } catch (error) {
    console.error('extractUiWorkflowChanges failed:', error);
    return [];
  }
}

// Cheap Haiku prefilter: could ANY of these changes touch this script? Prunes
// unrelated scripts before the Opus audit. Fails open.
export async function scriptMightBeAffected(input: {
  changeNotes: string[];
  script: string;
}): Promise<boolean> {
  try {
    const { text } = await generateWithFallback({
      system: `Given a list of recent user-facing product changes and a tutorial video script, answer "yes" if ANY of the changes could plausibly make part of the script outdated, otherwise "no". Answer with ONLY one word: "yes" or "no".`,
      content: `RECENT CHANGES:\n${input.changeNotes.map((c) => `- ${c}`).join('\n')}\n\nSCRIPT:\n${input.script}`,
      maxTokens: 8,
      models: [HAIKU, SONNET],
    });
    return /\byes\b/i.test(text);
  } catch (error) {
    console.error('scriptMightBeAffected failed (failing open):', error);
    return true;
  }
}

const CHANGE_NOTE_AUDIT_SYSTEM = `You are an expert tutorial-video-script auditor. You are given:
1. RECENT CHANGES — a list of user-facing changes that just shipped in the product (renamed or moved buttons, layout changes, changed/reordered steps, etc.).
2. SCRIPT — a tutorial video script.

Find sections of the SCRIPT that are now outdated or incorrect because of one of the RECENT CHANGES. A line is outdated only if a listed change makes it wrong, misleading, or incomplete. If none of the changes affect this script, return an empty array.

🚨 CRITICAL: For "original_text", copy the EXACT text from the SCRIPT word-for-word — exact punctuation, spacing, and line breaks; a complete sentence or paragraph, never a paraphrase.

IMPORTANT: these changes come from short developer descriptions, so you may know THAT something changed (e.g. a button moved) without the exact new detail. In that case still flag the affected line, but in "suggested_replacement" tell the user what to check or re-record rather than inventing specifics you were not given.

Return ONLY valid JSON (no markdown fences, no commentary):
{
  "outdated_sections": [
    {
      "original_text": "EXACT TEXT FROM SCRIPT",
      "reason": "which change makes this outdated and why",
      "suggested_replacement": "corrected text, or what to verify/re-record if the exact new detail isn't known",
      "severity": "critical" | "moderate" | "minor",
      "category": "missing_step" | "wrong_ui_element" | "incorrect_sequence" | "missing_detail"
    }
  ]
}
If nothing in the script is outdated, return: { "outdated_sections": [] }`;

export async function auditScriptAgainstChangeNotes(input: {
  changeNotes: string[];
  script: string;
}): Promise<AuditResult> {
  let rawText = '';
  try {
    const { text } = await generateWithFallback({
      system: CHANGE_NOTE_AUDIT_SYSTEM,
      content: [
        {
          type: 'text',
          text: `RECENT CHANGES:\n${input.changeNotes.map((c) => `- ${c}`).join('\n')}`,
        },
        { type: 'text', text: `SCRIPT:\n${input.script}` },
      ],
      maxTokens: 8192,
      models: [OPUS, SONNET],
      effort: 'high',
      thinking: 'adaptive',
    });
    rawText = text;
    try {
      const parsed = JSON.parse(extractJsonObject(text)) as {
        outdated_sections?: OutdatedSection[];
      };
      return { sections: parsed.outdated_sections ?? [], rawText };
    } catch (parseError) {
      const msg = parseError instanceof Error ? parseError.message : String(parseError);
      console.error('Failed to parse change-note audit JSON:', msg);
      return { sections: [], rawText, parseError: msg };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Change-note audit failed:', error);
    return { sections: [], rawText, parseError: msg };
  }
}
