// Shared helpers for the code-repo upload flow. Pure TS (no Node/browser-only
// APIs) so the same filtering rules run client-side (deciding what to upload)
// and server-side (a safety net before persisting).

// Directories whose contents are never useful for understanding a product's
// behaviour — dependencies, build output, VCS internals, caches.
export const SKIP_DIR_SEGMENTS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage',
  '.turbo', '.cache', '.vercel', '.idea', '.vscode', 'vendor', '__pycache__',
  '.venv', 'venv', 'target', 'bin', 'obj', '.gradle', 'Pods', 'DerivedData',
]);

// Filenames that are noise (lockfiles, minified bundles, env secrets).
export const SKIP_FILENAMES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb',
  'composer.lock', 'Cargo.lock', 'poetry.lock', 'Gemfile.lock',
  '.ds_store', 'thumbs.db',
]);

// Text/code extensions worth sending to the model. Anything else (images,
// fonts, binaries, archives) is skipped.
export const TEXT_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'md', 'mdx', 'txt',
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'kts', 'swift', 'c', 'h', 'cpp',
  'hpp', 'cc', 'cs', 'php', 'scala', 'sh', 'bash', 'zsh', 'sql', 'graphql',
  'gql', 'prisma', 'proto', 'html', 'htm', 'css', 'scss', 'sass', 'less',
  'vue', 'svelte', 'astro', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
  'env', 'xml', 'gradle', 'dockerfile', 'gitignore', 'lua', 'r', 'dart',
  'ex', 'exs', 'erl', 'clj', 'vim', 'el',
]);

// Per-file and aggregate caps. Individual giant files (generated data,
// huge JSON fixtures) blow context budget for little signal, so they're cut.
export const MAX_FILE_BYTES = 120_000;       // ~120 KB per file
export const MAX_TOTAL_FILES = 4000;
export const MAX_TOTAL_BYTES = 30_000_000;   // ~30 MB of source across the repo

function lastSegment(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || '';
}

function extensionOf(filename: string): string {
  // Files like "Dockerfile" / ".gitignore" have no dot-extension; treat the
  // whole (lowercased) name as the key so they can still be allow-listed.
  const name = filename.toLowerCase();
  if (!name.includes('.') || name.startsWith('.')) {
    return name.replace(/^\./, '');
  }
  return name.slice(name.lastIndexOf('.') + 1);
}

// Decide whether a single path/size should be ingested. Used client-side while
// reading a folder/zip, and again server-side as a guard.
export function shouldIncludeFile(path: string, size: number): boolean {
  const segments = path.split(/[\\/]/);
  if (segments.some((seg) => SKIP_DIR_SEGMENTS.has(seg))) return false;

  const filename = lastSegment(path).toLowerCase();
  if (!filename) return false;
  if (SKIP_FILENAMES.has(filename)) return false;
  if (filename.endsWith('.min.js') || filename.endsWith('.min.css')) return false;
  if (filename.endsWith('.map')) return false;

  if (size > MAX_FILE_BYTES) return false;

  const ext = extensionOf(filename);
  return TEXT_EXTENSIONS.has(ext);
}

// Normalize a path for storage: forward slashes, no leading "./" or "/".
export function normalizeRepoPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\.?\//, '');
}
