export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: string[];
}

export interface CrawlResponse {
  success: boolean;
  pages: CrawlResult[];
  totalPages: number;
  totalContent?: string;
  error?: string;
}

export async function crawlDocumentation(
  startUrl: string, 
  maxPages: number = 50
): Promise<CrawlResponse> {
  try {
    const response = await fetch('/api/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startUrl,
        maxPages
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.pages) {
      result.totalContent = aggregateContent(result);
    }
    
    return result;
  } catch (error) {
    console.error('Crawler error:', error);
    return {
      success: false,
      pages: [],
      totalPages: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function extractDocumentationUrls(crawlResult: CrawlResponse): string[] {
  return crawlResult.pages.map(page => page.url);
}

export function aggregateContent(crawlResult: CrawlResponse): string {
  return crawlResult.pages
    .map(page => `=== ${page.title} ===\nURL: ${page.url}\n\n${page.content}`)
    .join('\n\n' + '='.repeat(80) + '\n\n');
}

export function getContentSummary(crawlResult: CrawlResponse): {
  totalPages: number;
  totalCharacters: number;
  totalWords: number;
  averagePageLength: number;
  pagesByLength: Array<{title: string; url: string; length: number}>;
} {
  const pages = crawlResult.pages;
  const totalCharacters = pages.reduce((sum, page) => sum + page.content.length, 0);
  const totalWords = pages.reduce((sum, page) => sum + page.content.split(/\s+/).length, 0);
  
  return {
    totalPages: pages.length,
    totalCharacters,
    totalWords,
    averagePageLength: Math.round(totalCharacters / pages.length) || 0,
    pagesByLength: pages
      .map(page => ({
        title: page.title,
        url: page.url,
        length: page.content.length
      }))
      .sort((a, b) => b.length - a.length)
  };
}

export function formatContentForAI(crawlResult: CrawlResponse, prompt: string, userRequest: string): string {
  const summary = getContentSummary(crawlResult);
  
  return `${prompt}

User request: ${userRequest}

Documentation: ${aggregateContent(crawlResult)}`;
} 