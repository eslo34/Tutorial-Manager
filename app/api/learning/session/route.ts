import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET: Fetch learning sessions for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const learningSessions = await prisma.learningSession.findMany({
      where: {
        client_id: clientId,
        user_id: session.user.id
      },
      include: {
        progress: true,
        tasks: {
          orderBy: { created_at: 'asc' }
        },
        chat_messages: {
          orderBy: { created_at: 'asc' },
          take: 50 // Latest 50 messages
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ sessions: learningSessions });

  } catch (error) {
    console.error('Error fetching learning sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new learning session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, softwareName } = await request.json();

    if (!clientId || !softwareName) {
      return NextResponse.json({ 
        error: 'Client ID and software name are required' 
      }, { status: 400 });
    }

    // Get client to verify ownership and get documentation
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        user_id: session.user.id
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if a learning session already exists for this client
    const existingSession = await prisma.learningSession.findFirst({
      where: {
        client_id: clientId,
        user_id: session.user.id
      }
    });

    if (existingSession) {
      return NextResponse.json({ 
        session: existingSession,
        isExisting: true 
      });
    }

    // Create documentation summary
    const documentationSummary = client.scraped_content 
      ? `Documentation contains ${client.scraped_pages || 0} pages with ${client.scraped_chars || 0} characters covering the ${softwareName} platform.`
      : 'Documentation not yet scraped for this client.';

    // Create new learning session
    const learningSession = await prisma.learningSession.create({
      data: {
        client_id: clientId,
        user_id: session.user.id,
        software_name: softwareName,
        documentation_summary: documentationSummary,
        current_phase: 'getting_started',
        completion_percentage: 0.0
      }
    });

    // Create initial chat message
    await prisma.learningChatMessage.create({
      data: {
        learning_session_id: learningSession.id,
        role: 'assistant',
        content: `Welcome! I'm here to help you master ${softwareName}. I've analyzed their documentation and I'm ready to guide you through learning this software step by step. 

Let's start with the basics - would you like me to give you an overview of what ${softwareName} does, or would you prefer to dive into a specific area? I can create personalized learning tasks based on your experience level and what you want to achieve.

What would you like to focus on first?`,
        message_type: 'guidance'
      }
    });

    return NextResponse.json({ 
      session: learningSession,
      isExisting: false 
    });

  } catch (error) {
    console.error('Error creating learning session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update learning session
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, currentPhase, completionPercentage } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const updatedSession = await prisma.learningSession.update({
      where: {
        id: sessionId,
        user_id: session.user.id
      },
      data: {
        current_phase: currentPhase,
        completion_percentage: completionPercentage,
        updated_at: new Date()
      }
    });

    return NextResponse.json({ session: updatedSession });

  } catch (error) {
    console.error('Error updating learning session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
