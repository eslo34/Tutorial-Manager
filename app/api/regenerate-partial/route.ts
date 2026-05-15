import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateWithFallback, SONNET, HAIKU } from '@/lib/anthropic';

export const maxDuration = 60;

const PARTIAL_SYSTEM_PROMPT = `You are an expert video script editor specializing in partial script regeneration. Your task is to regenerate ONLY the selected portion of a script based on the user's specific modification request.

CRITICAL INSTRUCTIONS:
1. You will receive a SELECTED TEXT PORTION that needs to be regenerated
2. You will receive BEFORE and AFTER CONTEXT to maintain flow and coherence
3. Generate ONLY the replacement text for the selected portion - do not include the context
4. Maintain the same tone, style, and structure as the original script
5. Ensure smooth transitions with the before and after context
6. The regenerated portion should flow naturally when inserted between the contexts

Provide ONLY the regenerated replacement text for the selected portion (no context, no explanations).`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      projectId,
      selectedText,
      beforeContext,
      afterContext,
      selectionStart,
      selectionEnd,
      modificationRequest,
      documentationContent,
      currentScript
    } = await request.json();

    if (!projectId || !selectedText || !modificationRequest) {
      return NextResponse.json({
        error: 'Missing required fields: projectId, selectedText, modificationRequest'
      }, { status: 400 });
    }

    // Get the current project to verify ownership and access video type
    const project = await prisma.project.findFirst({
      where: { id: projectId, user_id: session.user.id }
    });

    if (!project) {
      return NextResponse.json({
        error: 'Project not found'
      }, { status: 404 });
    }

    console.log('🔄 Generating partial script regeneration with Claude...');
    console.log('📝 Selected text length:', selectedText.length, 'characters');

    const content: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> = [];
    if (documentationContent) {
      content.push({
        type: 'text',
        text: `DOCUMENTATION CONTENT (use for reference if needed):\n${documentationContent.substring(0, 30000)}`,
        cache_control: { type: 'ephemeral' },
      });
    }
    content.push({
      type: 'text',
      text: `SELECTED TEXT TO REGENERATE:
${selectedText}

BEFORE CONTEXT (for continuity - DO NOT regenerate this):
${beforeContext}

AFTER CONTEXT (for continuity - DO NOT regenerate this):
${afterContext}

MODIFICATION REQUEST:
${modificationRequest}

VIDEO TYPE: ${project.video_type || 'tutorial'}`,
    });

    // Partial edits are small and focused, so Haiku leads here for speed,
    // with Sonnet as the quality fallback.
    const { text: regeneratedText } = await generateWithFallback({
      system: PARTIAL_SYSTEM_PROMPT,
      content,
      maxTokens: 4096,
      models: [HAIKU, SONNET],
    });

    console.log('✅ Partial regeneration completed!');
    console.log('📊 Regenerated text length:', regeneratedText.length, 'characters');

    // Splice the regenerated text into the script the user currently has open.
    // Falls back to the saved script only if the client didn't send the live version.
    const baseScript = typeof currentScript === 'string' && currentScript.length > 0
      ? currentScript
      : (project.script || '');
    const newScript = baseScript.substring(0, selectionStart) +
                     regeneratedText +
                     baseScript.substring(selectionEnd);

    // Save the updated script to the database
    await prisma.project.update({
      where: { id: projectId },
      data: {
        script: newScript,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      regeneratedText: regeneratedText,
      newCompleteScript: newScript,
      metadata: {
        originalSelectionLength: selectedText.length,
        regeneratedLength: regeneratedText.length,
        selectionStart,
        selectionEnd,
        regeneratedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Partial script regeneration error:', error);
    return NextResponse.json({
      error: 'Failed to regenerate script portion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
