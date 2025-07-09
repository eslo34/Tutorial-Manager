import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractSearchQueries, searchWeb, formatSearchResultsForAI } from '@/lib/web-search';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userRequest, documentationContent, videoType = 'tutorial' } = await request.json();
    
    if (!prompt || !userRequest) {
      return NextResponse.json({ 
        error: 'Missing required fields: prompt, userRequest' 
      }, { status: 400 });
    }

    // For tutorial projects, documentation is required. For other projects, it's optional since they use web search
    if (videoType === 'tutorial' && !documentationContent) {
      return NextResponse.json({ 
        error: 'Documentation content is required for tutorial projects' 
      }, { status: 400 });
    }

    // Initialize Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 API Key present:', !!apiKey);
    console.log('🔑 API Key length:', apiKey?.length || 0);
    console.log('🔑 API Key starts with:', apiKey?.substring(0, 10) || 'none');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let webSearchResults = '';
    
    // For 'other' type projects, perform web search
    if (videoType === 'other') {
      console.log('\n🌐 Performing web search for non-tutorial project...');
      console.log('📝 User request:', userRequest);
      
      const searchQueries = extractSearchQueries(userRequest);
      console.log('🔍 Extracted search queries:', searchQueries);
      
      // Perform searches for each query
      const searchPromises = searchQueries.map(query => searchWeb(query, 5));
      const searchResponses = await Promise.all(searchPromises);
      
      // Format all search results
      webSearchResults = searchResponses
        .filter(response => response.success)
        .map(response => formatSearchResultsForAI(response))
        .join('\n\n' + '='.repeat(80) + '\n\n');
      
      console.log(`\n✅ Web search completed! Found results from ${searchResponses.length} queries`);
      console.log('📊 Total web content characters:', webSearchResults.length);
      console.log('🤖 Web search results will be combined with documentation for AI processing...\n');
    }

    // Format the complete prompt
    let fullPrompt = `${prompt}

User request: ${userRequest}`;

    // Add documentation if available
    if (documentationContent && documentationContent.trim()) {
      fullPrompt += `

Documentation: ${documentationContent}`;
    } else if (videoType === 'other') {
      fullPrompt += `

Documentation: No specific company documentation provided. Use web search results to create comprehensive content.`;
    }

    // Add web search results for non-tutorial projects
    if (videoType === 'other' && webSearchResults) {
      fullPrompt += `

Web Search Results: ${webSearchResults}`;
      
      console.log('\n📋 Final AI Prompt Structure:');
      console.log('=' .repeat(60));
      console.log('📝 Documentation content:', documentationContent.substring(0, 200) + '...');
      console.log('🌐 Web search results added:', webSearchResults.length, 'characters');
      console.log('=' .repeat(60));
    }

    console.log('\n🤖 Generating script with Gemini...');
    console.log('📊 Total prompt length:', fullPrompt.length, 'characters');
    console.log('🎬 Video type:', videoType);
    console.log('⏳ Processing...\n');

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const generatedScript = response.text();

    console.log('\n✅ Script generated successfully!');
    console.log('📊 Generated script length:', generatedScript.length, 'characters');
    console.log('📝 Script preview (first 200 chars):', generatedScript.substring(0, 200) + '...');
    
    if (videoType === 'other') {
      console.log('🌐 This script was enhanced with current web information!');
    }
    
    console.log('🎬 Script generation complete!\n');

    return NextResponse.json({
      success: true,
      script: generatedScript,
      metadata: {
        promptLength: fullPrompt.length,
        scriptLength: generatedScript.length,
        generatedAt: new Date().toISOString(),
        videoType: videoType,
        webSearchEnabled: videoType === 'other'
      }
    });

  } catch (error) {
    console.error('Script generation error:', error);
    
    let errorMessage = 'Failed to generate script';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
} 