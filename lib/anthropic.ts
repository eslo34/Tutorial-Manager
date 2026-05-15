import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;

export const anthropic = new Anthropic({ apiKey: apiKey || '' });

// Sonnet 4.6 — fast and capable; primary for full-script generation and analysis.
// Haiku 4.5 — fastest; primary for lightweight chat and partial edits, fallback elsewhere.
export const SONNET = 'claude-sonnet-4-6';
export const HAIKU = 'claude-haiku-4-5';

type UserContent = string | Anthropic.ContentBlockParam[];

interface GenerateArgs {
  system: string | Anthropic.TextBlockParam[];
  maxTokens: number;
  models: string[];
  content?: UserContent;
  messages?: Anthropic.MessageParam[];
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

      // The effort parameter trades latency for thoroughness on Sonnet 4.6
      // (it defaults to "high"). Not supported on Haiku 4.5, so only set it
      // for Sonnet. "medium" is the balance between speed and quality;
      // dial to "low" if a specific route starts hitting the 60s ceiling.
      if (model === SONNET) {
        (params as unknown as Record<string, unknown>).output_config = { effort: 'medium' };
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
