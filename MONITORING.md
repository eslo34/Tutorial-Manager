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
