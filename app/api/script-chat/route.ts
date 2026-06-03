import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createWithTools, SONNET, HAIKU } from '@/lib/anthropic';
import type Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60; // bump to 300 on Vercel Pro if the loop runs long

const MAX_ITERATIONS = 6;       // agent turns per request (read/think cycles)
const MAX_PATHS_PER_CALL = 30;  // files the model may request in one read_files call
const MAX_READ_BYTES = 200_000; // total file bytes returned per read_files call

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'read_files',
    description:
      'Read the full contents of one or more source files from the repo so you can ground the script in how the product actually works. Pass exact paths from the file tree. Read as many relevant files as you need before deciding what to cover.',
    input_schema: {
      type: 'object',
      properties: {
        paths: {
          type: 'array',
          items: { type: 'string' },
          description: 'Exact file paths from the provided file tree.',
        },
      },
      required: ['paths'],
    },
  },
  {
    name: 'write_script',
    description:
      "Write or replace the FULL video script in the user's script editor. This is the ONLY way to deliver script content — never put the script in your chat reply. Always send the complete script, not a fragment. After calling this, reply in chat with a short, plain confirmation of what you wrote (no script text).",
    input_schema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: 'The complete video script.' },
        summary: {
          type: 'string',
          description: 'One short sentence describing what changed, for the chat confirmation.',
        },
      },
      required: ['script'],
    },
  },
];

// Read requested files from the client's uploaded repo and format them for a
// tool_result. Returns the text block plus the list of paths actually found.
async function readFiles(
  clientId: string,
  requested: string[]
): Promise<{ text: string; read: string[] }> {
  const paths = Array.from(new Set(requested.filter((p) => typeof p === 'string'))).slice(
    0,
    MAX_PATHS_PER_CALL
  );
  if (paths.length === 0) {
    return { text: 'No paths were provided.', read: [] };
  }

  const files = await prisma.repoFile.findMany({
    where: { client_id: clientId, path: { in: paths } },
    select: { path: true, content: true },
  });
  const byPath = new Map(files.map((f) => [f.path, f.content]));

  const read: string[] = [];
  const parts: string[] = [];
  let budget = MAX_READ_BYTES;

  for (const p of paths) {
    const content = byPath.get(p);
    if (content === undefined) {
      parts.push(`===== ${p} =====\n[NOT FOUND — check the file tree for the exact path]`);
      continue;
    }
    let slice = content;
    let truncated = false;
    if (slice.length > budget) {
      slice = slice.slice(0, Math.max(0, budget));
      truncated = true;
    }
    budget -= slice.length;
    read.push(p);
    parts.push(`===== ${p} =====\n${slice}${truncated ? '\n[...truncated...]' : ''}`);
    if (budget <= 0) {
      parts.push('[read_files budget reached — request remaining files in another call]');
      break;
    }
  }

  return { text: parts.join('\n\n'), read };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, message, currentScript } = await request.json();
    if (!projectId || !message) {
      return NextResponse.json(
        { error: 'projectId and message are required' },
        { status: 400 }
      );
    }

    // Load project + client (ownership enforced via user_id).
    const project = await prisma.project.findFirst({
      where: { id: projectId, user_id: session.user.id },
      include: { client: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const tree = (project.client.repo_tree as string[] | null) ?? [];
    if (tree.length === 0) {
      return NextResponse.json(
        { error: 'No code has been uploaded for this client yet. Connect a repo first.' },
        { status: 400 }
      );
    }

    // Recent chat history for context (oldest → newest), Anthropic-safe.
    const history = await prisma.scriptChatMessage.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
      take: 10,
    });
    const priorMessages: Anthropic.MessageParam[] = history
      .slice()
      .reverse()
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    while (priorMessages.length > 0 && priorMessages[0].role === 'assistant') {
      priorMessages.shift();
    }

    // Persist the user's message before calling the model.
    await prisma.scriptChatMessage.create({
      data: { project_id: projectId, role: 'user', content: message },
    });

    const systemInstructions = `You are an expert tutorial-video scriptwriter working with a colleague (the user) to script a video about "${project.client.name}". You have access to that product's full source code via the read_files tool, and a file tree is provided below.

HOW YOU WORK:
- This is a CHAT PANEL for DISCUSSION ONLY. Talk with the user about what the video should cover, ask clarifying questions, explain how features work based on the code, and agree on an approach.
- Use read_files to actually read the relevant source before making claims — ground everything in the real code, not guesses. Read freely; that's what it's for.
- When you and the user are ready for a draft (or they ask for changes), deliver the script by calling the write_script tool. The script goes into their editor, NOT into this chat.

ABSOLUTE RULES:
- NEVER write the script, or large excerpts of it, in your chat replies. No script paragraphs, no scene-by-scene text in chat. If you want to produce or change script content, you MUST use the write_script tool.
- Your chat replies are short and conversational (plain text, no markdown headers): questions, explanations, and brief confirmations like "Done — I drafted the intro plus three sections in the editor."
- Always send the COMPLETE script to write_script (it replaces the editor contents), never a fragment.
- The block titled "CURRENT SCRIPT IN EDITOR" below is the single source of truth. The user may have edited it by hand since your last draft — treat it as authoritative and build on it, never on your own earlier version.`;

    const systemBlocks: Anthropic.TextBlockParam[] = [
      { type: 'text', text: systemInstructions },
      {
        type: 'text',
        text: `FILE TREE (${tree.length} files):\n${tree.join('\n')}`,
        cache_control: { type: 'ephemeral' },
      },
      {
        type: 'text',
        text:
          currentScript && String(currentScript).trim().length > 0
            ? `CURRENT SCRIPT IN EDITOR (authoritative — may include the user's manual edits):\n${currentScript}`
            : 'CURRENT SCRIPT IN EDITOR: (empty — no draft yet)',
      },
    ];

    const convo: Anthropic.MessageParam[] = [
      ...priorMessages,
      { role: 'user', content: message },
    ];

    const filesRead: string[] = [];
    let scriptDraft: string | null = null;
    let assistantText = '';

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const resp = await createWithTools({
        system: systemBlocks,
        messages: convo,
        tools: TOOLS,
        maxTokens: 8192,
        models: [SONNET, HAIKU],
      });

      const text = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      if (text) assistantText = text;

      const toolUses = resp.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      if (resp.stop_reason !== 'tool_use' || toolUses.length === 0) {
        break;
      }

      // Echo the assistant's tool_use turn, then answer each tool call.
      convo.push({ role: 'assistant', content: resp.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        if (tu.name === 'read_files') {
          const paths = ((tu.input as { paths?: string[] }).paths) ?? [];
          const { text: resultText, read } = await readFiles(project.client_id, paths);
          filesRead.push(...read);
          toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: resultText });
        } else if (tu.name === 'write_script') {
          scriptDraft = String((tu.input as { script?: string }).script ?? '');
          toolResults.push({
            type: 'tool_result',
            tool_use_id: tu.id,
            content:
              'The script was written to the user\'s editor. Now reply in chat with one short plain-text sentence confirming what you wrote. Do NOT include any script text.',
          });
        } else {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: tu.id,
            content: `Unknown tool: ${tu.name}`,
            is_error: true,
          });
        }
      }

      convo.push({ role: 'user', content: toolResults });
    }

    if (!assistantText) {
      assistantText = scriptDraft
        ? 'Done — I wrote the draft into the script editor.'
        : "I couldn't complete that — try rephrasing.";
    }

    const uniqueFilesRead = Array.from(new Set(filesRead));

    // Persist the assistant message.
    const assistantMessage = await prisma.scriptChatMessage.create({
      data: {
        project_id: projectId,
        role: 'assistant',
        content: assistantText,
        meta: { filesRead: uniqueFilesRead, wroteDraft: scriptDraft !== null },
      },
    });

    // If a draft was produced, persist it to the project's script too so it
    // survives reloads (the editor also updates optimistically client-side).
    if (scriptDraft !== null) {
      await prisma.project.update({
        where: { id: projectId },
        data: { script: scriptDraft, status: 'completed', updated_at: new Date() },
      });
    }

    return NextResponse.json({
      assistantMessage: {
        id: assistantMessage.id,
        role: 'assistant',
        content: assistantMessage.content,
        createdAt: assistantMessage.created_at,
        filesRead: uniqueFilesRead,
      },
      scriptDraft,
      filesRead: uniqueFilesRead,
    });
  } catch (error) {
    console.error('Error in script-chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: load chat history for a project's code-mode workspace.
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, user_id: session.user.id },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const messages = await prisma.scriptChatMessage.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'asc' },
      take: 200,
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
        filesRead: (m.meta as { filesRead?: string[] } | null)?.filesRead ?? [],
      })),
    });
  } catch (error) {
    console.error('Error loading script-chat history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
