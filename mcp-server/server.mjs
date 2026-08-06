#!/usr/bin/env node
// Local MCP server for the Tutorial Manager.
//
// It connects Claude Code straight to the same Neon database the app uses
// (via the generated Prisma client) so scripts can be read and edited without
// going through the in-app Anthropic chat. Runs only on your machine, started
// by Claude Code over stdio — it is never deployed to Vercel.

import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import prismaPkg from "../lib/generated/prisma/index.js";
const { PrismaClient } = prismaPkg;

// Shared with the Next app (app/api/clients/video-list) — same normalizer, same
// merge rules, so a list imported here and one edited in the UI cannot drift.
import { normalizeList, mergeTicks, listStats } from "../lib/video-list.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const backupDir = join(__dirname, "backups");

// --- Load DATABASE_URL from the repo's .env.local / .env (no extra deps) -----
function loadEnv() {
  for (const fname of [".env.local", ".env"]) {
    const p = join(repoRoot, fname);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const key = m[1];
      const val = m[2].replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  }
}
loadEnv();

if (!process.env.DATABASE_URL) {
  console.error("[tutorial-scripts-mcp] DATABASE_URL not found in .env.local/.env");
  process.exit(1);
}

const prisma = new PrismaClient();

// --- Helpers -----------------------------------------------------------------
function ok(payload) {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}
function fail(message) {
  return { content: [{ type: "text", text: `ERROR: ${message}` }], isError: true };
}

// Resolve a project by exact id, else by case-insensitive title match.
async function findProject(ref) {
  let project = await prisma.project.findUnique({
    where: { id: ref },
    include: { client: { select: { name: true, company: true } } },
  });
  if (project) return project;

  const matches = await prisma.project.findMany({
    where: { title: { contains: ref, mode: "insensitive" } },
    include: { client: { select: { name: true, company: true } } },
    take: 5,
  });
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new Error(
      `"${ref}" matched ${matches.length} projects. Use the exact id. Candidates: ` +
        matches.map((p) => `${p.title} (${p.id})`).join("; ")
    );
  }
  return null;
}

// Resolve a client by exact id, else by case-insensitive name/company match.
async function findClient(ref) {
  const client = await prisma.client.findUnique({ where: { id: ref } });
  if (client) return client;

  const matches = await prisma.client.findMany({
    where: {
      OR: [
        { name: { contains: ref, mode: "insensitive" } },
        { company: { contains: ref, mode: "insensitive" } },
      ],
    },
    take: 5,
  });
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new Error(
      `"${ref}" matched ${matches.length} clients. Use the exact id. Candidates: ` +
        matches.map((c) => `${c.name} (${c.id})`).join("; ")
    );
  }
  return null;
}

// --- Tool definitions --------------------------------------------------------
const TOOLS = [
  {
    name: "list_projects",
    description:
      "List video-script projects with their id, title, client, status and whether a script exists. Optionally filter by client name/company or status.",
    inputSchema: {
      type: "object",
      properties: {
        client: { type: "string", description: "Filter by client name or company (substring, case-insensitive)." },
        status: { type: "string", description: "Filter by exact status, e.g. 'completed', 'planning'." },
      },
    },
  },
  {
    name: "get_script",
    description:
      "Return the full video script and metadata for one project. 'project' may be a project id or a title (substring).",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string", description: "Project id or title." },
      },
      required: ["project"],
    },
  },
  {
    name: "update_script",
    description:
      "Replace a project's video script with new content. Backs up the previous script to disk first. Requires the exact project id to avoid ambiguity.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string", description: "Exact project id (from list_projects)." },
        script: { type: "string", description: "The new, complete script content." },
        status: { type: "string", description: "Optional new status, e.g. 'completed'." },
      },
      required: ["project_id", "script"],
    },
  },
  {
    name: "search_scripts",
    description:
      "Search across all project scripts for a text query (case-insensitive). Returns matching projects with a short snippet around the first match.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Text to search for inside scripts." },
      },
      required: ["query"],
    },
  },
  {
    name: "list_clients",
    description:
      "List all clients with their id, name, company, video count and whether they have an internal video list.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_video_list",
    description:
      "Return a client's internal video list — the planning checklist shown behind the 'Video list' button on their page. 'client' may be a client id, name or company.",
    inputSchema: {
      type: "object",
      properties: {
        client: { type: "string", description: "Client id, name or company." },
      },
      required: ["client"],
    },
  },
  {
    name: "set_video_list",
    description:
      "Write a client's internal video list. Use this to import a VIDEO-LIST.md (or any planning doc) into the app: read the file, split it into groups (tracks/categories) of videos, and pass them here. Field names are forgiving — a group takes name + items, an item takes title plus optional code, meta (type/length) and note (what it covers). By default this MERGES: existing checkmarks survive rows being rewritten, and a tick is never cleared by an import.",
    inputSchema: {
      type: "object",
      properties: {
        client: { type: "string", description: "Client id, name or company." },
        groups: {
          type: "array",
          description:
            "The list, as groups of videos: [{ name, note?, items: [{ code?, title, meta?, note?, done? }] }].",
          items: { type: "object" },
        },
        source: {
          type: "string",
          description: "Where this came from, shown in the UI, e.g. 'Clients/Prodikt/VIDEO-LIST.md'.",
        },
        mode: {
          type: "string",
          enum: ["merge", "replace"],
          description:
            "merge (default) keeps existing checkmarks; replace discards them and takes the incoming done flags verbatim.",
        },
      },
      required: ["client", "groups"],
    },
  },
];

// --- Tool handlers -----------------------------------------------------------
async function handleListProjects(args) {
  const where = {};
  if (args.status) where.status = args.status;
  if (args.client) {
    where.client = {
      OR: [
        { name: { contains: args.client, mode: "insensitive" } },
        { company: { contains: args.client, mode: "insensitive" } },
      ],
    };
  }
  const projects = await prisma.project.findMany({
    where,
    orderBy: { updated_at: "desc" },
    include: { client: { select: { name: true, company: true } } },
  });
  return ok(
    projects.map((p) => ({
      id: p.id,
      title: p.title,
      client: p.client?.name ?? null,
      company: p.client?.company ?? null,
      status: p.status,
      source_type: p.source_type,
      has_script: !!p.script,
      script_chars: p.script?.length ?? 0,
      updated_at: p.updated_at,
    }))
  );
}

async function handleGetScript(args) {
  const p = await findProject(args.project);
  if (!p) return fail(`No project found for "${args.project}".`);
  return ok({
    id: p.id,
    title: p.title,
    client: p.client?.name ?? null,
    status: p.status,
    source_type: p.source_type,
    video_type: p.video_type,
    updated_at: p.updated_at,
    script: p.script ?? "",
  });
}

async function handleUpdateScript(args) {
  const p = await prisma.project.findUnique({ where: { id: args.project_id } });
  if (!p) return fail(`No project with id "${args.project_id}".`);

  // Back up the previous script before overwriting.
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = join(backupDir, `${p.id}-${stamp}.txt`);
  writeFileSync(backupPath, p.script ?? "", "utf8");

  const data = { script: args.script };
  if (args.status) data.status = args.status;
  const updated = await prisma.project.update({ where: { id: p.id }, data });

  return ok({
    updated: true,
    id: updated.id,
    title: updated.title,
    status: updated.status,
    new_script_chars: updated.script?.length ?? 0,
    previous_backed_up_to: backupPath,
  });
}

async function handleSearchScripts(args) {
  const matches = await prisma.project.findMany({
    where: { script: { contains: args.query, mode: "insensitive" } },
    include: { client: { select: { name: true } } },
    orderBy: { updated_at: "desc" },
  });
  return ok(
    matches.map((p) => {
      const idx = (p.script ?? "").toLowerCase().indexOf(args.query.toLowerCase());
      const start = Math.max(0, idx - 60);
      const snippet = (p.script ?? "").slice(start, idx + args.query.length + 60);
      return {
        id: p.id,
        title: p.title,
        client: p.client?.name ?? null,
        snippet: (start > 0 ? "…" : "") + snippet + "…",
      };
    })
  );
}

async function handleListClients() {
  const clients = await prisma.client.findMany({
    orderBy: { created_at: "asc" },
    include: { _count: { select: { projects: true } } },
  });
  return ok(
    clients.map((c) => {
      const stats = listStats(c.video_list);
      return {
        id: c.id,
        name: c.name,
        company: c.company,
        videos: c._count.projects,
        video_list: c.video_list
          ? { groups: stats.groups, items: stats.items, done: stats.done, source: c.video_list.source || null }
          : null,
      };
    })
  );
}

async function handleGetVideoList(args) {
  const c = await findClient(args.client);
  if (!c) return fail(`No client found for "${args.client}".`);
  if (!c.video_list) {
    return ok({ client: c.name, client_id: c.id, list: null, note: "This client has no video list yet." });
  }
  return ok({ client: c.name, client_id: c.id, stats: listStats(c.video_list), list: c.video_list });
}

async function handleSetVideoList(args) {
  const c = await findClient(args.client);
  if (!c) return fail(`No client found for "${args.client}".`);

  const { source, groups, truncated } = normalizeList({ source: args.source, groups: args.groups });
  if (groups.length === 0) {
    return fail("Nothing usable in `groups`. Expected [{ name, items: [{ title, … }] }].");
  }

  const mode = args.mode === "replace" ? "replace" : "merge";
  let finalGroups = groups;
  let merge = null;
  if (mode === "merge") {
    const result = mergeTicks(groups, c.video_list);
    finalGroups = result.groups;
    merge = { checks_kept: result.kept, new_items: result.added, items_no_longer_listed: result.removed };
  }

  // Back up the previous list before overwriting, the same way update_script
  // does — an import that mangles the shape should never be unrecoverable.
  if (c.video_list) {
    if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    writeFileSync(
      join(backupDir, `${c.id}-videolist-${stamp}.json`),
      JSON.stringify(c.video_list, null, 2),
      "utf8"
    );
  }

  const saved = {
    source: source || c.video_list?.source || "",
    updatedAt: new Date().toISOString(),
    groups: finalGroups,
  };
  await prisma.client.update({ where: { id: c.id }, data: { video_list: saved } });

  return ok({
    updated: true,
    client: c.name,
    client_id: c.id,
    mode,
    stats: listStats(saved),
    merge,
    truncated: truncated || undefined,
  });
}

// --- Wire up the server ------------------------------------------------------
const server = new Server(
  { name: "tutorial-scripts", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  try {
    switch (name) {
      case "list_projects":
        return await handleListProjects(args);
      case "get_script":
        return await handleGetScript(args);
      case "update_script":
        return await handleUpdateScript(args);
      case "search_scripts":
        return await handleSearchScripts(args);
      case "list_clients":
        return await handleListClients(args);
      case "get_video_list":
        return await handleGetVideoList(args);
      case "set_video_list":
        return await handleSetVideoList(args);
      default:
        return fail(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return fail(err?.message ?? String(err));
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[tutorial-scripts-mcp] ready");
