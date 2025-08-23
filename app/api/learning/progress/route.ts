import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET: Fetch learning progress for a session
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify session ownership
    const learningSession = await prisma.learningSession.findFirst({
      where: {
        id: sessionId,
        user_id: session.user.id
      },
      include: {
        progress: true,
        tasks: {
          select: {
            id: true,
            category: true,
            is_completed: true,
            difficulty_level: true,
            estimated_minutes: true,
            completed_at: true
          }
        }
      }
    });

    if (!learningSession) {
      return NextResponse.json({ error: 'Learning session not found' }, { status: 404 });
    }

    // Calculate additional metrics
    const allTasks = learningSession.tasks;
    const completedTasks = allTasks.filter(t => t.is_completed);
    const totalEstimatedTime = allTasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
    const completedTime = completedTasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);

    // Calculate difficulty progress
    const difficultyBreakdown = {
      beginner: allTasks.filter(t => t.difficulty_level <= 2),
      intermediate: allTasks.filter(t => t.difficulty_level === 3),
      advanced: allTasks.filter(t => t.difficulty_level >= 4)
    };

    const difficultyProgress = {
      beginner: {
        total: difficultyBreakdown.beginner.length,
        completed: difficultyBreakdown.beginner.filter(t => t.is_completed).length
      },
      intermediate: {
        total: difficultyBreakdown.intermediate.length,
        completed: difficultyBreakdown.intermediate.filter(t => t.is_completed).length
      },
      advanced: {
        total: difficultyBreakdown.advanced.length,
        completed: difficultyBreakdown.advanced.filter(t => t.is_completed).length
      }
    };

    // Recent activity (tasks completed in last 7 days)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    const recentCompletions = completedTasks.filter(t => 
      t.completed_at && t.completed_at >= recentDate
    );

    const progressData = {
      session: {
        id: learningSession.id,
        softwareName: learningSession.software_name,
        currentPhase: learningSession.current_phase,
        completionPercentage: learningSession.completion_percentage,
        createdAt: learningSession.created_at,
        updatedAt: learningSession.updated_at
      },
      overview: {
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: allTasks.length - completedTasks.length,
        totalEstimatedTime,
        completedTime,
        averageTaskTime: completedTasks.length > 0 ? completedTime / completedTasks.length : 0
      },
      categoryProgress: learningSession.progress,
      difficultyProgress,
      recentActivity: {
        tasksCompletedThisWeek: recentCompletions.length,
        recentCompletions: recentCompletions.slice(0, 5) // Last 5 recent completions
      }
    };

    return NextResponse.json({ progress: progressData });

  } catch (error) {
    console.error('Error fetching learning progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Update learning progress manually or reset progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, action, category, masteryLevel } = await request.json();

    if (!sessionId || !action) {
      return NextResponse.json({ 
        error: 'Session ID and action are required' 
      }, { status: 400 });
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

    switch (action) {
      case 'recalculate':
        // Recalculate all progress from tasks
        await recalculateProgress(sessionId);
        break;

      case 'update_mastery':
        // Manually update mastery level for a category
        if (!category || masteryLevel === undefined) {
          return NextResponse.json({ 
            error: 'Category and mastery level are required for update_mastery' 
          }, { status: 400 });
        }

        await prisma.learningProgress.upsert({
          where: {
            learning_session_id_category: {
              learning_session_id: sessionId,
              category: category
            }
          },
          update: {
            mastery_level: Math.max(0, Math.min(1, masteryLevel)), // Ensure 0-1 range
            last_activity: new Date()
          },
          create: {
            learning_session_id: sessionId,
            category: category,
            mastery_level: Math.max(0, Math.min(1, masteryLevel)),
            tasks_completed: 0,
            total_tasks: 0,
            last_activity: new Date()
          }
        });
        break;

      case 'reset':
        // Reset all progress for the session
        await prisma.learningTask.updateMany({
          where: { learning_session_id: sessionId },
          data: { 
            is_completed: false, 
            completed_at: null,
            user_notes: null
          }
        });

        await prisma.learningProgress.deleteMany({
          where: { learning_session_id: sessionId }
        });

        await prisma.learningSession.update({
          where: { id: sessionId },
          data: {
            current_phase: 'getting_started',
            completion_percentage: 0,
            updated_at: new Date()
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Progress ${action} completed` });

  } catch (error) {
    console.error('Error updating learning progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to recalculate progress
async function recalculateProgress(sessionId: string) {
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

    // Update overall session progress
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
    console.error('Error recalculating progress:', error);
    throw error;
  }
}
