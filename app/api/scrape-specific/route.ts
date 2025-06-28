import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json()
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No URLs provided'
      })
    }

    const results = []
    let totalContent = ''

    for (const url of urls) {
      try {
        console.log(`🔍 Scraping specific URL: ${url}`)
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })

        if (!response.ok) {
          console.warn(`⚠️ Failed to fetch ${url}: ${response.status}`)
          continue
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
          results.push({
            url,
            title,
            content: textContent,
            links: [] // Not extracting links for specific URLs
          })
          
          totalContent += `=== ${title} ===\nURL: ${url}\n\n${textContent}\n\n${'='.repeat(80)}\n\n`
        }

      } catch (error) {
        console.error(`❌ Error scraping ${url}:`, error)
        continue
      }
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