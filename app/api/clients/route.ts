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

    const clients = await prisma.client.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'desc' }
    })

    // Transform snake_case to camelCase for frontend
    const transformedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
      scrapedContent: client.scraped_content,
      scrapedPages: client.scraped_pages,
      scrapedChars: client.scraped_chars,
      scrapedWords: client.scraped_words,
      scrapedAt: client.scraped_at,
      scrapedUrl: client.scraped_url,
      monitoringEnabled: client.monitoring_enabled,
      monitoringRootUrl: client.monitoring_root_url,
    }))

    return NextResponse.json({ clients: transformedClients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      name, 
      company, 
      email, 
      scrapedContent, 
      scrapedPages, 
      scrapedChars, 
      scrapedWords, 
      scrapedUrl, 
      scrapedAt 
    } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const clientData: any = {
      name,
      company: company || '',
      email: email || '',
      user_id: session.user.id
    }

    // Add documentation fields if provided
    if (scrapedContent) {
      clientData.scraped_content = scrapedContent
      clientData.scraped_pages = scrapedPages || 0
      clientData.scraped_chars = scrapedChars || 0
      clientData.scraped_words = scrapedWords || 0
      clientData.scraped_url = scrapedUrl || ''
      clientData.scraped_at = scrapedAt ? new Date(scrapedAt) : new Date()
    }

    const client = await prisma.client.create({
      data: clientData
    })

    // Transform snake_case to camelCase for frontend
    const transformedClient = {
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
      scrapedContent: client.scraped_content,
      scrapedPages: client.scraped_pages,
      scrapedChars: client.scraped_chars,
      scrapedWords: client.scraped_words,
      scrapedAt: client.scraped_at,
      scrapedUrl: client.scraped_url,
      monitoringEnabled: client.monitoring_enabled,
      monitoringRootUrl: client.monitoring_root_url,
    }

    return NextResponse.json({ client: transformedClient })
  } catch (error) {
    console.error('Error creating client:', error)
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
    const clientId = searchParams.get('id')

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    // First delete all projects for this client
    await prisma.project.deleteMany({
      where: { 
        client_id: clientId,
        user_id: session.user.id 
      }
    })

    // Then delete the client
    await prisma.client.delete({
      where: { 
        id: clientId,
        user_id: session.user.id 
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 