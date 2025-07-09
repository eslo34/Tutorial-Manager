import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export async function POST(request: NextRequest) {
  try {
    const { query, numResults = 10 } = await request.json();
    
    if (!query) {
      return NextResponse.json({ 
        error: 'Search query is required' 
      }, { status: 400 });
    }

    // Check if Google Custom Search API credentials are available
    const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!googleApiKey || !googleSearchEngineId) {
      // Fallback to a simple search result format if no API credentials
      console.warn('No GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID found. Using fallback search results.');
      return NextResponse.json({
        success: true,
        results: [
          {
            title: `Search: ${query}`,
            link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            snippet: `Please search for "${query}" to find relevant information. Configure GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID for automated search results.`,
            position: 1
          }
        ],
        searchQuery: query,
        totalResults: 1
      });
    }

    // Use Google Custom Search API
    const googleApiUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleSearchEngineId}&q=${encodeURIComponent(query)}&num=${Math.min(numResults, 10)}`;
    
    console.log('Making Google Custom Search request for:', query);
    
    const response = await fetch(googleApiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Custom Search API error:', response.status, errorText);
      throw new Error(`Google Custom Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      console.error('Google Custom Search API error:', data.error);
      throw new Error(data.error.message || 'Google Custom Search API error');
    }

    // Format results from Google Custom Search API
    const results: SearchResult[] = (data.items || []).map((item: any, index: number) => ({
      title: item.title || 'No title',
      link: item.link || '',
      snippet: item.snippet || 'No description available',
      position: index + 1
    }));

    console.log(`\n🔍 Google Custom Search returned ${results.length} results for "${query}"`);
    console.log(`📊 Total results available: ${data.searchInformation?.totalResults || 'Unknown'}`);
    
    // Log each web page and its content
    console.log('\n📚 Web Pages Found:');
    console.log('=' .repeat(80));
    
    results.forEach((result: SearchResult, index: number) => {
      console.log(`\n${index + 1}. 📄 ${result.title}`);
      console.log(`🔗 URL: ${result.link}`);
      console.log(`📝 Content Preview:`);
      console.log(`   ${result.snippet}`);
      console.log(`   Character count: ${result.snippet.length}`);
    });
    
    console.log('\n' + '=' .repeat(80));
    console.log(`✅ Search complete! Found ${results.length} web pages with content for the AI to analyze.`);
    console.log('🤖 This content will be combined with documentation to generate the video script.\n');

    return NextResponse.json({
      success: true,
      results: results,
      searchQuery: query,
      totalResults: parseInt(data.searchInformation?.totalResults || results.length)
    });

  } catch (error) {
    console.error('Web search error:', error);
    
    let errorMessage = 'Failed to perform web search';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      results: [],
      searchQuery: '',
      error: errorMessage
    }, { status: 500 });
  }
} 