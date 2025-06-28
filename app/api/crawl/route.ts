import { NextRequest, NextResponse } from 'next/server';

interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: string[];
}

interface CrawlResponse {
  success: boolean;
  pages: CrawlResult[];
  totalPages: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { startUrl, maxPages = 50 } = await request.json();
    
    if (!startUrl) {
      return NextResponse.json({ error: 'Start URL is required' }, { status: 400 });
    }

    const baseDomain = new URL(startUrl).origin;
    const startUrlObj = new URL(startUrl);
    
    // More flexible base path detection
    const getDocumentationBasePath = (url: string): string => {
      const path = new URL(url).pathname;
      // Look for common documentation patterns in the path
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
        // Find the first documentation segment and use everything up to it
        const firstDocSegment = docSegments[0];
        const segmentIndex = path.indexOf(firstDocSegment);
        return path.substring(0, segmentIndex + firstDocSegment.length);
      }
      
      // Fallback: use the path up to the second-to-last segment
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 1) {
        return '/' + segments.slice(0, -1).join('/');
      }
      
      return path;
    };

    const baseDocPath = getDocumentationBasePath(startUrl);
    
    const results: CrawlResult[] = [];
    const visited = new Set<string>();
    const toVisit = [startUrl];

    // Function to check if URL is likely documentation
    const isDocumentationUrl = (url: string): boolean => {
      try {
        const urlObj = new URL(url);
        const urlPath = urlObj.pathname.toLowerCase();
        
        // Must be from the same domain
        if (urlObj.origin !== baseDomain) {
          return false;
        }
        
        // Must be under the documentation base path (more flexible)
        if (!urlPath.startsWith(baseDocPath.toLowerCase())) {
          return false;
        }
        
        // Exclude common non-documentation files
        const excludePatterns = [
          '.pdf', '.zip', '.tar', '.gz', '.exe', '.dmg',
          '/search', '/login', '/logout', '/signup', '/register',
          '/contact', '/about', '/privacy', '/terms',
          '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg',
          '#', 'javascript:', 'mailto:', 'tel:'
        ];
        
        if (excludePatterns.some(pattern => url.toLowerCase().includes(pattern))) {
          return false;
        }
        
        return true;
      } catch (error) {
        return false;
      }
    };

    // Enhanced content extraction
    const extractContent = (html: string): { title: string; content: string } => {
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      let title = titleMatch ? titleMatch[1].trim() : 'No Title';
      
      // Clean up title (remove site name suffixes)
      title = title.replace(/\s*[\|\-\–]\s*.*$/, '').trim();
      if (!title) title = 'No Title';

      // Remove scripts, styles, and navigation elements
      let cleanHtml = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
        .replace(/<div[^>]*class="[^"]*(?:nav|menu|sidebar|breadcrumb|pagination)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');

      // Try to extract main content area first
      const mainContentPatterns = [
        /<main[^>]*>([\s\S]*?)<\/main>/i,
        /<article[^>]*>([\s\S]*?)<\/article>/i,
        /<div[^>]*class="[^"]*(?:content|documentation|docs|main)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*id="[^"]*(?:content|documentation|docs|main)[^"]*"[^>]*>([\s\S]*?)<\/div>/i
      ];

      let contentHtml = cleanHtml;
      for (const pattern of mainContentPatterns) {
        const match = cleanHtml.match(pattern);
        if (match && match[1].trim().length > 100) {
          contentHtml = match[1];
          break;
        }
      }

      // Extract text content and clean it up
      const textContent = contentHtml
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      return { title, content: textContent };
    };

    // Enhanced link extraction
    const extractLinks = (html: string, currentUrl: string): string[] => {
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
      const links: string[] = [];
      let match;

      while ((match = linkRegex.exec(html)) !== null) {
        try {
          let href = match[1].trim();
          
          // Skip empty hrefs and fragments
          if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            continue;
          }
          
          // Convert relative URLs to absolute
          let fullUrl: string;
          if (href.startsWith('http://') || href.startsWith('https://')) {
            fullUrl = href;
          } else if (href.startsWith('/')) {
            fullUrl = baseDomain + href;
          } else if (href.startsWith('./') || href.startsWith('../')) {
            fullUrl = new URL(href, currentUrl).href;
          } else if (!href.includes('://')) {
            // Relative path
            fullUrl = new URL(href, currentUrl).href;
          } else {
            continue;
          }

          // Clean URL (remove fragments and certain query params)
          const cleanUrl = fullUrl.split('#')[0];
          
          // Only include documentation URLs
          if (isDocumentationUrl(cleanUrl)) {
            links.push(cleanUrl);
          }
        } catch (error) {
          // Skip invalid URLs
          continue;
        }
      }

      return Array.from(new Set(links)); // Remove duplicates
    };

    console.log(`Starting crawl from: ${startUrl}`);
    console.log(`Base domain: ${baseDomain}`);
    console.log(`Documentation base path: ${baseDocPath}`);

    while (toVisit.length > 0 && results.length < maxPages) {
      const currentUrl = toVisit.shift()!;
      
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      try {
        console.log(`Crawling: ${currentUrl}`);
        
        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });

        if (!response.ok) {
          console.log(`Failed to fetch ${currentUrl}: ${response.status} ${response.statusText}`);
          continue;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/html')) {
          console.log(`Skipping non-HTML content: ${currentUrl}`);
          continue;
        }

        const html = await response.text();
        
        if (html.length < 100) {
          console.log(`Skipping page with minimal content: ${currentUrl}`);
          continue;
        }

        const { title, content } = extractContent(html);
        const links = extractLinks(html, currentUrl);

        // Only store pages with meaningful content
        if (content.length > 50) {
          results.push({
            url: currentUrl,
            title,
            content,
            links
          });

          console.log(`✓ Crawled: ${title} (${content.length} chars, ${links.length} links found)`);
        }

        // Add new links to visit queue
        for (const link of links) {
          if (!visited.has(link) && !toVisit.includes(link)) {
            toVisit.push(link);
          }
        }

        // Rate limiting - be respectful
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error crawling ${currentUrl}:`, error);
        continue;
      }
    }

    console.log(`Crawling completed. Found ${results.length} pages.`);

    const response: CrawlResponse = {
      success: true,
      pages: results,
      totalPages: results.length
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Crawling error:', error);
    return NextResponse.json({
      success: false,
      pages: [],
      totalPages: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 