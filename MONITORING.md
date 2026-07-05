# Daily Doc-Monitoring

Automated system that watches each monitored client's docs site for changes,
flags meaningful workflow updates, drafts red-overlay edits per affected
script, persists them for accept/decline review, and emails a daily digest.

## How it runs

A Vercel Cron hits `/api/cron/check-updates` once a day at 06:00 UTC
(configured in `vercel.json`). That entry point fans out one call per
monitored client to `/api/cron/scan-client`, which does the actual work
within the 60-second Hobby-plan function ceiling. Anything that doesn't fit
in the budget overflows to `/api/cron/scan-script` (one (page × script) call
each).

Architecture details and design rationale live in
`C:\Users\maxte\.claude\plans\mutable-coalescing-thacker.md`.

## Required environment variables

Set these in **both** `.env.local` (for local dev) and the Vercel dashboard
(Settings → Environment Variables) for production.

| Variable | Purpose |
| --- | --- |
| `CRON_SECRET` | Random 32-char string. Vercel sends it in the `Authorization: Bearer …` header when invoking the cron; the routes reject any other caller. Generate with `openssl rand -hex 32`. |
| `ANTHROPIC_API_KEY` | Already set; powers the Haiku gate and Sonnet per-script comparison. |
| `RESEND_API_KEY` | From [resend.com](https://resend.com). Free tier (3k/month) is plenty. No domain verification needed — the digest sends from `onboarding@resend.dev`. |
| `MONITORING_TO_EMAIL` | The recipient address — your own email. |
| `NEXT_PUBLIC_BASE_URL` | The deployed origin (e.g. `https://tutorial-manager.vercel.app`). Used for the self-fetch fan-out between cron handlers and for deep-link URLs in the digest email. In local dev, `http://localhost:3000`. |

## Setting up a client for monitoring

1. Log into the app, open the client's projects view.
2. Click **"Set up daily monitoring"** (the button appears on every client
   that doesn't yet have monitoring enabled).
3. Paste the root URL of the docs site you want watched (e.g.
   `https://docs.eandox.com`) and submit.
4. The seed crawl runs up to 50 pages and stores one `DocPageSnapshot` per
   page. From the next cron run on, those URLs are re-fetched daily and
   diffed against their stored hashes.

## Manually triggering a run

Useful for the first deploy, or to force a recheck without waiting for
06:00 UTC:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://tutorial-manager.vercel.app/api/cron/check-updates
```

The endpoint also accepts a logged-in session, so you can hit it from the
browser while signed in — useful for local debugging.

## What the email contains

A digest is sent **only when at least one suggested edit was produced**.
Subject: `[Client] N suggested updates across M videos`. Body lists each
affected project with a deep link straight to its review screen (where the
existing red-overlay accept/decline UI loads the persisted edits).

Cron failures send a separate `[Tutorial Manager] Cron failed …` email so
silent breakages don't go unnoticed.

## Inspecting state

- `CheckRun` rows record each cron invocation per client. Order by
  `started_at desc` to see the latest result.
- `DocPageSnapshot` rows hold the last-seen content + hash per URL.
- `PendingScriptEdit.status = 'pending'` rows are the unresolved
  suggestions; `accepted` / `declined` are resolved.

Use Prisma Studio (`npx prisma studio`) for ad-hoc inspection.

---

# Repo-Release Monitoring

A second, independent update source: instead of crawling a docs website, this
watches a **GitHub repo's committed feature docs** (`docs/features/*.md`) and
audits video scripts when a feature actually changes. It reuses the same back
half — Haiku relevance gate → per-script audit → `PendingScriptEdit` → digest
email → red-overlay review — so nothing downstream changes. The doc-crawl flow
above is untouched; a client can use either, both, or neither.

## How it runs

The same daily `/api/cron/check-updates` entry also fans out one call per
enabled `RepoWatch` to `/api/cron/scan-repo`. That route:

1. `getBranchHeadSha` → `compareCommits(last_processed_sha … head)` via the
   GitHub API (read-only). First run just seeds `last_processed_sha` and
   watches forward.
2. Filters the changed files to `docs_path` (`docs/features` by default).
3. **Haiku gate** on each changed doc's diff — drops trivial edits.
4. **Routing:** if any project has an explicit `feature_doc_paths` mapping, only
   the mapped videos are audited for a given doc. Otherwise (zero-config), a
   cheap **Haiku relevance router** (`scriptCoversFeature`) prunes to the scripts
   actually about that feature before the expensive step.
5. **Opus 4.8 audit** (`auditScriptAgainstRepoChange`) per surviving
   (doc × script) pair — given the diff + full doc + script, returns the exact
   outdated sentences and rewrites. This is the one judgment-critical call; it's
   gated and low-volume, so the per-call premium is negligible.
6. Writes `PendingScriptEdit` rows (critical/moderate only) and advances the
   cursor to `head`.
7. Emails a digest (below) if anything was produced.

Alongside the feature-doc pass, each run also mines the commit/PR descriptions in
the same compare window for user-facing changes that may never reach the docs —
renamed or moved buttons, layout tweaks, reordered steps (`extractUiWorkflowChanges`
→ `scriptMightBeAffected` prefilter → `auditScriptAgainstChangeNotes`). These
findings surface in the digest under a **"UI & workflow changes"** group, with
`source_url` set to the GitHub compare view. This catches the small UI drift the
feature docs don't describe; because it works off short developer descriptions, a
finding may say "verify / re-record this" rather than give the exact new wording.

Model split: **Haiku** gates/routes, **Sonnet** writes the plain-language "what
changed" summary, **Opus 4.8** does the audit. Cadence stays daily — the heavy
work is gated on real doc changes, not the clock, so checking daily costs
essentially nothing on quiet days.

## Extra environment variable

| Variable | Purpose |
| --- | --- |
| `GITHUB_RELEASE_TOKEN` | A fine-grained GitHub PAT with **Contents: Read** on the watched repo (only). Used solely for read-only GitHub API calls — never writes/pushes. Rotate on the repo's schedule; a short expiry is fine. |

## Enabling it for a client

There's no UI toggle yet — configure via the API (ownership-checked against your
session):

```bash
# Create/enable the watch for a client
curl -X POST https://tutorial-manager.vercel.app/api/repo-watch \
  -H "Content-Type: application/json" -b "<your session cookie>" \
  -d '{"clientId":"<id>","owner":"bimobject","name":"bim-dictionary","branch":"main","docsPath":"docs/features"}'

# Read current config
curl "https://tutorial-manager.vercel.app/api/repo-watch?clientId=<id>" -b "<cookie>"
```

Video → feature-doc mapping is **optional** — leave it empty and the Haiku
router figures out which video each change affects. To tighten it later, set
`Project.feature_doc_paths` (repo-relative paths, e.g.
`["docs/features/property-group.md"]`) on each video.

## What the repo digest contains

Subject: `[owner/name] N feature updates affect M videos`. The body leads with
**what changed** — a plain-language summary per feature ("Property Groups can now
be attached to Data Templates as bundled sub-units…") plus a "What changed" link
to the doc — then lists **which videos and which parts** are outdated, each with
a deep link to its review screen. Sent only when at least one edit was produced.

## Inspecting state

- `RepoWatch` holds the repo config + `last_processed_sha` cursor per client.
- `CheckRun` rows also cover repo runs (`source = 'repo'`, `pages_changed` =
  feature docs changed, `summary` = a one-line human-readable outcome). The
  **Repo updates** modal shows the last ~20 of these as an activity log, so you
  can confirm the daily check ran — even on days where nothing changed and no
  email was sent.
- Repo-sourced `PendingScriptEdit` rows have `source_snapshot_id = null` and a
  `source_url` pointing at the GitHub blob at the audited sha.
