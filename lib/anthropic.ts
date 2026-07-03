import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;

export const anthropic = new Anthropic({ apiKey: apiKey || '' });

// Sonnet 4.6 — fast and capable; primary for full-script generation and analysis.
// Haiku 4.5 — fastest; primary for lightweight chat and partial edits, fallback elsewhere.
// Opus 4.8 — most capable; reserved for the judgment-critical repo-release audit,
// where false positives/negatives are costly and call volume is low, so the
// per-call premium is negligible.
export const SONNET = 'claude-sonnet-4-6';
export const HAIKU = 'claude-haiku-4-5';
export const OPUS = 'claude-opus-4-8';

type UserContent = string | Anthropic.ContentBlockParam[];

interface GenerateArgs {
  system: string | Anthropic.TextBlockParam[];
  maxTokens: number;
  models: string[];
  content?: UserContent;
  messages?: Anthropic.MessageParam[];
  // Sonnet/Opus only. Defaults to 'medium' — UI flows can dial 'low' for
  // snappiness; background analysis (doc + repo audits) should use 'high' so it
  // doesn't miss anything.
  effort?: 'low' | 'medium' | 'high';
  // Extended thinking mode. Defaults to 'disabled' (snappy, deterministic-ish).
  // The repo-release audit passes 'adaptive' so Opus reasons in dedicated
  // thinking blocks — better precision, and it keeps reasoning out of the
  // visible text so JSON parsing stays clean. Only pass 'adaptive' for
  // Sonnet/Opus (Haiku stays on the default).
  thinking?: 'adaptive' | 'disabled';
}

// Calls the Messages API, trying each model in order until one returns a
// non-empty response. Fallbacks exist so a transient overload on the primary
// model doesn't fail the request.
export async function generateWithFallback({
  system,
  maxTokens,
  models,
  content,
  messages,
  effort = 'medium',
  thinking = 'disabled',
}: GenerateArgs): Promise<{ text: string; modelUsed: string }> {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not found in environment variables');
  }

  const messageList: Anthropic.MessageParam[] =
    messages ?? [{ role: 'user', content: content ?? '' }];

  let lastError: unknown;

  for (const model of models) {
    try {
      const params: Anthropic.MessageCreateParamsNonStreaming = {
        model,
        max_tokens: maxTokens,
        system,
        thinking: { type: 'disabled' },
        messages: messageList,
      };

      // Adaptive thinking (Opus/Sonnet) is set via the escape hatch so we don't
      // depend on the installed SDK typing the 'adaptive' variant.
      if (thinking === 'adaptive') {
        (params as unknown as Record<string, unknown>).thinking = { type: 'adaptive' };
      }

      // The effort parameter trades latency for thoroughness. Supported on
      // Sonnet 4.6 and Opus 4.8, not on Haiku 4.5 — so only set it for those.
      // Per-caller override via the `effort` arg; default 'medium' is baseline.
      if (model === SONNET || model === OPUS) {
        (params as unknown as Record<string, unknown>).output_config = { effort };
      }

      const message = await anthropic.messages.create(params);

      const text = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')
        .trim();

      if (!text) {
        throw new Error(`${model} returned an empty response`);
      }

      return { text, modelUsed: model };
    } catch (error) {
      lastError = error;
      console.log(
        `❌ ${model} failed:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('All AI models failed to generate a response');
}

interface ToolCallArgs {
  system: string | Anthropic.TextBlockParam[];
  messages: Anthropic.MessageParam[];
  tools: Anthropic.Tool[];
  maxTokens: number;
  models: string[];
  effort?: 'low' | 'medium' | 'high';
}

// Single tool-enabled Messages call with the same model-fallback behaviour as
// generateWithFallback. Returns the raw Message so the caller can drive its own
// agent loop (inspect stop_reason, execute tool_use blocks, feed tool_results
// back). Each call independently tries the models in order.
export async function createWithTools({
  system,
  messages,
  tools,
  maxTokens,
  models,
  effort = 'medium',
}: ToolCallArgs): Promise<Anthropic.Message> {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not found in environment variables');
  }

  let lastError: unknown;
  for (const model of models) {
    try {
      const params: Anthropic.MessageCreateParamsNonStreaming = {
        model,
        max_tokens: maxTokens,
        system,
        thinking: { type: 'disabled' },
        messages,
        tools,
      };
      if (model === SONNET) {
        (params as unknown as Record<string, unknown>).output_config = { effort };
      }
      return await anthropic.messages.create(params);
    } catch (error) {
      lastError = error;
      console.log(
        `❌ ${model} (tools) failed:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('All AI models failed to generate a response');
}
