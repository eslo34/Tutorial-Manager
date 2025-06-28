import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

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

    // Create a specialized prompt for script modification
    const modificationPrompt = `You are an expert video script editor. Your task is to modify an existing video script based on specific user requests.

IMPORTANT INSTRUCTIONS:
1. You will receive the CURRENT SCRIPT and a MODIFICATION REQUEST
2. Make ONLY the changes requested by the user
3. Maintain the overall structure, tone, and style of the original script
4. Keep all parts that weren't requested to be changed EXACTLY the same
5. If documentation content is provided, use it to ensure accuracy of any new or modified content
6. Return the COMPLETE modified script, not just the changed parts

CURRENT SCRIPT:
${currentScript}

MODIFICATION REQUEST:
${modificationRequest}

${documentationContent ? `
DOCUMENTATION CONTENT (use for reference if needed):
${documentationContent.substring(0, 50000)}
` : ''}

Please provide the complete modified script:`;

    // Initialize Gemini AI and generate the modified script
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log('Generating modified script with Gemini...');
    console.log('Prompt length:', modificationPrompt.length);

    // Generate content
    const result = await model.generateContent(modificationPrompt);
    const response = await result.response;
    const modifiedScript = response.text();

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