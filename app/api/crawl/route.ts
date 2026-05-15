import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { crawlSite, type CrawlPage } from '@/lib/crawler-server';

export const maxDuration = 60;

interface CrawlResponse {
  success: boolean;
  pages: CrawlPage[];
  totalPages: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startUrl, maxPages = 50 } = await request.json();
    if (!startUrl) {
      return NextResponse.json({ error: 'Start URL is required' }, { status: 400 });
    }

    console.log(`Starting crawl from: ${startUrl}`);
    const pages = await crawlSite(startUrl, maxPages);
    console.log(`Crawling completed. Found ${pages.length} pages.`);

    const response: CrawlResponse = {
      success: true,
      pages,
      totalPages: pages.length,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Crawling error:', error);
    return NextResponse.json({
      success: false,
      pages: [],
      totalPages: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
