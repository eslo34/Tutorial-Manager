import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateWithFallback, SONNET, HAIKU } from '@/lib/anthropic';
import type Anthropic from '@anthropic-ai/sdk';

// GET: Fetch chat messages for a learning session
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify session ownership
    const learningSession = await prisma.learningSession.findFirst({
      where: {
        id: sessionId,
        user_id: session.user.id
      }
    });

    if (!learningSession) {
      return NextResponse.json({ error: 'Learning session not found' }, { status: 404 });
    }

    const messages = await prisma.learningChatMessage.findMany({
      where: {
        learning_session_id: sessionId
      },
      orderBy: { created_at: 'asc' },
      take: limit
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Send a message and get AI response
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, message, messageType = 'chat' } = await request.json();

    if (!sessionId || !message) {
      return NextResponse.json({ 
        error: 'Session ID and message are required' 
      }, { status: 400 });
    }

    // Get learning session with client data
    const learningSession = await prisma.learningSession.findFirst({
      where: {
        id: sessionId,
        user_id: session.user.id
      },
      include: {
        client: true,
        tasks: {
          orderBy: { created_at: 'asc' }
        },
        progress: true,
        chat_messages: {
          orderBy: { created_at: 'desc' },
          take: 10 // Last 10 messages for context
        }
      }
    });

    if (!learningSession) {
      return NextResponse.json({ error: 'Learning session not found' }, { status: 404 });
    }

    // Save user message
    const userMessage = await prisma.learningChatMessage.create({
      data: {
        learning_session_id: sessionId,
        role: 'user',
        content: message,
        message_type: messageType
      }
    });

    // Prepare context for AI. Anthropic only accepts user/assistant roles and
    // the conversation must start with a user turn, so drop anything else.
    const recentMessages: Anthropic.MessageParam[] = learningSession.chat_messages
      .slice()
      .reverse()
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
    while (recentMessages.length > 0 && recentMessages[0].role === 'assistant') {
      recentMessages.shift();
    }

    const completedTasks = learningSession.tasks.filter(task => task.is_completed);
    const pendingTasks = learningSession.tasks.filter(task => !task.is_completed);

    const systemInstructions = `You are helping a tutorial scriptwriter who needs to learn ${learningSession.software_name} so they can create high-quality tutorial videos about it. They need to understand the software deeply enough to explain it clearly to others and create comprehensive, accurate video scripts.

Your goal is to help them understand not just how to use the software, but why certain features exist, what problems they solve, and how they fit into typical workflows. This will help them create better, more insightful tutorials.

Important: Take things slow and step-by-step. Assume they're new to this software and need detailed explanations. Don't skip steps or assume prior knowledge. Break down complex processes into smaller, manageable pieces. Explain what they should expect to see at each step and where exactly they should look or click.

Respond in plain text only, like you're having a casual conversation with a colleague. No markdown formatting, no special symbols, no structured task formats. Focus on helping them understand the software from a tutorial creator's perspective, but go slowly and be very detailed.`;

    // The documentation is the largest, most stable part of the prompt, so it
    // sits in its own cached block — repeat questions in the same session reuse it.
    const systemBlocks: Anthropic.TextBlockParam[] = [
      { type: 'text', text: systemInstructions },
      {
        type: 'text',
        text: learningSession.client.scraped_content
          ? `Available documentation:\n${learningSession.client.scraped_content.slice(0, 10000)}`
          : 'No documentation has been scraped yet for this client.',
        cache_control: { type: 'ephemeral' },
      },
    ];

    // Conversational chat — Haiku leads for snappy responses, Sonnet as fallback.
    let aiResponse: string;
    try {
      const result = await generateWithFallback({
        system: systemBlocks,
        messages: [
          ...recentMessages,
          { role: 'user', content: message },
        ],
        maxTokens: 1000,
        models: [HAIKU, SONNET],
      });
      aiResponse = result.text;
    } catch (aiError) {
      console.error('AI response error:', aiError);
      aiResponse = 'I apologize, but I cannot process your request right now.';
    }

    // Save AI response
    const assistantMessage = await prisma.learningChatMessage.create({
      data: {
        learning_session_id: sessionId,
        role: 'assistant',
        content: aiResponse,
        message_type: 'chat'
      }
    });

    // Note: Removed automatic task creation for more conversational responses

    return NextResponse.json({ 
      userMessage,
      assistantMessage,
      aiResponse 
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Removed createTaskFromResponse function - now using conversational responses only
