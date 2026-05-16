import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { refetchUrl, hashContent, diffParagraphs, type CrawlPage } from '@/lib/crawler-server';
import {
  gateChangeForRelevance,
  auditScriptAgainstPage,
  type OutdatedSection,
} from '@/lib/script-audit';
import { sendDigestEmail, sendErrorEmail } from '@/lib/email';

export const maxDuration = 60;

const FETCH_CONCURRENCY = 8;
const TIME_BUDGET_MS = 50_000; // Leaves ~10s headroom under the 60s function ceiling
const MAX_PAGES_CHANGED = 20;  // If more, treat as site-wide redesign and bail

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  return !!auth && !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
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
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    clientName = client.name;

    const snapshots = await prisma.docPageSnapshot.findMany({ where: { client_id: clientId } });
    if (snapshots.length === 0) {
      return NextResponse.json({ skipped: true, reason: 'No snapshots — run setup-monitoring first' });
    }

    const checkRun = await prisma.checkRun.create({
      data: { client_id: clientId, status: 'running' },
    });
    checkRunId = checkRun.id;

    // ----- Step 1: Re-fetch all watched pages in parallel batches -----
    const fresh: Array<{ snapshot: (typeof snapshots)[number]; page: CrawlPage | null }> = [];
    for (let i = 0; i < snapshots.length; i += FETCH_CONCURRENCY) {
      const batch = snapshots.slice(i, i + FETCH_CONCURRENCY);
      const results = await Promise.all(batch.map((s) => refetchUrl(s.url)));
      results.forEach((page, idx) => fresh.push({ snapshot: batch[idx], page }));
    }
    const pagesChecked = fresh.filter((f) => f.page !== null).length;

    // ----- Step 2: Hash-diff to find changed pages (cheap pre-filter) -----
    const unchangedIds: string[] = [];
    const changed: Array<{
      snapshot: (typeof snapshots)[number];
      page: CrawlPage;
      newHash: string;
      diff: string;
    }> = [];

    for (const { snapshot, page } of fresh) {
      if (!page) continue; // fetch failed — leave snapshot untouched
      const newHash = hashContent(page.content);
      if (newHash === snapshot.content_hash) {
        unchangedIds.push(snapshot.id);
      } else {
        changed.push({
          snapshot,
          page,
          newHash,
          diff: diffParagraphs(snapshot.content_text, page.content),
        });
      }
    }

    if (unchangedIds.length > 0) {
      await prisma.docPageSnapshot.updateMany({
        where: { id: { in: unchangedIds } },
        data: { last_checked_at: new Date() },
      });
    }

    // Site-redesign safety cap — don't burn AI tokens trying to interpret a
    // 50-page reshuffle. Email the operator and stop.
    if (changed.length > MAX_PAGES_CHANGED) {
      await prisma.checkRun.update({
        where: { id: checkRunId },
        data: {
          status: 'partial',
          finished_at: new Date(),
          pages_checked: pagesChecked,
          pages_changed: changed.length,
          error_message: `${changed.length} pages changed — likely a site-wide redesign; skipped AI`,
        },
      });
      if (process.env.MONITORING_TO_EMAIL) {
        await sendErrorEmail({
          clientName,
          toEmail: process.env.MONITORING_TO_EMAIL,
          runId: checkRunId,
          message: `${changed.length} pages changed in a single day — looks like a site redesign. Manual review recommended; AI pipeline skipped to avoid noise.`,
        });
      }
      return NextResponse.json({
        status: 'partial',
        pagesChecked,
        pagesChanged: changed.length,
        skipped: 'too many pages',
      });
    }

    // ----- Step 3: Haiku gate — drop trivial prose changes -----
    // `?force=1` bypasses the gate. Used by the test harness so a simulated
    // change is guaranteed to exercise the Sonnet + email path. Auth is still
    // required (bearer token at top of handler), so this isn't a back door.
    const force = new URL(request.url).searchParams.get('force') === '1';
    const nonTrivial: typeof changed = [];
    let pagesTrivial = 0;
    for (const c of changed) {
      if (force) {
        console.log(`⚙️ force=1 — bypassing Haiku gate for ${c.snapshot.url}`);
        nonTrivial.push(c);
        continue;
      }
      const verdict = await gateChangeForRelevance({
        pageUrl: c.snapshot.url,
        pageTitle: c.page.title,
        diff: c.diff,
      });
      if (verdict && verdict.verdict === 'matters') {
        nonTrivial.push(c);
      } else {
        pagesTrivial += 1;
      }
    }

    // ----- Step 4: Per (changedPage × script) Sonnet audit with time budget -----
    interface ProposedEdit extends OutdatedSection {
      projectId: string;
      projectTitle: string;
      source_url: string;
      source_snapshot_id: string;
    }
    interface DebugAudit {
      projectId: string;
      projectTitle: string;
      snapshotUrl: string;
      snapshotTitle: string;
      sectionsCount: number;
      bySeverity: Record<string, number>;
      sections: OutdatedSection[];
      parseError: string | null;
      rawTextPreview: string;
    }
    const proposedEdits: ProposedEdit[] = [];
    const debugAudits: DebugAudit[] = [];
    const overflowQueue: Array<{ projectId: string; snapshotId: string }> = [];
    const deadline = Date.now() + TIME_BUDGET_MS;

    let projects: { id: string; title: string; script: string | null }[] = [];
    if (nonTrivial.length > 0) {
      projects = await prisma.project.findMany({
        where: { client_id: clientId, script: { not: null } },
        select: { id: true, title: true, script: true },
      });
    }

    for (const c of nonTrivial) {
      for (const project of projects) {
        if (!project.script) continue;
        if (Date.now() > deadline) {
          overflowQueue.push({ projectId: project.id, snapshotId: c.snapshot.id });
          continue;
        }
        const { sections, rawText, parseError } = await auditScriptAgainstPage({
          pageUrl: c.snapshot.url,
          pageTitle: c.page.title,
          pageContent: c.page.content,
          script: project.script,
        });

        // When ?force=1, capture full audit details so the test harness can
        // see exactly what Sonnet returned (including minor severities that
        // would normally be filtered out).
        if (force) {
          const bySeverity: Record<string, number> = {};
          for (const s of sections) bySeverity[s.severity] = (bySeverity[s.severity] || 0) + 1;
          debugAudits.push({
            projectId: project.id,
            projectTitle: project.title,
            snapshotUrl: c.snapshot.url,
            snapshotTitle: c.page.title,
            sectionsCount: sections.length,
            bySeverity,
            sections,
            parseError: parseError || null,
            rawTextPreview: rawText.slice(0, 1500),
          });
        }

        // Filter out 'minor' severity — too noisy for an automated alert.
        const significant = sections.filter(
          (s) => s.severity === 'critical' || s.severity === 'moderate'
        );
        if (significant.length > 0) {
          await prisma.pendingScriptEdit.createMany({
            data: significant.map((s) => ({
              project_id: project.id,
              source_url: c.snapshot.url,
              source_snapshot_id: c.snapshot.id,
              original_text: s.original_text,
              suggested_replacement: s.suggested_replacement,
              reason: s.reason,
              severity: s.severity,
              category: s.category,
            })),
          });
          for (const s of significant) {
            proposedEdits.push({
              ...s,
              projectId: project.id,
              projectTitle: project.title,
              source_url: c.snapshot.url,
              source_snapshot_id: c.snapshot.id,
            });
          }
        }
      }
    }

    // Fire fan-out for whatever didn't fit. Fire-and-forget — these run as
    // their own function invocations and report into the DB independently.
    if (overflowQueue.length > 0 && process.env.NEXT_PUBLIC_BASE_URL && process.env.CRON_SECRET) {
      for (const item of overflowQueue) {
        void fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cron/scan-script`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        }).catch((e) => console.error('Fan-out failed:', e));
      }
    }

    // ----- Step 5: Update snapshots for pages that actually changed -----
    for (const c of changed) {
      await prisma.docPageSnapshot.update({
        where: { id: c.snapshot.id },
        data: {
          content_text: c.page.content,
          content_hash: c.newHash,
          title: c.page.title,
          last_checked_at: new Date(),
          last_changed_at: new Date(),
        },
      });
    }

    // ----- Step 6: Finalize CheckRun + send digest if we proposed anything -----
    const status = overflowQueue.length > 0 ? 'partial' : 'success';
    await prisma.checkRun.update({
      where: { id: checkRunId },
      data: {
        status,
        finished_at: new Date(),
        pages_checked: pagesChecked,
        pages_changed: changed.length,
        pages_trivial: pagesTrivial,
        edits_proposed: proposedEdits.length,
      },
    });

    if (proposedEdits.length > 0 && process.env.MONITORING_TO_EMAIL) {
      // Group edits by project for the email
      const byProject = new Map<
        string,
        {
          id: string;
          title: string;
          edits: { severity: string; category: string; reason: string; source_url: string }[];
        }
      >();
      for (const e of proposedEdits) {
        if (!byProject.has(e.projectId)) {
          byProject.set(e.projectId, { id: e.projectId, title: e.projectTitle, edits: [] });
        }
        byProject.get(e.projectId)!.edits.push({
          severity: e.severity,
          category: e.category,
          reason: e.reason,
          source_url: e.source_url,
        });
      }
      await sendDigestEmail({
        clientName,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
        toEmail: process.env.MONITORING_TO_EMAIL,
        pagesChanged: nonTrivial.length,
        projects: Array.from(byProject.values()),
        runId: checkRunId,
      });
    }

    return NextResponse.json({
      runId: checkRunId,
      status,
      pagesChecked,
      pagesChanged: changed.length,
      pagesTrivial,
      editsProposed: proposedEdits.length,
      overflowQueued: overflowQueue.length,
      ...(force ? { debug: { audits: debugAudits } } : {}),
    });
  } catch (error) {
    console.error('scan-client failure:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (checkRunId) {
      await prisma.checkRun
        .update({
          where: { id: checkRunId },
          data: { status: 'error', finished_at: new Date(), error_message: message },
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
