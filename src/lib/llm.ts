import Anthropic from "@anthropic-ai/sdk";
import {
  ANTHROPIC_CREDITS_ERROR_CODE,
  isAnthropicCreditsError,
  normalizeAnthropicError,
} from "./anthropic-errors";

export const OPENROUTER_CREDITS_ERROR_CODE = "openrouter_insufficient_credits" as const;
export type ProviderCreditsErrorCode =
  | typeof ANTHROPIC_CREDITS_ERROR_CODE
  | typeof OPENROUTER_CREDITS_ERROR_CODE;

export class OpenRouterCreditsError extends Error {
  readonly code = OPENROUTER_CREDITS_ERROR_CODE;

  constructor() {
    super("Créditos do OpenRouter insuficientes. Recarregue o saldo em https://openrouter.ai/credits");
    this.name = "OpenRouterCreditsError";
  }
}

export const OPENROUTER_FALLBACK_MODEL =
  process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4-pro";

export type TextCompletion = {
  text: string;
  model: string;
  modelLabel: string;
  provider: "anthropic" | "openrouter";
  finishReason: string | null;
};

type OpenRouterResponse = {
  model?: string;
  choices?: {
    finish_reason?: string | null;
    message?: { content?: string | { type?: string; text?: string }[] | null };
  }[];
  error?: { message?: string; code?: string | number };
};

export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function providerCreditsErrorCode(
  error: unknown
): ProviderCreditsErrorCode | undefined {
  if (isAnthropicCreditsError(error)) return ANTHROPIC_CREDITS_ERROR_CODE;
  if (error instanceof OpenRouterCreditsError) return OPENROUTER_CREDITS_ERROR_CODE;
  return undefined;
}

export function modelDisplayName(model: string, provider?: string): string {
  const normalized = model.replace(/^~/, "");
  let name = model;

  if (normalized.includes("deepseek-v4-pro")) name = "DeepSeek V4 Pro";
  else if (normalized.includes("deepseek-v4-flash")) name = "DeepSeek V4 Flash";
  else if (normalized.includes("claude-haiku-4-5")) name = "Claude Haiku 4.5";
  else if (normalized.includes("claude-sonnet-5")) name = "Claude Sonnet 5";
  else if (normalized.includes("claude-opus-5")) name = "Claude Opus 5";

  if (provider === "openrouter") return `${name} (OpenRouter)`;
  if (provider === "anthropic") return `${name} (Anthropic)`;
  return name;
}

function extractOpenRouterText(
  content: string | { type?: string; text?: string }[] | null | undefined
): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n");
}

export async function createOpenRouterCompletion(opts: {
  prompt: string;
  maxTokens: number;
  webSearch?: boolean;
}): Promise<TextCompletion> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Fallback OpenRouter não configurado (OPENROUTER_API_KEY ausente)");

  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "https://blog.patinepstore.com.br",
        "X-OpenRouter-Title": "Blog Patinep Store",
      },
      body: JSON.stringify({
        model: OPENROUTER_FALLBACK_MODEL,
        messages: [{ role: "user", content: opts.prompt }],
        max_tokens: opts.maxTokens,
        response_format: { type: "json_object" },
        reasoning: { effort: "low", exclude: true },
        provider: { require_parameters: true },
        ...(opts.webSearch ? { plugins: [{ id: "web", max_results: 8 }] } : {}),
      }),
      signal: AbortSignal.timeout(180_000),
    });

    const body = (await response.json().catch(() => ({}))) as OpenRouterResponse;
    if (!response.ok || body.error) {
      if (response.status === 402 || body.error?.code === 402) {
        throw new OpenRouterCreditsError();
      }
      const detail = body.error?.message || `HTTP ${response.status}`;
      throw new Error(`OpenRouter falhou: ${detail}`);
    }

    const choice = body.choices?.[0];
    const text = extractOpenRouterText(choice?.message?.content);
    if (!text) {
      if (attempt < 2) {
        console.warn("[llm] OpenRouter retornou resposta vazia; repetindo uma vez");
        continue;
      }
      throw new Error("OpenRouter retornou uma resposta sem texto após 2 tentativas");
    }

    const model = body.model || OPENROUTER_FALLBACK_MODEL;
    return {
      text,
      model,
      modelLabel: modelDisplayName(model, "openrouter"),
      provider: "openrouter",
      finishReason: choice?.finish_reason || null,
    };
  }

  throw new Error("OpenRouter não concluiu a geração");
}

/** Tenta a Anthropic primeiro e usa o DeepSeek via OpenRouter se ela falhar. */
export async function createTextCompletion(
  anthropic: Anthropic,
  opts: { prompt: string; maxTokens: number; anthropicModel: string }
): Promise<TextCompletion> {
  try {
    const message = await anthropic.messages.create({
      model: opts.anthropicModel,
      max_tokens: opts.maxTokens,
      messages: [{ role: "user", content: opts.prompt }],
    });
    const block = message.content.find((item) => item.type === "text");
    if (message.stop_reason === "refusal" || !block || !("text" in block)) {
      throw new Error(`Anthropic retornou resposta sem texto (stop_reason=${message.stop_reason})`);
    }
    return {
      text: block.text,
      model: message.model,
      modelLabel: modelDisplayName(message.model, "anthropic"),
      provider: "anthropic",
      finishReason: message.stop_reason,
    };
  } catch (err) {
    if (!isOpenRouterConfigured()) throw normalizeAnthropicError(err);
    const detail = normalizeAnthropicError(err).message;
    console.warn(`[llm] Anthropic falhou (${detail}); usando ${OPENROUTER_FALLBACK_MODEL}`);
    return createOpenRouterCompletion({ prompt: opts.prompt, maxTokens: opts.maxTokens });
  }
}
