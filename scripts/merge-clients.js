#!/usr/bin/env node
/**
 * One-off utility: merge one client's projects + learning data into another.
 *
 *   node scripts/merge-clients.js --source "<name|id>" --target "<name|id>"            (dry run)
 *   node scripts/merge-clients.js --source "<name|id>" --target "<name|id>" --execute  (apply)
 *
 * Reassigns all of SOURCE's projects and learning sessions to TARGET, and copies
 * SOURCE's scraped documentation onto TARGET only if TARGET has none. Does NOT
 * delete the source client — once you've verified the merge looks right, delete
 * the now-empty client from the UI.
 */
const fs = require('fs');
const path = require('path');

// Load DATABASE_URL from .env.local (falling back to .env)
let loadedFrom = null;
for (const f of ['.env.local', '.env']) {
  const p = path.join(__dirname, '..', f);
  if (!fs.existsSync(p)) continue;
  const m = fs.readFileSync(p, 'utf8').match(/^\s*DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
  if (m && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = m[1];
    loadedFrom = f;
  }
}
if (!process.env.DATABASE_URL) {
  console.error('Could not find DATABASE_URL in .env.local or .env');
  process.exit(1);
}

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
const SOURCE = arg('--source');
const TARGET = arg('--target');
const EXECUTE = process.argv.includes('--execute');

if (!SOURCE || !TARGET) {
  console.error('Usage: node scripts/merge-clients.js --source "<name|id>" --target "<name|id>" [--execute]');
  process.exit(1);
}

async function findClient(key) {
  const byId = await prisma.client.findUnique({ where: { id: key } }).catch(() => null);
  if (byId) return byId;
  const byName = await prisma.client.findMany({ where: { name: key } });
  if (byName.length === 0) throw new Error(`No client found matching "${key}"`);
  if (byName.length > 1) throw new Error(`Multiple clients named "${key}" — pass an id instead`);
  return byName[0];
}

async function main() {
  console.log(`(loaded DATABASE_URL from ${loadedFrom})`);

  const source = await findClient(SOURCE);
  const target = await findClient(TARGET);
  if (source.id === target.id) throw new Error('Source and target are the same client');

  const [srcProjects, tgtProjects, srcSessions, tgtSessions] = await Promise.all([
    prisma.project.count({ where: { client_id: source.id } }),
    prisma.project.count({ where: { client_id: target.id } }),
    prisma.learningSession.findMany({
      where: { client_id: source.id },
      include: { _count: { select: { chat_messages: true, tasks: true } } },
    }),
    prisma.learningSession.findMany({
      where: { client_id: target.id },
      include: { _count: { select: { chat_messages: true, tasks: true } } },
    }),
  ]);

  const willCopyDocs = !target.scraped_content && !!source.scraped_content;

  console.log(`\nMODE: ${EXECUTE ? 'EXECUTE' : 'DRY RUN'}\n`);
  console.log(`SOURCE  ${source.name}  (${source.id})`);
  console.log(`        ${srcProjects} projects | ${srcSessions.length} learning session(s) | docs: ${source.scraped_content ? source.scraped_chars + ' chars, ' + source.scraped_pages + ' pages' : 'none'}`);
  console.log(`TARGET  ${target.name}  (${target.id})`);
  console.log(`        ${tgtProjects} projects | ${tgtSessions.length} learning session(s) | docs: ${target.scraped_content ? target.scraped_chars + ' chars, ' + target.scraped_pages + ' pages' : 'none'}`);
  console.log('\nPLAN:');
  console.log(`  - Move ${srcProjects} project(s) onto "${target.name}" (it will then have ${srcProjects + tgtProjects})`);
  if (srcSessions.length === 0) {
    console.log('  - No learning sessions on source to move');
  } else if (tgtSessions.length === 0) {
    console.log(`  - Move ${srcSessions.length} learning session(s) onto "${target.name}"`);
  } else {
    console.log('  - NOTE: both clients have a learning session; source chat history + tasks will be');
    console.log(`    merged into target's session (${tgtSessions[0].id}), then the empty source session removed`);
    srcSessions.forEach((s) => console.log(`      source session ${s.id}: ${s._count.chat_messages} msgs, ${s._count.tasks} tasks`));
    tgtSessions.forEach((s) => console.log(`      target session ${s.id}: ${s._count.chat_messages} msgs, ${s._count.tasks} tasks`));
  }
  console.log(`  - ${willCopyDocs ? 'Copy scraped docs onto target (' + source.scraped_chars + ' chars)' : 'Leave target docs as-is (target already has docs, or source has none)'}`);
  console.log(`  - Leave "${source.name}" EMPTY — delete it yourself from the UI once verified`);
  console.log('');

  if (!EXECUTE) {
    console.log('Dry run only. Re-run with --execute to apply.');
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.project.updateMany({ where: { client_id: source.id }, data: { client_id: target.id } });

    if (srcSessions.length) {
      if (tgtSessions.length === 0) {
        await tx.learningSession.updateMany({ where: { client_id: source.id }, data: { client_id: target.id } });
      } else {
        const keep = tgtSessions[0].id;
        for (const s of srcSessions) {
          await tx.learningChatMessage.updateMany({ where: { learning_session_id: s.id }, data: { learning_session_id: keep } });
          await tx.learningTask.updateMany({ where: { learning_session_id: s.id }, data: { learning_session_id: keep } });
          // progress rows are derived; drop source's to avoid unique([session, category]) conflicts
          await tx.learningProgress.deleteMany({ where: { learning_session_id: s.id } });
          await tx.learningSession.delete({ where: { id: s.id } });
        }
      }
    }

    if (willCopyDocs) {
      await tx.client.update({
        where: { id: target.id },
        data: {
          scraped_content: source.scraped_content,
          scraped_pages: source.scraped_pages,
          scraped_chars: source.scraped_chars,
          scraped_words: source.scraped_words,
          scraped_url: source.scraped_url,
          scraped_at: source.scraped_at,
        },
      });
    }
  });

  console.log(`✅ Merge complete. "${source.name}" is now empty — delete it from the UI when ready.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌', e.message);
  await prisma.$disconnect();
  process.exit(1);
});
