// Minimal READ-ONLY GitHub REST client for the repo-release-notes update flow.
//
// Auth: a fine-grained PAT with `Contents: Read` on the watched repo. This module
// is strictly read-only — it only ever performs GET requests (branch head, commit
// compare, file contents). It never writes, pushes, creates releases, or mutates
// the repo in any way.
//
// PER-REPO TOKENS. A fine-grained PAT is tied to ONE owner, and two repos under the
// same owner can even need DIFFERENT tokens (e.g. bimobject/bim-dictionary and
// bimobject/prodikt.prodikt-public-docs are scoped to separate PATs). So the token
// is resolved most-specific-first, per (owner, name):
//   GITHUB_RELEASE_TOKEN_<OWNER>_<NAME>   ← one repo
//   GITHUB_RELEASE_TOKEN_<OWNER>          ← every repo of an owner
//   GITHUB_RELEASE_TOKEN                  ← global fallback
// (owner/name upper-cased, every run of non-alphanumerics collapsed to "_".)

const API = 'https://api.github.com';

function envKey(...parts: string[]): string {
  return 'GITHUB_RELEASE_TOKEN_' + parts.map((p) => p.toUpperCase().replace(/[^A-Z0-9]+/g, '_')).join('_');
}

function tokenFor(owner: string, name: string): string {
  const candidates = [envKey(owner, name), envKey(owner)];
  for (const key of candidates) {
    const v = process.env[key];
    if (v) return v;
  }
  const t = process.env.GITHUB_RELEASE_TOKEN;
  if (!t) {
    throw new Error(`No GitHub token for ${owner}/${name} — set ${candidates[0]} or GITHUB_RELEASE_TOKEN`);
  }
  return t;
}

function headers(tok: string, accept = 'application/vnd.github+json'): Record<string, string> {
  return {
    Authorization: `Bearer ${tok}`,
    Accept: accept,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'tutorial-manager-release-watch',
  };
}

async function ghGet(url: string, tok: string, accept?: string): Promise<Response> {
  const res = await fetch(url, { headers: headers(tok, accept), cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const path = url.replace(API, '');
    throw new Error(`GitHub ${res.status} for ${path}: ${body.slice(0, 300)}`);
  }
  return res;
}

export interface ChangedFile {
  filename: string;
  status: string; // added | modified | removed | renamed | changed
  additions: number;
  deletions: number;
  patch?: string; // unified-diff hunks; absent for binary or very large files
  previous_filename?: string;
}

export interface CompareResult {
  status: string; // ahead | behind | identical | diverged
  ahead_by: number;
  behind_by: number;
  head_sha: string;
  files: ChangedFile[];
  commits: Array<{ sha: string; message: string; date: string }>;
  truncatedFiles: boolean; // GitHub caps files[] at 300
}

// Current HEAD sha of a branch (or any ref).
export async function getBranchHeadSha(
  owner: string,
  name: string,
  branch: string
): Promise<string> {
  const res = await ghGet(
    `${API}/repos/${owner}/${name}/commits/${encodeURIComponent(branch)}`,
    tokenFor(owner, name)
  );
  const data = (await res.json()) as { sha: string };
  return data.sha;
}

// Compare base…head. Returns the changed files (each with its per-file patch)
// and the commits in between. GitHub caps this at 250 commits / 300 files per
// response — never hit on a daily poll, but we surface `truncatedFiles` so the
// caller can log if it ever is (e.g. a huge first-run backfill).
export async function compareCommits(
  owner: string,
  name: string,
  base: string,
  head: string
): Promise<CompareResult> {
  const res = await ghGet(
    `${API}/repos/${owner}/${name}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}?per_page=100`,
    tokenFor(owner, name)
  );
  const data = (await res.json()) as {
    status: string;
    ahead_by: number;
    behind_by: number;
    commits?: Array<{ sha: string; commit: { message: string; author?: { date?: string } } }>;
    files?: ChangedFile[];
  };
  const files = data.files ?? [];
  return {
    status: data.status,
    ahead_by: data.ahead_by,
    behind_by: data.behind_by,
    head_sha: head,
    files,
    commits: (data.commits ?? []).map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      date: c.commit.author?.date ?? '',
    })),
    truncatedFiles: files.length >= 300,
  };
}

// Raw text content of a file at a given ref (sha or branch). Uses the contents
// API with the raw media type so we get the file body directly.
export async function getFileContent(
  owner: string,
  name: string,
  path: string,
  ref: string
): Promise<string> {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const res = await ghGet(
    `${API}/repos/${owner}/${name}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`,
    tokenFor(owner, name),
    'application/vnd.github.raw'
  );
  return res.text();
}

// A browsable blob URL for a file at a ref — used as the pending edit's
// source_url and as the "Source" link in the digest email.
export function blobUrl(owner: string, name: string, ref: string, path: string): string {
  return `https://github.com/${owner}/${name}/blob/${ref}/${path}`;
}
