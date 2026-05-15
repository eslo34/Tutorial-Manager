import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateWithFallback, SONNET, HAIKU } from '@/lib/anthropic';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    console.log('\n🤖 Generating script with Claude...');
    console.log('🎬 Video type:', videoType);
    console.log('⏳ Processing...\n');

    // Documentation goes in its own cached block so repeated requests for the
    // same project skip re-processing it; the volatile request comes after.
    const { text: generatedScript, modelUsed } = await generateWithFallback({
      system: prompt,
      content: [
        {
          type: 'text',
          text: `Documentation:\n${documentationContent}`,
          cache_control: { type: 'ephemeral' },
        },
        {
          type: 'text',
          text: `User request: ${userRequest}`,
        },
      ],
      maxTokens: 8192,
      models: [SONNET, HAIKU],
    });

    console.log('\n✅ Script generated successfully!');
    console.log('📊 Generated script length:', generatedScript.length, 'characters');
    console.log(`🎬 Generated with ${modelUsed}\n`);

    return NextResponse.json({
      success: true,
      script: generatedScript,
      metadata: {
        scriptLength: generatedScript.length,
        generatedAt: new Date().toISOString(),
        videoType: videoType,
        modelUsed,
      }
    });

  } catch (error) {
    console.error('Script generation error:', error);

    let errorMessage = 'Failed to generate script';
    let errorDetails = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      };
    }

    console.error('Environment:', process.env.NODE_ENV);
    console.error('API Key present:', !!process.env.ANTHROPIC_API_KEY);
    console.error('Full error details:', errorDetails);

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
}
