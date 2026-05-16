import { generateWithFallback, SONNET, HAIKU } from './anthropic';

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
}): Promise<OutdatedSection[]> {
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
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as { outdated_sections?: OutdatedSection[] };
    return parsed.outdated_sections ?? [];
  } catch (error) {
    console.error('Sonnet audit failed:', error);
    return [];
  }
}
