import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { crawlSite, hashContent } from '@/lib/crawler-server';

export const maxDuration = 60;

// One-time seed: crawl the client's docs root and store one DocPageSnapshot
// per page. From the next cron run on, those URLs are re-fetched daily and
// diffed against their stored hashes.
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rootUrl } = await request.json();
    if (!rootUrl || typeof rootUrl !== 'string') {
      return NextResponse.json({ error: 'rootUrl required' }, { status: 400 });
    }
    try {
      new URL(rootUrl);
    } catch {
      return NextResponse.json({ error: 'rootUrl is not a valid URL' }, { status: 400 });
    }

    const client = await prisma.client.findFirst({
      where: { id: params.id, user_id: session.user.id },
    });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    console.log(`🌱 Seeding monitoring for ${client.name} from ${rootUrl}`);
    const pages = await crawlSite(rootUrl, 50);
    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'Crawl returned no pages — check the URL is reachable and points at real docs' },
        { status: 400 }
      );
    }

    // Upsert one snapshot per page (idempotent — re-running just refreshes).
    let upserted = 0;
    for (const page of pages) {
      const hash = hashContent(page.content);
      await prisma.docPageSnapshot.upsert({
        where: { client_id_url: { client_id: client.id, url: page.url } },
        create: {
          client_id: client.id,
          url: page.url,
          title: page.title,
          content_text: page.content,
          content_hash: hash,
        },
        update: {
          title: page.title,
          content_text: page.content,
          content_hash: hash,
          last_checked_at: new Date(),
          last_changed_at: new Date(),
        },
      });
      upserted += 1;
    }

    await prisma.client.update({
      where: { id: client.id },
      data: { monitoring_enabled: true, monitoring_root_url: rootUrl },
    });

    return NextResponse.json({
      pagesSeeded: upserted,
      rootUrl,
      monitoring_enabled: true,
    });
  } catch (error) {
    console.error('setup-monitoring error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
