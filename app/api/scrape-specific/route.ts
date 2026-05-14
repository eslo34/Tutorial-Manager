import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { urls } = await request.json()
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No URLs provided'
      })
    }

    // Scrape all requested URLs in parallel
    const scrapeUrl = async (url: string) => {
      try {
        console.log(`🔍 Scraping specific URL: ${url}`)

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: AbortSignal.timeout(15000)
        })

        if (!response.ok) {
          console.warn(`⚠️ Failed to fetch ${url}: ${response.status}`)
          return null
        }

        const html = await response.text()

        // Extract text content (basic HTML stripping)
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        const title = titleMatch ? titleMatch[1].trim() : url

        if (textContent.length > 100) { // Only include pages with substantial content
          return { url, title, content: textContent, links: [] as string[] }
        }
        return null
      } catch (error) {
        console.error(`❌ Error scraping ${url}:`, error)
        return null
      }
    }

    const scraped = (await Promise.all((urls as string[]).map(scrapeUrl)))
      .filter((r): r is { url: string; title: string; content: string; links: string[] } => r !== null)

    const results = scraped
    let totalContent = ''
    for (const page of scraped) {
      totalContent += `=== ${page.title} ===\nURL: ${page.url}\n\n${page.content}\n\n${'='.repeat(80)}\n\n`
    }

    console.log(`✅ Successfully scraped ${results.length} out of ${urls.length} URLs`)

    return NextResponse.json({
      success: true,
      pages: results,
      totalPages: results.length,
      totalContent,
      message: `Successfully scraped ${results.length} out of ${urls.length} URLs`
    })

  } catch (error) {
    console.error('❌ Specific scraping error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 