import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { pending_edits: { where: { status: { in: ['pending', 'accepted'] } } } },
        },
      },
    })

    // Transform snake_case to camelCase for frontend
    const transformedProjects = projects.map(project => ({
      id: project.id,
      clientId: project.client_id,
      title: project.title,
      description: project.description,
      documentationUrls: project.documentation_urls,
      prompt: project.prompt,
      status: project.status,
      script: project.script,
      videoType: project.video_type,
      sourceType: project.source_type,
      scrapedContent: project.scraped_content,
      scrapedPages: project.scraped_pages,
      scrapedChars: project.scraped_chars,
      scrapedWords: project.scraped_words,
      scrapedAt: project.scraped_at,
      scrapedUrl: project.scraped_url,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      pendingEditsCount: project._count.pending_edits,
    }))

    return NextResponse.json({ projects: transformedProjects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId, title, description, documentationUrls, prompt, status, videoType, sourceType } = await request.json()

    if (!clientId || !title) {
      return NextResponse.json({ error: 'Client ID and title are required' }, { status: 400 })
    }

    // New videos are auto-updated by the animation pipeline unless the client is
    // one whose videos are produced outside the editor (e.g. cut in Premiere) —
    // then they start on the original check-and-email system.
    const client = await prisma.client.findFirst({
      where: { id: clientId, user_id: session.user.id },
      select: { auto_update_default: true },
    })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const project = await prisma.project.create({
      data: {
        client_id: clientId,
        title,
        description: description || '',
        documentation_urls: documentationUrls || [],
        prompt: prompt || '',
        status: status || 'planning',
        video_type: videoType || 'tutorial',
        source_type: sourceType === 'code' ? 'code' : 'docs',
        auto_update: client.auto_update_default,
        user_id: session.user.id
      }
    })

    // Transform snake_case to camelCase for frontend
    const transformedProject = {
      id: project.id,
      clientId: project.client_id,
      title: project.title,
      description: project.description,
      documentationUrls: project.documentation_urls,
      prompt: project.prompt,
      status: project.status,
      script: project.script,
      videoType: project.video_type,
      sourceType: project.source_type,
      scrapedContent: project.scraped_content,
      scrapedPages: project.scraped_pages,
      scrapedChars: project.scraped_chars,
      scrapedWords: project.scraped_words,
      scrapedAt: project.scraped_at,
      scrapedUrl: project.scraped_url,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }

    return NextResponse.json({ project: transformedProject })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    await prisma.project.delete({
      where: { 
        id: projectId,
        user_id: session.user.id 
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 