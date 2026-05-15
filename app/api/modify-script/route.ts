import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateWithFallback, SONNET, HAIKU } from '@/lib/anthropic';

export const maxDuration = 60;

const MODIFY_SYSTEM_PROMPT = `You are an expert video script editor. Your task is to modify an existing video script based on specific user requests.

IMPORTANT INSTRUCTIONS:
1. You will receive the CURRENT SCRIPT and a MODIFICATION REQUEST
2. Make ONLY the changes requested by the user
3. Maintain the overall structure, tone, and style of the original script
4. Keep all parts that weren't requested to be changed EXACTLY the same
5. If documentation content is provided, use it to ensure accuracy of any new or modified content
6. Return the COMPLETE modified script, not just the changed parts

Respond with only the complete modified script — no preamble, no explanations.`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, currentScript, modificationRequest, documentationContent } = await request.json();

    if (!projectId || !currentScript || !modificationRequest) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: projectId, currentScript, and modificationRequest are required'
      }, { status: 400 });
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    console.log('Generating modified script...');

    const content: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> = [];
    if (documentationContent) {
      content.push({
        type: 'text',
        text: `DOCUMENTATION CONTENT (use for reference if needed):\n${documentationContent.substring(0, 50000)}`,
        cache_control: { type: 'ephemeral' },
      });
    }
    content.push({
      type: 'text',
      text: `CURRENT SCRIPT:\n${currentScript}\n\nMODIFICATION REQUEST:\n${modificationRequest}`,
    });

    const { text: modifiedScript } = await generateWithFallback({
      system: MODIFY_SYSTEM_PROMPT,
      content,
      maxTokens: 8192,
      models: [SONNET, HAIKU],
    });

    console.log('Script modified successfully');

    // Save the modified script to the database
    await prisma.project.update({
      where: { id: projectId },
      data: {
        script: modifiedScript,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      script: modifiedScript
    });

  } catch (error) {
    console.error('Script modification error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
