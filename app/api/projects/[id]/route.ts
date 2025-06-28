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
      }
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
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 