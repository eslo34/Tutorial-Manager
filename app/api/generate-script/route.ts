import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userRequest, documentationContent, videoType = 'tutorial' } = await request.json();
    
    if (!prompt || !userRequest) {
      return NextResponse.json({ 
        error: 'Missing required fields: prompt, userRequest' 
      }, { status: 400 });
    }

    // Documentation is required for script generation
    if (!documentationContent) {
      return NextResponse.json({ 
        error: 'Documentation content is required' 
      }, { status: 400 });
    }

    // Initialize OpenAI GPT-4 (more reliable than GPT-5 for script generation)
    const apiKey = process.env.GPT_API_KEY;
    console.log('🔑 API Key present:', !!apiKey);
    console.log('🔑 API Key length:', apiKey?.length || 0);
    console.log('🔑 API Key starts with:', apiKey?.substring(0, 10) || 'none');
    
    if (!apiKey) {
      throw new Error('GPT_API_KEY not found in environment variables');
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Format the complete prompt
    let fullPrompt = `${prompt}

User request: ${userRequest}`;

    // Add documentation content
    fullPrompt += `

Documentation: ${documentationContent}`;

    console.log('\n🤖 Generating script with GPT-4...');
    console.log('📊 Total prompt length:', fullPrompt.length, 'characters');
    console.log('🎬 Video type:', videoType);
    console.log('⏳ Processing...\n');

    // Generate content with GPT-4 (more reliable for script generation)
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Using GPT-4 for reliable script generation
      messages: [
        {
          role: "user",
          content: fullPrompt
        }
      ],
      max_completion_tokens: 4096,
    });

    const generatedScript = completion.choices[0]?.message?.content || '';

    console.log('\n✅ Script generated successfully!');
    console.log('📊 Generated script length:', generatedScript.length, 'characters');
    console.log('📝 Script preview (first 200 chars):', generatedScript.substring(0, 200) + '...');
    console.log('🎬 GPT-4 script generation complete!\n');

    return NextResponse.json({
      success: true,
      script: generatedScript,
      metadata: {
        promptLength: fullPrompt.length,
        scriptLength: generatedScript.length,
        generatedAt: new Date().toISOString(),
        videoType: videoType
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