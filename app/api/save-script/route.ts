import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, script } = body

    // Verify the project belongs to the user
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        user_id: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        script: script,
        status: 'completed',
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, project: updatedProject })
  } catch (error) {
    console.error('Error saving script:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save script' },
      { status: 500 }
    )
  }
} 