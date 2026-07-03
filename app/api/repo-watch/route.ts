import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Configure repo-release monitoring for one client (the GitHub repo whose
// committed feature docs drive automatic script updates). Ownership is checked
// via the client's user_id on every call.

// GET ?clientId= — read the current watch (null if not configured).
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const clientId = new URL(request.url).searchParams.get('clientId');
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }
  const client = await prisma.client.findFirst({
    where: { id: clientId, user_id: session.user.id },
    include: { repo_watch: true },
  });
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  return NextResponse.json({
    watch: client.repo_watch,
    tokenConfigured: !!process.env.GITHUB_RELEASE_TOKEN,
  });
}

// POST { clientId, owner, name, branch?, docsPath?, enabled? } — create/update.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { clientId, owner, name } = body as {
    clientId?: string;
    owner?: string;
    name?: string;
  };
  if (!clientId || !owner || !name) {
    return NextResponse.json({ error: 'clientId, owner, name required' }, { status: 400 });
  }
  const client = await prisma.client.findFirst({
    where: { id: clientId, user_id: session.user.id },
    select: { id: true },
  });
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const branch =
    typeof body.branch === 'string' && body.branch.trim() ? body.branch.trim() : 'main';
  const docsPath =
    typeof body.docsPath === 'string' && body.docsPath.trim()
      ? body.docsPath.trim().replace(/\/+$/, '')
      : 'docs/features';
  const enabled = body.enabled !== false;

  const watch = await prisma.repoWatch.upsert({
    where: { client_id: clientId },
    create: { client_id: clientId, owner, name, branch, docs_path: docsPath, enabled },
    update: { owner, name, branch, docs_path: docsPath, enabled },
  });
  return NextResponse.json({ watch });
}

// DELETE ?clientId= — remove the watch entirely.
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const clientId = new URL(request.url).searchParams.get('clientId');
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }
  const client = await prisma.client.findFirst({
    where: { id: clientId, user_id: session.user.id },
    select: { id: true },
  });
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  await prisma.repoWatch.deleteMany({ where: { client_id: clientId } });
  return NextResponse.json({ ok: true });
}
