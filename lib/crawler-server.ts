import { createHash } from 'node:crypto';

export interface CrawlPage {
  url: string;
  title: string;
  content: string;
  links: string[];
}

export const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

// Find a sensible "base path" for the docs section so we don't wander out into
// unrelated pages on the same domain. Looks for path segments containing words
// like "doc" / "guide" / "api" etc., else falls back to one segment up.
export function getDocumentationBasePath(startUrl: string): string {
  const path = new URL(startUrl).pathname;
  const docSegments = path.split('/').filter(segment =>
    segment && (
      segment.includes('doc') ||
      segment.includes('guide') ||
      segment.includes('api') ||
      segment.includes('help') ||
      segment.includes('manual') ||
      segment.includes('reference')
    )
  );
  if (docSegments.length > 0) {
    const firstDocSegment = docSegments[0];
    const segmentIndex = path.indexOf(firstDocSegment);
    return path.substring(0, segmentIndex + firstDocSegment.length);
  }
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 1) {
    return '/' + segments.slice(0, -1).join('/');
  }
  return path;
}

export function isDocumentationUrl(url: string, baseDomain: string, baseDocPath: string): boolean {
  try {
    const urlObj = new URL(url);
    const urlPath = urlObj.pathname.toLowerCase();
    if (urlObj.origin !== baseDomain) return false;
    if (!urlPath.startsWith(baseDocPath.toLowerCase())) return false;
    const excludePatterns = [
      '.pdf', '.zip', '.tar', '.gz', '.exe', '.dmg',
      '/search', '/login', '/logout', '/signup', '/register',
      '/contact', '/about', '/privacy', '/terms',
      '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg',
      '#', 'javascript:', 'mailto:', 'tel:',
    ];
    if (excludePatterns.some(pattern => url.toLowerCase().includes(pattern))) return false;
    return true;
  } catch {
    return false;
  }
}

export function extractContent(html: string): { title: string; content: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : 'No Title';
  title = title.replace(/\s*[\|\-\–]\s*.*$/, '').trim();
  if (!title) title = 'No Title';

  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<div[^>]*class="[^"]*(?:nav|menu|sidebar|breadcrumb|pagination)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const mainContentPatterns = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*(?:content|documentation|docs|main)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="[^"]*(?:content|documentation|docs|main)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];
  let contentHtml = cleanHtml;
  for (const pattern of mainContentPatterns) {
    const match = cleanHtml.match(pattern);
    if (match && match[1].trim().length > 100) {
      contentHtml = match[1];
      break;
    }
  }

  const textContent = contentHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  return { title, content: textContent };
}

export function extractLinks(html: string, currentUrl: string, baseDomain: string, baseDocPath: string): string[] {
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  const links: string[] = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const href = match[1].trim();
      if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }
      let fullUrl: string;
      if (href.startsWith('http://') || href.startsWith('https://')) {
        fullUrl = href;
      } else if (href.startsWith('/')) {
        fullUrl = baseDomain + href;
      } else if (href.startsWith('./') || href.startsWith('../')) {
        fullUrl = new URL(href, currentUrl).href;
      } else if (!href.includes('://')) {
        fullUrl = new URL(href, currentUrl).href;
      } else {
        continue;
      }
      const cleanUrl = fullUrl.split('#')[0];
      if (isDocumentationUrl(cleanUrl, baseDomain, baseDocPath)) {
        links.push(cleanUrl);
      }
    } catch {
      continue;
    }
  }
  return Array.from(new Set(links));
}

export async function fetchPage(url: string, baseDomain: string, baseDocPath: string): Promise<CrawlPage | null> {
  try {
    const response = await fetch(url, {
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      console.log(`Skipping non-HTML content: ${url}`);
      return null;
    }
    const html = await response.text();
    if (html.length < 100) {
      console.log(`Skipping page with minimal content: ${url}`);
      return null;
    }
    const { title, content } = extractContent(html);
    const links = extractLinks(html, url, baseDomain, baseDocPath);
    console.log(`✓ Crawled: ${title} (${content.length} chars, ${links.length} links found)`);
    return { url, title, content, links };
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    return null;
  }
}

const CRAWL_CONCURRENCY = 8;

// BFS crawl from startUrl, restricted to the docs base path. Used by both the
// interactive /api/crawl route and the cron monitoring setup.
export async function crawlSite(startUrl: string, maxPages = 50): Promise<CrawlPage[]> {
  const baseDomain = new URL(startUrl).origin;
  const baseDocPath = getDocumentationBasePath(startUrl);
  const results: CrawlPage[] = [];
  const visited = new Set<string>();
  const toVisit: string[] = [startUrl];

  while (toVisit.length > 0 && results.length < maxPages) {
    const batch: string[] = [];
    while (batch.length < CRAWL_CONCURRENCY && toVisit.length > 0) {
      const url = toVisit.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);
      batch.push(url);
    }
    if (batch.length === 0) break;

    const batchResults = await Promise.all(batch.map(u => fetchPage(u, baseDomain, baseDocPath)));
    for (const page of batchResults) {
      if (!page) continue;
      if (page.content.length > 50 && results.length < maxPages) {
        results.push(page);
      }
      for (const link of page.links) {
        if (!visited.has(link) && !toVisit.includes(link)) {
          toVisit.push(link);
        }
      }
    }
  }

  return results;
}

// Fetch a single known URL (used by the cron when re-checking a watched page —
// we don't care about discovering new links, just whether this page changed).
export async function refetchUrl(url: string): Promise<CrawlPage | null> {
  const baseDomain = new URL(url).origin;
  // Pass an empty baseDocPath so link extraction is permissive; the caller
  // discards the links anyway.
  return fetchPage(url, baseDomain, '');
}

// Cheap content fingerprint for "did anything change?". Normalize whitespace
// before hashing so trivial formatting differences don't trigger false alarms.
export function hashContent(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(normalized).digest('hex');
}

// Paragraph-level diff used as input to the Haiku "is this change meaningful?"
// gate. Returns a compact +/- block format. If too large, falls back to a
// sentinel plus the truncated new content so the AI still has something to
// chew on without exploding the prompt.
export function diffParagraphs(oldText: string, newText: string, maxChars = 3000): string {
  const split = (s: string) => s.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
  const oldParas = split(oldText);
  const newParas = split(newText);
  const oldSet = new Set(oldParas);
  const newSet = new Set(newParas);

  const removed = oldParas.filter(p => !newSet.has(p));
  const added = newParas.filter(p => !oldSet.has(p));

  if (removed.length === 0 && added.length === 0) {
    return '(no paragraph-level differences detected — likely whitespace-only)';
  }

  const parts: string[] = [];
  for (const p of removed) parts.push(`- ${p}`);
  for (const p of added) parts.push(`+ ${p}`);
  const diff = parts.join('\n\n');

  if (diff.length > maxChars) {
    return `(page changed substantially — ${removed.length} paragraphs removed, ${added.length} added)\n\nFULL NEW CONTENT:\n${newText.slice(0, maxChars)}`;
  }
  return diff;
}
