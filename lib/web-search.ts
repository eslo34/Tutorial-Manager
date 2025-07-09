export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface WebSearchResponse {
  success: boolean;
  results: SearchResult[];
  searchQuery: string;
  totalResults?: number;
  error?: string;
}

export async function searchWeb(query: string, numResults: number = 10): Promise<WebSearchResponse> {
  try {
    // Use absolute URL for server-side calls, relative for client-side
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const url = typeof window === 'undefined' ? `${baseUrl}/api/web-search` : '/api/web-search';
    
    console.log('🔍 Web search URL being called:', url);
    console.log('🔍 Running on server?', typeof window === 'undefined');
    console.log('🔍 Base URL:', baseUrl);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        numResults
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Web search error:', error);
    return {
      success: false,
      results: [],
      searchQuery: query,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function formatSearchResultsForAI(searchResponse: WebSearchResponse): string {
  if (!searchResponse.success || searchResponse.results.length === 0) {
    return `No search results found for query: "${searchResponse.searchQuery}"`;
  }

  const formattedResults = searchResponse.results
    .map((result, index) => {
      return `${index + 1}. ${result.title}
URL: ${result.link}
Summary: ${result.snippet}`;
    })
    .join('\n\n');

  return `Web Search Results for "${searchResponse.searchQuery}":
Total Results: ${searchResponse.totalResults || searchResponse.results.length}

${formattedResults}`;
}

export function extractSearchQueries(userRequest: string): string[] {
  // Extract potential search queries from user request
  // This is a simple implementation - could be enhanced with NLP
  const queries: string[] = [];
  
  // Main query is the user request itself
  queries.push(userRequest);
  
  // Extract specific topics/keywords if mentioned
  const topicPatterns = [
    /how to (.*?)(?:\.|$)/gi,
    /what is (.*?)(?:\.|$)/gi,
    /guide to (.*?)(?:\.|$)/gi,
    /tutorial for (.*?)(?:\.|$)/gi,
    /best practices for (.*?)(?:\.|$)/gi,
  ];
  
  topicPatterns.forEach(pattern => {
    const matches = userRequest.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const topic = match.replace(pattern, '$1').trim();
        if (topic.length > 3) {
          queries.push(topic);
        }
      });
    }
  });
  
  // Remove duplicates and return unique queries
  return Array.from(new Set(queries)).slice(0, 3); // Limit to 3 queries max
} 