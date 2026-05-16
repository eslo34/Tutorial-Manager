#!/usr/bin/env node
/**
 * Test harness for the daily doc-monitoring cron.
 *
 *   node scripts/test-monitoring.js status                # what's currently in the DB
 *   node scripts/test-monitoring.js trigger               # fire the cron right now (read-only — won't detect changes unless docs really changed)
 *   node scripts/test-monitoring.js simulate "EandoX"     # inject a fake "legacy feature" reference into one snapshot + one script
 *                                                          # → cron will detect, run Sonnet audit, persist edits, send email
 *   node scripts/test-monitoring.js clear "EandoX"        # restore tampered snapshot + project script; delete test-produced edits & check runs
 *
 * By default `trigger` hits NEXT_PUBLIC_BASE_URL from .env.local. Override:
 *   node scripts/test-monitoring.js trigger --url https://tutorial-manager.vercel.app
 *
 * State file (gitignored): scripts/.test-monitoring-state.json
 */
const fs = require('fs');
const path = require('path');

// Load env from .env.local then .env
for (const f of ['.env.local', '.env']) {
  const p = path.join(__dirname, '..', f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\r\n]+)"?/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const STATE_FILE = path.join(__dirname, '.test-monitoring-state.json');

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { tamperedSnapshots: [], tamperedProjects: [], lastTestStartedAt: null };
  }
  const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  if (!s.tamperedProjects) s.tamperedProjects = [];
  return s;
}
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getUrlOverride() {
  const i = process.argv.indexOf('--url');
  return i !== -1 ? process.argv[i + 1] : null;
}

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function findClientByNameOrId(key) {
  const byId = await prisma.client.findUnique({ where: { id: key } }).catch(() => null);
  if (byId) return byId;
  const byName = await prisma.client.findMany({ where: { name: key } });
  if (byName.length === 0) throw new Error(`No client matches "${key}"`);
  if (byName.length > 1) throw new Error(`Multiple clients named "${key}" — pass an id instead`);
  return byName[0];
}

async function triggerCron(extraQuery = '') {
  const baseUrl = getUrlOverride() || process.env.NEXT_PUBLIC_BASE_URL;
  const secret = process.env.CRON_SECRET;
  if (!baseUrl) throw new Error('Set NEXT_PUBLIC_BASE_URL in .env.local or pass --url <URL>');
  if (!secret) throw new Error('CRON_SECRET not set in .env.local');

  const qs = extraQuery ? `?${extraQuery}` : '';
  const url = `${baseUrl.replace(/\/+$/, '')}/api/cron/check-updates${qs}`;
  console.log(`→ POST ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  console.log(`← ${res.status}`);
  console.log(JSON.stringify(data, null, 2));
  return { ok: res.ok, status: res.status, data };
}

async function status() {
  const clients = await prisma.client.findMany({
    where: { monitoring_enabled: true },
    include: {
      check_runs: { orderBy: { started_at: 'desc' }, take: 3 },
      _count: { select: { snapshots: true } },
    },
  });
  if (clients.length === 0) {
    console.log('No clients have monitoring_enabled = true yet.');
    console.log('Use the "Set up monitoring" button in the app to seed one.');
  }
  for (const c of clients) {
    const pending = await prisma.pendingScriptEdit.count({
      where: { project: { client_id: c.id }, status: 'pending' },
    });
    console.log(`\n— ${c.name} (${c.id})`);
    console.log(`  root: ${c.monitoring_root_url}`);
    console.log(`  ${c._count.snapshots} snapshot(s)  |  ${pending} pending edit(s)`);
    if (c.check_runs.length === 0) {
      console.log('  no runs yet');
    } else {
      console.log('  recent runs:');
      for (const r of c.check_runs) {
        const finished = r.finished_at ? ` (finished ${r.finished_at.toISOString()})` : '';
        console.log(`    ${r.started_at.toISOString()}  status=${r.status}  changed=${r.pages_changed}/${r.pages_checked}  trivial=${r.pages_trivial}  edits=${r.edits_proposed}${finished}`);
        if (r.error_message) console.log(`      error: ${r.error_message}`);
      }
    }
  }
  const s = loadState();
  if (s.tamperedSnapshots.length > 0 || s.tamperedProjects.length > 0) {
    console.log(`\n⚠️  Test state active — run "clear" to restore.`);
    for (const t of s.tamperedSnapshots) {
      console.log(`   - snapshot:       ${t.url}`);
    }
    for (const t of s.tamperedProjects) {
      console.log(`   - project script: ${t.title}`);
    }
  }
}

// A fake UI element name we'll inject into both a doc snapshot and a script.
// The cron's Haiku gate sees a "removed UI element" in the diff → matters →
// Sonnet finds the matching reference in the script → outdated → edit emitted.
const TEST_LEGACY_FEATURE = 'TEST_LEGACY_QUICK_LAUNCHER_BUTTON';
const FAKE_LEGACY_PARAGRAPH = `[Legacy workflow note] To begin a new project, locate the ${TEST_LEGACY_FEATURE} on the main toolbar and click it. This button initialized the workspace and was the standard workflow before the recent UI overhaul.`;
const FAKE_SCRIPT_INSERT = `First, locate the ${TEST_LEGACY_FEATURE} on the toolbar and click it to start.`;

function injectIntoScript(script) {
  // Insert after the first sentence boundary so it doesn't look tacked on.
  const idx = script.indexOf('. ');
  if (idx === -1) return script.trim() + '\n\n' + FAKE_SCRIPT_INSERT;
  return script.slice(0, idx + 2) + FAKE_SCRIPT_INSERT + ' ' + script.slice(idx + 2);
}

async function simulate(clientKey) {
  const existing = loadState();
  if (existing.tamperedSnapshots.length > 0 || existing.tamperedProjects.length > 0) {
    throw new Error('Test state already exists. Run `clear` first.');
  }

  const client = await findClientByNameOrId(clientKey);

  // Pick the project with the longest script — gives Sonnet more to chew on.
  const projects = await prisma.project.findMany({
    where: { client_id: client.id, script: { not: null } },
    select: { id: true, title: true, script: true },
  });
  if (projects.length === 0) {
    throw new Error(`No projects with scripts on ${client.name}. Generate at least one first.`);
  }
  const project = projects.reduce((a, b) =>
    (b.script || '').length > (a.script || '').length ? b : a
  );

  // Pick the meatiest snapshot.
  const snapshots = await prisma.docPageSnapshot.findMany({ where: { client_id: client.id } });
  if (snapshots.length === 0) {
    throw new Error(`No snapshots for ${client.name} — run "Set up monitoring" first.`);
  }
  const snapshot = snapshots.reduce((a, b) =>
    (b.content_text?.length || 0) > (a.content_text?.length || 0) ? b : a
  );

  // Save originals before tampering anything.
  const state = {
    lastTestStartedAt: new Date().toISOString(),
    tamperedSnapshots: [{
      id: snapshot.id,
      url: snapshot.url,
      title: snapshot.title,
      originalHash: snapshot.content_hash,
      originalContentText: snapshot.content_text,
    }],
    tamperedProjects: [{
      id: project.id,
      title: project.title,
      originalScript: project.script,
    }],
  };
  saveState(state);

  // 1) Inject a reference to the fake legacy feature into the project script.
  //    Sonnet should find this when auditing against the (real) fresh doc page
  //    — the real page has no such feature, so the reference is "outdated".
  const mutatedScript = injectIntoScript(project.script);
  await prisma.project.update({
    where: { id: project.id },
    data: { script: mutatedScript },
  });

  // 2) Tamper the snapshot: prepend a "legacy note" paragraph describing that
  //    same fake feature, and use a junk hash so the cron's pre-filter sees
  //    a mismatch. diffParagraphs(mutated_stored, real_fresh) will surface the
  //    legacy paragraph as "removed" → Haiku flags as workflow change.
  const mutatedContent = FAKE_LEGACY_PARAGRAPH + '\n\n' + snapshot.content_text;
  await prisma.docPageSnapshot.update({
    where: { id: snapshot.id },
    data: {
      content_text: mutatedContent,
      content_hash: 'TEST_FORCED_MISMATCH',
    },
  });

  console.log(`Tampered for full-pipeline test:`);
  console.log(`  Project:  ${project.title}`);
  console.log(`            → injected reference to '${TEST_LEGACY_FEATURE}' in the script`);
  console.log(`  Snapshot: ${snapshot.title}`);
  console.log(`            → prepended a "legacy workflow" paragraph to stored content`);
  console.log(`  Originals saved to ${STATE_FILE}\n`);
  console.log(`Triggering cron with ?force=1 (bypasses Haiku gate so Sonnet runs)…\n`);
  await triggerCron('force=1');
  console.log('\n──────────────────────────────────────────');
  console.log('Watch your inbox for the digest email.');
  console.log('When done reviewing in the app, run:');
  console.log(`   node scripts/test-monitoring.js clear "${client.name}"`);
  console.log('to restore the script + snapshot and wipe test-produced edits.');
}

async function clearForClient(clientKey) {
  const client = await findClientByNameOrId(clientKey);
  const state = loadState();

  // 1) Restore tampered snapshots
  let restoredSnaps = 0;
  const remainingSnaps = [];
  for (const t of state.tamperedSnapshots) {
    try {
      await prisma.docPageSnapshot.update({
        where: { id: t.id },
        data: { content_text: t.originalContentText, content_hash: t.originalHash },
      });
      restoredSnaps += 1;
    } catch (e) {
      console.error(`  could not restore snapshot ${t.id}: ${e.message}`);
      remainingSnaps.push(t);
    }
  }
  state.tamperedSnapshots = remainingSnaps;

  // 2) Restore tampered project scripts
  let restoredProjs = 0;
  const remainingProjs = [];
  for (const t of state.tamperedProjects) {
    try {
      await prisma.project.update({
        where: { id: t.id },
        data: { script: t.originalScript },
      });
      restoredProjs += 1;
    } catch (e) {
      console.error(`  could not restore project ${t.id}: ${e.message}`);
      remainingProjs.push(t);
    }
  }
  state.tamperedProjects = remainingProjs;

  // 3) Delete pending edits + check runs since the test started.
  // Falls back to "last 24h" if no test was recorded.
  const since = state.lastTestStartedAt
    ? new Date(state.lastTestStartedAt)
    : new Date(Date.now() - 24 * 60 * 60 * 1000);

  const editsResult = await prisma.pendingScriptEdit.deleteMany({
    where: { project: { client_id: client.id }, detected_at: { gte: since } },
  });
  const runsResult = await prisma.checkRun.deleteMany({
    where: { client_id: client.id, started_at: { gte: since } },
  });

  state.lastTestStartedAt = null;
  saveState(state);

  console.log(`Restored ${restoredSnaps} tampered snapshot(s) and ${restoredProjs} project script(s).`);
  console.log(`Deleted ${editsResult.count} pending edit(s) and ${runsResult.count} check run(s) created since ${since.toISOString()}.`);
}

function usage() {
  console.log(`Usage:
  node scripts/test-monitoring.js status
  node scripts/test-monitoring.js trigger [--url <URL>]
  node scripts/test-monitoring.js simulate "<clientName|id>"
  node scripts/test-monitoring.js clear "<clientName|id>"`);
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : null;
  switch (command) {
    case 'status':
      await status();
      break;
    case 'trigger':
      await triggerCron();
      break;
    case 'simulate':
      if (!arg) { usage(); process.exit(1); }
      await simulate(arg);
      break;
    case 'clear':
      if (!arg) { usage(); process.exit(1); }
      await clearForClient(arg);
      break;
    default:
      usage();
      process.exit(1);
  }
}

main()
  .catch(async (e) => {
    console.error('❌', e.message);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
