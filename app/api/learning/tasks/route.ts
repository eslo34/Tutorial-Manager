import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateWithFallback, SONNET, HAIKU } from '@/lib/anthropic';

// GET: Fetch learning tasks for a session
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status'); // 'completed', 'pending', or 'all'

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

    const whereClause: any = {
      learning_session_id: sessionId
    };

    if (status === 'completed') {
      whereClause.is_completed = true;
    } else if (status === 'pending') {
      whereClause.is_completed = false;
    }

    const tasks = await prisma.learningTask.findMany({
      where: whereClause,
      orderBy: [
        { is_completed: 'asc' }, // Pending tasks first
        { created_at: 'asc' }
      ]
    });

    return NextResponse.json({ tasks });

  } catch (error) {
    console.error('Error fetching learning tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Generate learning tasks for a session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, categories, userExperience = 'beginner' } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get learning session with client data
    const learningSession = await prisma.learningSession.findFirst({
      where: {
        id: sessionId,
        user_id: session.user.id
      },
      include: {
        client: true,
        tasks: true
      }
    });

    if (!learningSession) {
      return NextResponse.json({ error: 'Learning session not found' }, { status: 404 });
    }

    // Generate learning tasks using AI
    const taskGenerationSystem = `You are an expert software trainer who creates practical learning exercises. Always respond with valid JSON only — no markdown fences, no commentary.`;

    const taskGenerationRequest = `Based on the provided documentation for ${learningSession.software_name}, generate a comprehensive learning task list for a ${userExperience} level user.

EXISTING TASKS: ${learningSession.tasks.length} tasks already created

REQUIREMENTS:
1. Create 8-12 practical learning tasks
2. Tasks should be hands-on and doable in the actual software
3. Progress from basic to advanced
4. Each task should have clear success criteria
5. Include estimated completion time
6. Categorize tasks appropriately

TASK CATEGORIES TO FOCUS ON:
${categories ? categories.join(', ') : 'navigation, basic_features, advanced_features, integrations'}

FORMAT YOUR RESPONSE AS JSON:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "What this task teaches",
      "instructions": "Step-by-step instructions",
      "category": "category_name",
      "difficulty_level": 1-5,
      "estimated_minutes": 15,
      "prerequisites": ["previous_task_title_if_any"]
    }
  ]
}

Generate tasks that will help someone become proficient with ${learningSession.software_name}.`;

    const { text: response } = await generateWithFallback({
      system: taskGenerationSystem,
      content: [
        {
          type: 'text',
          text: `DOCUMENTATION:\n${learningSession.client.scraped_content
            ? learningSession.client.scraped_content.slice(0, 8000)
            : 'Limited documentation available'}`,
          cache_control: { type: 'ephemeral' },
        },
        {
          type: 'text',
          text: taskGenerationRequest,
        },
      ],
      maxTokens: 2000,
      models: [SONNET, HAIKU],
    });

    if (!response) {
      throw new Error('No response from AI');
    }

    let generatedTasks;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      generatedTasks = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback to manual task creation if AI response can't be parsed
      generatedTasks = {
        tasks: [
          {
            title: "Explore the Dashboard",
            description: "Get familiar with the main interface and navigation",
            instructions: "Log into the software and spend 10 minutes exploring the main dashboard. Click through the main menu items and take note of the different sections available.",
            category: "navigation",
            difficulty_level: 1,
            estimated_minutes: 15,
            prerequisites: []
          },
          {
            title: "Complete Basic Setup",
            description: "Configure basic settings and preferences",
            instructions: "Navigate to settings or account preferences. Update your profile information and configure any basic settings that are available.",
            category: "basic_features",
            difficulty_level: 2,
            estimated_minutes: 20,
            prerequisites: ["Explore the Dashboard"]
          }
        ]
      };
    }

    // Create tasks in database
    const createdTasks = [];
    for (const taskData of generatedTasks.tasks) {
      const task = await prisma.learningTask.create({
        data: {
          learning_session_id: sessionId,
          title: taskData.title,
          description: taskData.description,
          instructions: taskData.instructions,
          category: taskData.category || 'general',
          difficulty_level: taskData.difficulty_level || 1,
          estimated_minutes: taskData.estimated_minutes || 15,
          prerequisites: taskData.prerequisites || []
        }
      });
      createdTasks.push(task);
    }

    // Update progress tracking
    await updateProgressTracking(sessionId);

    return NextResponse.json({ 
      tasks: createdTasks,
      count: createdTasks.length 
    });

  } catch (error) {
    console.error('Error generating learning tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update a learning task (mark complete, add notes, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, isCompleted, userNotes } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Get the task to verify ownership via learning session
    const task = await prisma.learningTask.findFirst({
      where: {
        id: taskId,
        learning_session: {
          user_id: session.user.id
        }
      },
      include: {
        learning_session: true
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update the task
    const updatedTask = await prisma.learningTask.update({
      where: { id: taskId },
      data: {
        is_completed: isCompleted ?? task.is_completed,
        completed_at: isCompleted ? new Date() : task.completed_at,
        user_notes: userNotes !== undefined ? userNotes : task.user_notes
      }
    });

    // Update progress tracking
    await updateProgressTracking(task.learning_session_id);

    // Update learning session completion percentage
    await updateSessionProgress(task.learning_session_id);

    return NextResponse.json({ task: updatedTask });

  } catch (error) {
    console.error('Error updating learning task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to update progress tracking
async function updateProgressTracking(sessionId: string) {
  try {
    const tasks = await prisma.learningTask.findMany({
      where: { learning_session_id: sessionId }
    });

    // Group tasks by category
    const tasksByCategory = tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, any[]>);

    // Update progress for each category
    for (const [category, categoryTasks] of Object.entries(tasksByCategory)) {
      const completedTasks = categoryTasks.filter(t => t.is_completed);
      const masteryLevel = categoryTasks.length > 0 ? completedTasks.length / categoryTasks.length : 0;

      await prisma.learningProgress.upsert({
        where: {
          learning_session_id_category: {
            learning_session_id: sessionId,
            category: category
          }
        },
        update: {
          mastery_level: masteryLevel,
          tasks_completed: completedTasks.length,
          total_tasks: categoryTasks.length,
          last_activity: new Date()
        },
        create: {
          learning_session_id: sessionId,
          category: category,
          mastery_level: masteryLevel,
          tasks_completed: completedTasks.length,
          total_tasks: categoryTasks.length,
          last_activity: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Error updating progress tracking:', error);
  }
}

// Helper function to update overall session progress
async function updateSessionProgress(sessionId: string) {
  try {
    const tasks = await prisma.learningTask.findMany({
      where: { learning_session_id: sessionId }
    });

    const completedTasks = tasks.filter(t => t.is_completed);
    const completionPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    // Determine current phase based on completion
    let currentPhase = 'getting_started';
    if (completionPercentage >= 75) {
      currentPhase = 'mastering';
    } else if (completionPercentage >= 40) {
      currentPhase = 'practicing';
    } else if (completionPercentage >= 15) {
      currentPhase = 'exploring';
    }

    await prisma.learningSession.update({
      where: { id: sessionId },
      data: {
        completion_percentage: completionPercentage,
        current_phase: currentPhase,
        updated_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating session progress:', error);
  }
}
