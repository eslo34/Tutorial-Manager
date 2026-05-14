import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

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

    // Initialize OpenAI
    const apiKey = process.env.GPT_API_KEY;
    if (!apiKey) {
      throw new Error('GPT_API_KEY not found in environment variables');
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Create a specialized prompt for partial script regeneration
    const partialRegenerationPrompt = `You are an expert video script editor specializing in partial script regeneration. Your task is to regenerate ONLY the selected portion of a script based on the user's specific modification request.

CRITICAL INSTRUCTIONS:
1. You will receive a SELECTED TEXT PORTION that needs to be regenerated
2. You will receive BEFORE and AFTER CONTEXT to maintain flow and coherence
3. Generate ONLY the replacement text for the selected portion - do not include the context
4. Maintain the same tone, style, and structure as the original script
5. Ensure smooth transitions with the before and after context
6. The regenerated portion should flow naturally when inserted between the contexts

SELECTED TEXT TO REGENERATE:
${selectedText}

BEFORE CONTEXT (for continuity - DO NOT regenerate this):
${beforeContext}

AFTER CONTEXT (for continuity - DO NOT regenerate this):
${afterContext}

MODIFICATION REQUEST:
${modificationRequest}

${documentationContent ? `
DOCUMENTATION CONTENT (use for reference if needed):
${documentationContent.substring(0, 30000)}
` : ''}

VIDEO TYPE: ${project.video_type || 'tutorial'}

Please provide ONLY the regenerated replacement text for the selected portion (no context, no explanations):`;

    console.log('🔄 Generating partial script regeneration with GPT-5...');
    console.log('📝 Selected text length:', selectedText.length, 'characters');
    console.log('📍 Selection position:', selectionStart, 'to', selectionEnd);
    console.log('🎯 Modification request:', modificationRequest);

    // Generate the regenerated portion with model fallback
    let completion: any = null;
    const modelsToTry = ["gpt-5-mini-2025-08-07", "gpt-5", "gpt-4o"];

    for (const model of modelsToTry) {
      try {
        console.log(`🔄 Attempting partial regeneration with ${model}...`);
        completion = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "user",
              content: partialRegenerationPrompt
            }
          ],
          max_completion_tokens: 4096,
        });
        if (!completion.choices[0]?.message?.content?.trim()) {
          throw new Error(`${model} returned an empty response`);
        }
        console.log(`✅ Partial regeneration successful with ${model}`);
        break;
      } catch (modelError) {
        console.log(`❌ ${model} failed:`, modelError instanceof Error ? modelError.message : 'Unknown error');
        if (model === modelsToTry[modelsToTry.length - 1]) {
          throw new Error(`All models failed. Last error: ${modelError instanceof Error ? modelError.message : 'Unknown error'}`);
        }
      }
    }
    
    if (!completion) {
      throw new Error('No model successfully generated partial regeneration');
    }

    const regeneratedText = completion.choices[0]?.message?.content || '';

    console.log('✅ Partial regeneration completed!');
    console.log('📊 Regenerated text length:', regeneratedText.length, 'characters');
    console.log('📝 Regenerated preview:', regeneratedText.substring(0, 100) + '...');

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
