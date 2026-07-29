import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  compareCommits,
  getBranchHeadSha,
  getFileContent,
  blobUrl,
  hasReleaseToken,
} from '@/lib/github';
import {
  gateChangeForRelevance,
  scriptCoversFeature,
  auditScriptAgainstRepoChange,
  summarizeRepoChange,
  extractUiWorkflowChanges,
  scriptMightBeAffected,
  auditScriptAgainstChangeNotes,
} from '@/lib/script-audit';
import { sendRepoDigestEmail, sendErrorEmail } from '@/lib/email';
import { notify } from '@/lib/notify';

export const maxDuration = 60;

const TIME_BUDGET_MS = 50_000; // ~10s headroom under the 60s function ceiling
const MAX_DOCS_CHANGED = 15; // more feature docs than this in one run = bulk restructure; skip AI
const MAX_AUDITS = 16; // safety cap on Opus audits per run
const RELEVANCE_CONCURRENCY = 6;
const UI_GROUP_KEY = '__ui_changes__'; // digest group for commit-derived UI/workflow findings

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

// "docs/features/property-group.md" -> "Property Group"
function featureNameFromPath(path: string): string {
  const base = path.split('/').pop() || path;
  const stem = base.replace(/\.mdx?$/i, '');
  return stem.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ProjectRow {
  id: string;
  title: string;
  script: string | null;
  feature_doc_paths: string[];
  auto_update: boolean; // false = notify-only: the digest is the deliverable
}

// Accumulates per-feature-change edit groups for the digest email.
interface ChangeGroup {
  feature: string;
  docPath: string;
  sourceUrl: string;
  summary: string;
  videos: Map<string, { id: string; title: string; autoUpdate: boolean; edits: { severity: string; category: string; reason: string }[] }>;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }

  let checkRunId: string | null = null;
  let clientName = clientId;

  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { repo_watch: true },
    });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    clientName = client.name;

    const watch = client.repo_watch;
    if (!watch || !watch.enabled) {
      return NextResponse.json({ skipped: true, reason: 'No enabled repo watch' });
    }

    const { owner, name, branch, docs_path } = watch;
    // Per-repo aware: this repo may be reachable via its own token even if the
    // global GITHUB_RELEASE_TOKEN is unset (and vice-versa).
    if (!hasReleaseToken(owner, name)) {
      return NextResponse.json({ skipped: true, reason: `No GitHub token for ${owner}/${name}` });
    }
    const repoLabel = `${owner}/${name}`;

    const checkRun = await prisma.checkRun.create({
      data: { client_id: clientId, status: 'running', source: 'repo' },
    });
    checkRunId = checkRun.id;

    // The first GitHub call. A 401/403/404 here is the EXPECTED state while the
    // token can't read the repo yet — a private repo returns 404 (GitHub hides
    // existence), and a fine-grained PAT pending org approval / missing
    // Contents:Read returns 401/403/404. None of these are a real failure worth
    // a daily red alert, so record a quiet 'awaiting_access' check and return
    // WITHOUT an error email. (A persistent 404 AFTER approval means the
    // owner/name/branch is wrong — the summary says to check that too.)
    let head: string;
    try {
      head = await getBranchHeadSha(owner, name, branch);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/GitHub 40[134]/.test(msg)) {
        await prisma.checkRun.update({
          where: { id: checkRunId },
          data: {
            status: 'awaiting_access',
            finished_at: new Date(),
            error_message: msg.slice(0, 300),
            summary: `Can't read ${repoLabel} yet — the GitHub token has no access (fine-grained PAT pending org approval, or missing Contents:Read). If it stays this way after approval, double-check the owner/name/branch.`,
          },
        });
        return NextResponse.json({ skipped: true, reason: 'awaiting_access', repo: repoLabel });
      }
      throw e; // any other failure is a real error → outer catch (alerts)
    }

    // ----- First run: seed the cursor and watch forward from here. ----------
    // (A one-time "audit current docs vs scripts" backfill is a separate
    // opt-in, once video↔doc mappings exist.)
    if (!watch.last_processed_sha) {
      await prisma.repoWatch.update({
        where: { id: watch.id },
        data: { last_processed_sha: head, last_checked_at: new Date() },
      });
      await prisma.checkRun.update({
        where: { id: checkRunId },
        data: {
          status: 'success',
          finished_at: new Date(),
          summary: 'Watching started — first run just records the baseline; audits begin on the next change.',
        },
      });
      return NextResponse.json({ runId: checkRunId, firstRun: true, seededSha: head });
    }

    // ----- Incremental: what changed since we last looked? ------------------
    const cmp = await compareCommits(owner, name, watch.last_processed_sha, head);
    if (cmp.ahead_by === 0) {
      await prisma.repoWatch.update({
        where: { id: watch.id },
        data: { last_checked_at: new Date() },
      });
      await prisma.checkRun.update({
        where: { id: checkRunId },
        data: {
          status: 'success',
          finished_at: new Date(),
          summary: 'Checked — no new commits since the last run.',
        },
      });
      return NextResponse.json({ runId: checkRunId, aheadBy: 0, changedDocs: 0 });
    }

    // ----- LOCAL-VERIFY: cloud only DETECTS; your machine reads + verifies. --
    // No AI here — just capture the diff into a RepoScan for the local Claude
    // Code agent (subscription, not metered API). Never runs the audit below.
    if (watch.local_verify) {
      const files = cmp.files
        .filter((f) => f.status !== 'removed')
        .slice(0, 300)
        .map((f) => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          patch: (f.patch || '').slice(0, 8000),
        }));
      const messages = Array.from(
        new Set(cmp.commits.map((c) => c.message.split('\n')[0].trim()).filter(Boolean))
      ).slice(0, 200);

      const scan =
        files.length > 0
          ? await prisma.repoScan.create({
              data: {
                client_id: clientId,
                repo: repoLabel,
                base_sha: watch.last_processed_sha,
                head_sha: head,
                changed_files: files,
                commit_messages: messages,
                status: 'pending',
              },
            })
          : null;

      // Advance the cursor now — the RepoScan owns the range from here.
      await prisma.repoWatch.update({
        where: { id: watch.id },
        data: { last_processed_sha: head, last_checked_at: new Date() },
      });
      await prisma.checkRun.update({
        where: { id: checkRunId },
        data: {
          status: 'success',
          finished_at: new Date(),
          pages_checked: files.length,
          pages_changed: files.length,
          summary: scan
            ? `${cmp.ahead_by} commit(s), ${files.length} file(s) changed — queued for local verification on your machine.`
            : `${cmp.ahead_by} commit(s), nothing to verify (only removals).`,
        },
      });
      if (scan) {
        await notify(
          `🔎 ${repoLabel} changed (${cmp.ahead_by} commit${cmp.ahead_by === 1 ? '' : 's'}, ${files.length} file${files.length === 1 ? '' : 's'}) — verifying on your machine.`,
          { title: `${clientName}: checking a change`, click: 'https://tutorial-manager-three.vercel.app/pipeline' }
        );
      }
      return NextResponse.json({ runId: checkRunId, aheadBy: cmp.ahead_by, localVerify: true, scanId: scan?.id ?? null, files: files.length });
    }

    const changedDocs = cmp.files.filter(
      (f) =>
        f.filename.startsWith(docs_path) &&
        /\.mdx?$/i.test(f.filename) &&
        f.status !== 'removed'
    );

    // Bulk docs restructure — don't try to interpret a wholesale reshuffle.
    // Advance the cursor so we don't re-alert daily, and notify the operator.
    if (changedDocs.length > MAX_DOCS_CHANGED) {
      await prisma.repoWatch.update({
        where: { id: watch.id },
        data: { last_processed_sha: head, last_checked_at: new Date() },
      });
      await prisma.checkRun.update({
        where: { id: checkRunId },
        data: {
          status: 'partial',
          finished_at: new Date(),
          pages_checked: changedDocs.length,
          pages_changed: changedDocs.length,
          error_message: `${changedDocs.length} feature docs changed — likely a docs restructure; skipped AI`,
          summary: `${changedDocs.length} feature docs changed at once — looks like a bulk restructure, so the AI audit was skipped. Review manually.`,
        },
      });
      if (process.env.MONITORING_TO_EMAIL) {
        await sendErrorEmail({
          clientName,
          toEmail: process.env.MONITORING_TO_EMAIL,
          runId: checkRunId,
          message: `${changedDocs.length} feature docs changed in ${repoLabel} in one run — looks like a bulk docs restructure. AI audit skipped; review manually.`,
        });
      }
      return NextResponse.json({
        runId: checkRunId,
        status: 'partial',
        changedDocs: changedDocs.length,
        skipped: 'too many docs',
      });
    }

    const projects = (await prisma.project.findMany({
      where: { client_id: clientId, script: { not: null } },
      select: { id: true, title: true, script: true, feature_doc_paths: true, auto_update: true },
    })) as ProjectRow[];
    // If ANY project has an explicit mapping, we trust mappings and skip the
    // Haiku router. Otherwise (zero-config) we route via the router.
    const anyMapped = projects.some((p) => p.feature_doc_paths.length > 0);

    const deadline = Date.now() + TIME_BUDGET_MS;
    const changeGroups = new Map<string, ChangeGroup>();
    let pagesTrivial = 0;
    let editsProposed = 0;
    let auditsRun = 0;
    let overflow = 0;

    for (const file of changedDocs) {
      if (Date.now() > deadline || auditsRun >= MAX_AUDITS) {
        overflow += 1;
        continue;
      }

      const path = file.filename;
      const feature = featureNameFromPath(path);
      const srcUrl = blobUrl(owner, name, head, path);
      const diff = file.patch || '(file changed; no inline diff available)';

      // Change-relevance gate (Haiku): is this change meaningful at all?
      if (file.patch) {
        const verdict = await gateChangeForRelevance({
          pageUrl: srcUrl,
          pageTitle: feature,
          diff,
        });
        if (!verdict || verdict.verdict !== 'matters') {
          pagesTrivial += 1;
          continue;
        }
      }

      // Which videos might this change affect?
      const candidates = anyMapped
        ? projects.filter((p) => p.feature_doc_paths.includes(path))
        : projects;
      if (candidates.length === 0) continue;

      // Fetch the full current doc once (cached in the audit for reuse across
      // scripts), and summarize the change for the email.
      const docContent = await getFileContent(owner, name, path, head);
      const summary = await summarizeRepoChange({ featureName: feature, diff });

      // Zero-config: prune to scripts actually about this feature (Haiku,
      // in parallel batches). Mapped: trust the mapping.
      let relevant: ProjectRow[] = candidates;
      if (!anyMapped) {
        const brief = docContent.slice(0, 800);
        relevant = [];
        for (let i = 0; i < candidates.length; i += RELEVANCE_CONCURRENCY) {
          const batch = candidates.slice(i, i + RELEVANCE_CONCURRENCY);
          const flags = await Promise.all(
            batch.map((p) =>
              scriptCoversFeature({ featureName: feature, featureBrief: brief, script: p.script || '' })
            )
          );
          batch.forEach((p, idx) => flags[idx] && relevant.push(p));
        }
      }

      for (const project of relevant) {
        if (!project.script) continue;
        if (Date.now() > deadline || auditsRun >= MAX_AUDITS) {
          overflow += 1;
          continue;
        }
        auditsRun += 1;
        const { sections } = await auditScriptAgainstRepoChange({
          featureName: feature,
          docPath: path,
          blobUrl: srcUrl,
          docContent,
          diff,
          script: project.script,
        });
        const significant = sections.filter(
          (s) => s.severity === 'critical' || s.severity === 'moderate'
        );
        if (significant.length === 0) continue;

        await prisma.pendingScriptEdit.createMany({
          data: significant.map((s) => ({
            project_id: project.id,
            source_url: srcUrl,
            original_text: s.original_text,
            suggested_replacement: s.suggested_replacement,
            reason: s.reason,
            severity: s.severity,
            category: s.category,
          })),
        });
        editsProposed += significant.length;

        // Accumulate for the digest.
        let group = changeGroups.get(path);
        if (!group) {
          group = { feature, docPath: path, sourceUrl: srcUrl, summary, videos: new Map() };
          changeGroups.set(path, group);
        }
        let video = group.videos.get(project.id);
        if (!video) {
          video = { id: project.id, title: project.title, autoUpdate: project.auto_update, edits: [] };
          group.videos.set(project.id, video);
        }
        for (const s of significant) {
          video.edits.push({ severity: s.severity, category: s.category, reason: s.reason });
        }
      }
    }

    // Advance the cursor past everything we compared. (Overflowed audits are
    // rare at realistic volume; we log the count rather than re-alert daily.)
    await prisma.repoWatch.update({
      where: { id: watch.id },
      data: { last_processed_sha: head, last_checked_at: new Date() },
    });

    // ----- Option A: user-facing changes described in commit / PR messages ---
    // Catches the "small stuff" (renamed or moved buttons, layout tweaks,
    // reordered steps) that may never reach the feature docs. Runs off the
    // commit descriptions we already fetched, whether or not a doc changed.
    let uiChangeNotes: string[] = [];
    let uiEditsProposed = 0;
    if (Date.now() < deadline && auditsRun < MAX_AUDITS && projects.length > 0) {
      const commitMessages = Array.from(
        new Set(cmp.commits.map((c) => c.message.trim()).filter((m) => m.length > 0))
      )
        .slice(0, 120)
        .map((m) => m.slice(0, 300));
      if (commitMessages.length > 0) {
        uiChangeNotes = await extractUiWorkflowChanges({ commitMessages });
      }
    }

    if (uiChangeNotes.length > 0) {
      const compareUrl = `https://github.com/${owner}/${name}/compare/${watch.last_processed_sha}...${head}`;
      for (const project of projects) {
        if (!project.script) continue;
        if (Date.now() > deadline || auditsRun >= MAX_AUDITS) {
          overflow += 1;
          continue;
        }
        // Cheap prefilter: could any of these changes touch this script at all?
        const maybe = await scriptMightBeAffected({
          changeNotes: uiChangeNotes,
          script: project.script,
        });
        if (!maybe) continue;
        if (Date.now() > deadline || auditsRun >= MAX_AUDITS) {
          overflow += 1;
          continue;
        }
        auditsRun += 1;
        const { sections } = await auditScriptAgainstChangeNotes({
          changeNotes: uiChangeNotes,
          script: project.script,
        });
        const significant = sections.filter(
          (s) => s.severity === 'critical' || s.severity === 'moderate'
        );
        if (significant.length === 0) continue;

        await prisma.pendingScriptEdit.createMany({
          data: significant.map((s) => ({
            project_id: project.id,
            source_url: compareUrl,
            original_text: s.original_text,
            suggested_replacement: s.suggested_replacement,
            reason: s.reason,
            severity: s.severity,
            category: s.category,
          })),
        });
        uiEditsProposed += significant.length;
        editsProposed += significant.length;

        let group = changeGroups.get(UI_GROUP_KEY);
        if (!group) {
          group = {
            feature: 'UI & workflow changes',
            docPath: 'from developer change descriptions',
            sourceUrl: compareUrl,
            summary: uiChangeNotes.map((c) => `• ${c}`).join('  '),
            videos: new Map(),
          };
          changeGroups.set(UI_GROUP_KEY, group);
        }
        let video = group.videos.get(project.id);
        if (!video) {
          video = { id: project.id, title: project.title, autoUpdate: project.auto_update, edits: [] };
          group.videos.set(project.id, video);
        }
        for (const s of significant) {
          video.edits.push({ severity: s.severity, category: s.category, reason: s.reason });
        }
      }
    }

    // ----- Build the run summary (feature-doc pass + UI/commit pass) --------
    const docFeatureGroups = Array.from(changeGroups.keys()).filter(
      (k) => k !== UI_GROUP_KEY
    ).length;
    const docEdits = editsProposed - uiEditsProposed;
    const summaryParts: string[] = [];
    if (changedDocs.length === 0) {
      summaryParts.push('no feature-doc changes');
    } else if (docEdits > 0) {
      summaryParts.push(
        `${docFeatureGroups} feature${docFeatureGroups === 1 ? '' : 's'} changed -> ${docEdits} edit${docEdits === 1 ? '' : 's'}`
      );
    } else {
      summaryParts.push(
        `${changedDocs.length} feature doc${changedDocs.length === 1 ? '' : 's'} changed, nothing outdated`
      );
    }
    if (uiChangeNotes.length > 0) {
      summaryParts.push(
        uiEditsProposed > 0
          ? `${uiChangeNotes.length} UI/workflow change${uiChangeNotes.length === 1 ? '' : 's'} from commits -> ${uiEditsProposed} edit${uiEditsProposed === 1 ? '' : 's'}`
          : `${uiChangeNotes.length} UI/workflow change${uiChangeNotes.length === 1 ? '' : 's'} from commits, nothing outdated`
      );
    }
    const emailed = changeGroups.size > 0 && !!process.env.MONITORING_TO_EMAIL;
    let runSummary = `Checked — ${summaryParts.join('; ')}.`;
    if (emailed) runSummary += ' Digest emailed.';
    if (overflow > 0) {
      runSummary += ` (${overflow} audit${overflow === 1 ? '' : 's'} deferred to the next run.)`;
    }

    const status = overflow > 0 ? 'partial' : 'success';
    await prisma.checkRun.update({
      where: { id: checkRunId },
      data: {
        status,
        finished_at: new Date(),
        pages_checked: changedDocs.length,
        pages_changed: changedDocs.length,
        pages_trivial: pagesTrivial,
        edits_proposed: editsProposed,
        summary: runSummary,
      },
    });

    // Digest — only if we produced edits.
    if (changeGroups.size > 0 && process.env.MONITORING_TO_EMAIL) {
      const changes = Array.from(changeGroups.values()).map((g) => ({
        feature: g.feature,
        docPath: g.docPath,
        sourceUrl: g.sourceUrl,
        summary: g.summary,
        videos: Array.from(g.videos.values()),
      }));
      await sendRepoDigestEmail({
        clientName,
        repoLabel,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
        toEmail: process.env.MONITORING_TO_EMAIL,
        changes,
        runId: checkRunId,
      });
    }

    return NextResponse.json({
      runId: checkRunId,
      status,
      aheadBy: cmp.ahead_by,
      changedDocs: changedDocs.length,
      pagesTrivial,
      auditsRun,
      editsProposed,
      overflow,
      truncatedFiles: cmp.truncatedFiles,
    });
  } catch (error) {
    console.error('scan-repo failure:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (checkRunId) {
      await prisma.checkRun
        .update({
          where: { id: checkRunId },
          data: {
            status: 'error',
            finished_at: new Date(),
            error_message: message,
            summary: `Check failed: ${message.slice(0, 200)}`,
          },
        })
        .catch(() => undefined);
    }
    if (process.env.MONITORING_TO_EMAIL && checkRunId) {
      await sendErrorEmail({
        clientName,
        toEmail: process.env.MONITORING_TO_EMAIL,
        runId: checkRunId,
        message,
      }).catch(() => undefined);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
