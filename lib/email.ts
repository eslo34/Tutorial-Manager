import { Resend } from 'resend';

// Resend's free tier requires a verified domain for custom from-addresses, but
// allows sending from `onboarding@resend.dev` without one. Fine for sending
// only to the operator's own email — no client-facing surface.
const FROM_ADDRESS = 'Tutorial Manager <onboarding@resend.dev>';

interface DigestEditSummary {
  severity: string; // critical | moderate (minor is filtered out before email)
  category: string;
  reason: string;
  source_url: string;
}

interface DigestProject {
  id: string;
  title: string;
  edits: DigestEditSummary[];
}

interface DigestParams {
  clientName: string;
  baseUrl: string;
  toEmail: string;
  pagesChanged: number;
  projects: DigestProject[]; // only projects with at least one edit
  runId: string;
}

interface ErrorParams {
  clientName: string;
  toEmail: string;
  runId: string;
  message: string;
}

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — email skipped');
    return null;
  }
  return new Resend(apiKey);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function severityChip(sev: string): string {
  const color = sev === 'critical' ? '#dc2626' : sev === 'moderate' ? '#d97706' : '#6b7280';
  return `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${color};color:#fff;font-size:11px;font-weight:600;text-transform:uppercase;">${escapeHtml(sev)}</span>`;
}

// Sends the daily digest. Logs and swallows errors — a failed email must not
// fail the cron run, since the edits are already persisted in the DB.
export async function sendDigestEmail(params: DigestParams): Promise<void> {
  const { clientName, baseUrl, toEmail, pagesChanged, projects, runId } = params;
  const resend = getClient();
  if (!resend) return;

  const totalEdits = projects.reduce((sum, p) => sum + p.edits.length, 0);
  const subject = `[${clientName}] ${totalEdits} suggested update${totalEdits === 1 ? '' : 's'} across ${projects.length} video${projects.length === 1 ? '' : 's'}`;

  const projectBlocks = projects
    .map((p) => {
      const editList = p.edits
        .map(
          (e) => `
        <li style="margin-bottom:10px;">
          ${severityChip(e.severity)}
          <span style="color:#374151;font-size:13px;">${escapeHtml(e.category.replace(/_/g, ' '))}</span><br/>
          <span style="color:#111827;">${escapeHtml(e.reason)}</span><br/>
          <a href="${escapeHtml(e.source_url)}" style="color:#0d9488;font-size:12px;">Source: ${escapeHtml(e.source_url)}</a>
        </li>`
        )
        .join('');
      const reviewUrl = `${baseUrl}/?projectId=${encodeURIComponent(p.id)}`;
      return `
      <div style="margin:24px 0;padding:16px;border:1px solid #e5e7eb;border-radius:8px;">
        <h3 style="margin:0 0 6px 0;color:#111827;">${escapeHtml(p.title)}</h3>
        <p style="margin:0 0 12px 0;color:#6b7280;font-size:13px;">${p.edits.length} suggested edit${p.edits.length === 1 ? '' : 's'}</p>
        <a href="${reviewUrl}" style="display:inline-block;background:#0d9488;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;font-weight:500;">Review in Script Manager →</a>
        <ul style="margin:14px 0 0 0;padding-left:18px;">${editList}</ul>
      </div>`;
    })
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f9fafb;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111827;">
  <div style="max-width:640px;margin:0 auto;">
    <h2 style="margin:0 0 8px 0;">${escapeHtml(clientName)} docs updated</h2>
    <p style="margin:0;color:#6b7280;">
      ${pagesChanged} doc page${pagesChanged === 1 ? '' : 's'} changed meaningfully today.
      ${totalEdits} suggested edit${totalEdits === 1 ? '' : 's'} across ${projects.length} video${projects.length === 1 ? '' : 's'} are waiting for review.
    </p>
    ${projectBlocks}
    <p style="margin:24px 0 0 0;color:#9ca3af;font-size:11px;">Run ID: ${escapeHtml(runId)}</p>
  </div>
</body></html>`;

  const textLines: string[] = [
    `${clientName} docs updated`,
    '',
    `${pagesChanged} doc page(s) changed meaningfully today.`,
    `${totalEdits} suggested edit(s) across ${projects.length} video(s) are waiting for review.`,
    '',
  ];
  for (const p of projects) {
    textLines.push(`— ${p.title} (${p.edits.length} edits)`);
    textLines.push(`  Review: ${baseUrl}/?projectId=${p.id}`);
    for (const e of p.edits) {
      textLines.push(`  [${e.severity.toUpperCase()}] ${e.reason}`);
    }
    textLines.push('');
  }
  textLines.push(`Run ID: ${runId}`);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject,
      html,
      text: textLines.join('\n'),
    });
    console.log(`✉️  Digest email sent to ${toEmail} (run ${runId})`);
  } catch (error) {
    console.error('Failed to send digest email:', error);
  }
}

// ----- Repo-release digest -------------------------------------------------
// Leads with WHAT CHANGED upstream (a plain-language "this changed → it now
// works like this" summary per feature), then WHICH VIDEOS/PARTS are affected.

interface RepoDigestEdit {
  severity: string; // critical | moderate
  category: string;
  reason: string;
}

interface RepoDigestVideo {
  id: string;
  title: string;
  edits: RepoDigestEdit[];
}

interface RepoDigestChange {
  feature: string; // e.g. "Property Group"
  docPath: string; // e.g. "docs/features/property-group.md"
  sourceUrl: string; // GitHub blob URL at the new sha
  summary: string; // "what changed → how it works now"
  videos: RepoDigestVideo[];
}

interface RepoDigestParams {
  clientName: string;
  repoLabel: string; // e.g. "bimobject/bim-dictionary"
  baseUrl: string;
  toEmail: string;
  changes: RepoDigestChange[]; // only changes that produced at least one edit
  runId: string;
}

export async function sendRepoDigestEmail(params: RepoDigestParams): Promise<void> {
  const { clientName, repoLabel, baseUrl, toEmail, changes, runId } = params;
  const resend = getClient();
  if (!resend) return;

  const affectedVideoIds = new Set<string>();
  let totalEdits = 0;
  for (const c of changes) {
    for (const v of c.videos) {
      affectedVideoIds.add(v.id);
      totalEdits += v.edits.length;
    }
  }
  const videoCount = affectedVideoIds.size;
  const subject = `[${repoLabel}] ${changes.length} feature update${changes.length === 1 ? '' : 's'} affect${changes.length === 1 ? 's' : ''} ${videoCount} video${videoCount === 1 ? '' : 's'}`;

  const changeBlocks = changes
    .map((c) => {
      const videoBlocks = c.videos
        .map((v) => {
          const editList = v.edits
            .map(
              (e) => `
            <li style="margin-bottom:8px;">
              ${severityChip(e.severity)}
              <span style="color:#374151;font-size:13px;">${escapeHtml(e.category.replace(/_/g, ' '))}</span><br/>
              <span style="color:#111827;">${escapeHtml(e.reason)}</span>
            </li>`
            )
            .join('');
          const reviewUrl = `${baseUrl}/?projectId=${encodeURIComponent(v.id)}`;
          return `
          <div style="margin:12px 0 0 0;padding:12px 14px;background:#f9fafb;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="color:#111827;">${escapeHtml(v.title)}</strong>
            </div>
            <p style="margin:4px 0 8px 0;color:#6b7280;font-size:12px;">${v.edits.length} outdated part${v.edits.length === 1 ? '' : 's'}</p>
            <a href="${reviewUrl}" style="display:inline-block;background:#0d9488;color:#fff;padding:7px 12px;border-radius:6px;text-decoration:none;font-weight:500;font-size:13px;">Review in Script Manager →</a>
            <ul style="margin:12px 0 0 0;padding-left:18px;">${editList}</ul>
          </div>`;
        })
        .join('');
      return `
      <div style="margin:24px 0;padding:16px;border:1px solid #e5e7eb;border-radius:8px;">
        <h3 style="margin:0 0 6px 0;color:#111827;">${escapeHtml(c.feature)}</h3>
        <p style="margin:0 0 8px 0;color:#111827;font-size:14px;line-height:1.5;">${escapeHtml(c.summary)}</p>
        <a href="${escapeHtml(c.sourceUrl)}" style="color:#0d9488;font-size:12px;">What changed: ${escapeHtml(c.docPath)} →</a>
        ${videoBlocks}
      </div>`;
    })
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f9fafb;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111827;">
  <div style="max-width:640px;margin:0 auto;">
    <h2 style="margin:0 0 8px 0;">${escapeHtml(repoLabel)} — feature updates</h2>
    <p style="margin:0;color:#6b7280;">
      ${changes.length} feature${changes.length === 1 ? '' : 's'} changed upstream today,
      producing ${totalEdits} suggested edit${totalEdits === 1 ? '' : 's'} across ${videoCount} video${videoCount === 1 ? '' : 's'}.
    </p>
    ${changeBlocks}
    <p style="margin:24px 0 0 0;color:#9ca3af;font-size:11px;">Client: ${escapeHtml(clientName)} · Run ID: ${escapeHtml(runId)}</p>
  </div>
</body></html>`;

  const textLines: string[] = [
    `${repoLabel} — feature updates`,
    '',
    `${changes.length} feature(s) changed upstream today, producing ${totalEdits} suggested edit(s) across ${videoCount} video(s).`,
    '',
  ];
  for (const c of changes) {
    textLines.push(`### ${c.feature}`);
    textLines.push(c.summary);
    textLines.push(`What changed: ${c.sourceUrl}`);
    for (const v of c.videos) {
      textLines.push(`  — ${v.title} (${v.edits.length} outdated part(s))`);
      textLines.push(`    Review: ${baseUrl}/?projectId=${v.id}`);
      for (const e of v.edits) {
        textLines.push(`    [${e.severity.toUpperCase()}] ${e.reason}`);
      }
    }
    textLines.push('');
  }
  textLines.push(`Run ID: ${runId}`);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject,
      html,
      text: textLines.join('\n'),
    });
    console.log(`✉️  Repo digest email sent to ${toEmail} (run ${runId})`);
  } catch (error) {
    console.error('Failed to send repo digest email:', error);
  }
}

// Fire-and-forget alert when a cron run blows up. So silent failures don't go
// unnoticed; the persisted edits side of the system is already crashed, but at
// least the operator hears about it.
export async function sendErrorEmail(params: ErrorParams): Promise<void> {
  const { clientName, toEmail, runId, message } = params;
  const resend = getClient();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: `[Tutorial Manager] Cron failed for ${clientName}`,
      text: `Daily doc-monitoring cron failed for ${clientName}.\n\nError: ${message}\n\nRun ID: ${runId}`,
    });
    console.log(`✉️  Error email sent to ${toEmail} (run ${runId})`);
  } catch (error) {
    console.error('Failed to send error email:', error);
  }
}
