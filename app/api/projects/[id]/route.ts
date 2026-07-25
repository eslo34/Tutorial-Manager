import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        user_id: session.user.id
      },
      include: {
        _count: {
          select: { pending_edits: { where: { status: { in: ['pending', 'accepted'] } } } },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

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
      pendingEditsCount: project._count.pending_edits,
      autoUpdate: project.auto_update,
      editorProject: project.editor_project,
    }

    return NextResponse.json({ project: transformedProject })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH — change how this video is kept up to date.
//   autoUpdate:false (default) → the original system: when the product changes we
//     audit the script and email a digest; a human updates the video.
//   autoUpdate:true → the animation pipeline may auto-update it end-to-end. Only
//     meaningful for videos actually built in the StepByStep editor, so we require
//     an editorProject slug before allowing it.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.project.findFirst({
      where: { id: params.id, user_id: session.user.id },
      select: { id: true, editor_project: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const body = await request.json()
    const data: {
      auto_update?: boolean; editor_project?: string | null;
      title?: string; description?: string;
    } = {}

    // Title / description edits.
    if (typeof body.title === 'string') {
      if (!body.title.trim()) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
      }
      data.title = body.title.trim()
    }
    if (typeof body.description === 'string') data.description = body.description.trim()

    if (typeof body.editorProject === 'string' || body.editorProject === null) {
      const slug = typeof body.editorProject === 'string' ? body.editorProject.trim() : ''
      data.editor_project = slug === '' ? null : slug
    }
    if (typeof body.autoUpdate === 'boolean') {
      const slug = data.editor_project !== undefined ? data.editor_project : existing.editor_project
      if (body.autoUpdate && !slug) {
        return NextResponse.json(
          { error: 'Set the editor project slug first — only videos built in the editor can auto-update.' },
          { status: 400 }
        )
      }
      data.auto_update = body.autoUpdate
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const updated = await prisma.project.update({
      where: { id: params.id },
      data,
      select: { id: true, auto_update: true, editor_project: true, title: true, description: true },
    })
    return NextResponse.json({
      project: {
        id: updated.id,
        autoUpdate: updated.auto_update,
        editorProject: updated.editor_project,
        title: updated.title,
        description: updated.description,
      },
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}