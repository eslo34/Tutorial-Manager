#!/usr/bin/env node
/**
 * Test harness for the daily doc-monitoring cron.
 *
 *   node scripts/test-monitoring.js status                # what's currently in the DB
 *   node scripts/test-monitoring.js trigger               # fire the cron right now (read-only — won't detect changes unless docs really changed)
 *   node scripts/test-monitoring.js simulate "EandoX" [--project "name"]
 *                                                          # force-audit a project's current script against its best-matching live doc page.
 *                                                          # No injection — uses script + docs exactly as they are in the DB. Bypasses Haiku gate.
 *   node scripts/test-monitoring.js clear "EandoX"        # restore tampered snapshot (+ any tampered project scripts from older runs); delete test-produced edits & check runs
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

// Pair the project with the snapshot whose title shares the most words —
// Sonnet's audit bails out when the script's topic doesn't overlap with the
// doc page, so matching topics is essential for the test to produce edits.
function tokenizeTitle(title) {
  return new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3)
  );
}

function findBestSnapshot(snapshots, project) {
  const projWords = tokenizeTitle(project.title);
  let best = null;
  let bestScore = -1;
  for (const s of snapshots) {
    const sWords = tokenizeTitle(s.title);
    let score = 0;
    for (const w of projWords) if (sWords.has(w)) score += 1;
    // Tiny tie-breaker preferring longer content (richer doc).
    score += (s.content_text?.length || 0) / 1_000_000;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

async function simulate(clientKey) {
  const existing = loadState();
  if (existing.tamperedSnapshots.length > 0 || existing.tamperedProjects.length > 0) {
    throw new Error('Test state already exists. Run `clear` first (or manually delete scripts/.test-monitoring-state.json if you want to discard the backup without restoring).');
  }

  const client = await findClientByNameOrId(clientKey);

  // Pick the project. --project "exact title" if supplied; otherwise the
  // most-recently-updated project with a script (probably the one you just edited).
  const projectArgIdx = process.argv.indexOf('--project');
  const projectFilter = projectArgIdx !== -1 ? process.argv[projectArgIdx + 1] : null;

  const projects = await prisma.project.findMany({
    where: {
      client_id: client.id,
      script: { not: null },
      ...(projectFilter ? { title: projectFilter } : {}),
    },
    orderBy: { updated_at: 'desc' },
  });
  if (projects.length === 0) {
    throw new Error(
      projectFilter
        ? `No project matching "${projectFilter}" on ${client.name}.`
        : `No projects with scripts on ${client.name}. Generate at least one first.`
    );
  }
  const project = projects[0];

  // Match the project to its most topically-relevant doc page.
  const snapshots = await prisma.docPageSnapshot.findMany({ where: { client_id: client.id } });
  if (snapshots.length === 0) {
    throw new Error(`No snapshots for ${client.name} — run "Set up monitoring" first.`);
  }
  const snapshot = findBestSnapshot(snapshots, project);
  if (!snapshot) {
    throw new Error('Could not pick a snapshot for the test.');
  }

  // Save the original hash so clear() can restore it. We don't modify the
  // script or the snapshot's content — the audit will run against whatever
  // you already have in the DB.
  const state = {
    lastTestStartedAt: new Date().toISOString(),
    tamperedSnapshots: [{
      id: snapshot.id,
      url: snapshot.url,
      title: snapshot.title,
      originalHash: snapshot.content_hash,
      originalContentText: snapshot.content_text,
    }],
    tamperedProjects: [],
  };
  saveState(state);

  // Tamper ONLY the snapshot hash. The cron sees the hash mismatch → treats
  // this page as "changed" → with ?force=1 it routes straight to Sonnet,
  // which audits the unchanged real script against the unchanged real docs.
  await prisma.docPageSnapshot.update({
    where: { id: snapshot.id },
    data: { content_hash: 'TEST_FORCED_MISMATCH' },
  });

  console.log(`Auditing your current script against the live doc page:`);
  console.log(`  Project:  ${project.title}`);
  console.log(`  Snapshot: ${snapshot.title}`);
  console.log(`    (only the snapshot hash was tampered — script and doc content are untouched)\n`);
  console.log(`Triggering cron with ?force=1 (bypasses Haiku gate so Sonnet runs)…\n`);
  await triggerCron('force=1');
  console.log('\n──────────────────────────────────────────');
  console.log('Watch your inbox for the digest email.');
  console.log('When done, run:');
  console.log(`   node scripts/test-monitoring.js clear "${client.name}"`);
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
