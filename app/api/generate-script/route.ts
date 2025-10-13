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

    // Initialize OpenAI GPT-5 (latest model)
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

    console.log('\n🤖 Generating script with GPT models...');
    console.log('📊 Total prompt length:', fullPrompt.length, 'characters');
    console.log('🎬 Video type:', videoType);
    console.log('⏳ Processing...\n');

    let completion;
    let modelUsed = "unknown";
    const modelsToTry = ["gpt-5", "gpt-4o", "gpt-4-turbo", "gpt-4"];

    for (const model of modelsToTry) {
      try {
        console.log(`🔄 Attempting ${model}...`);
        completion = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "user",
              content: fullPrompt
            }
          ],
          max_completion_tokens: 4096,
        });
        modelUsed = model;
        console.log(`✅ ${model} successful!`);
        break;
      } catch (modelError) {
        console.log(`❌ ${model} failed:`, modelError?.message || modelError);
        if (model === modelsToTry[modelsToTry.length - 1]) {
          // If this was the last model to try, throw the error
          throw modelError;
        }
        // Otherwise, continue to the next model
      }
    }

    const generatedScript = completion.choices[0]?.message?.content || '';

    console.log('\n✅ Script generated successfully!');
    console.log('📊 Generated script length:', generatedScript.length, 'characters');
    console.log('📝 Script preview (first 200 chars):', generatedScript.substring(0, 200) + '...');
    console.log(`🎬 ${modelUsed.toUpperCase()} script generation complete!\n`);

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
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.constructor?.name);
    
    let errorMessage = 'Failed to generate script';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500) // Truncate stack trace
      };
    }
    
    // Log additional context for debugging
    console.error('Environment:', process.env.NODE_ENV);
    console.error('API Key present:', !!process.env.GPT_API_KEY);
    console.error('Full error details:', errorDetails);

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
} 