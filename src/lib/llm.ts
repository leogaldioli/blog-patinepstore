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

const DEFAULT_OPENROUTER_FALLBACK_MODELS = [
  "deepseek/deepseek-v4-flash-0731",
  "openai/gpt-5.6-luna",
  "deepseek/deepseek-v4-pro",
] as const;

function configuredOpenRouterModels(): string[] {
  const configured = process.env.OPENROUTER_MODELS
    ?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  if (configured?.length) return [...new Set(configured)];

  const legacyModel = process.env.OPENROUTER_MODEL?.trim();
  if (legacyModel) {
    return [
      legacyModel,
      ...DEFAULT_OPENROUTER_FALLBACK_MODELS.filter((model) => model !== legacyModel),
    ];
  }

  return [...DEFAULT_OPENROUTER_FALLBACK_MODELS];
}

export const OPENROUTER_FALLBACK_MODELS = configuredOpenRouterModels();
export const OPENROUTER_FALLBACK_MODEL = OPENROUTER_FALLBACK_MODELS[0];

export type TextCompletion = {
  text: string;
  model: string;
  modelLabel: string;
  provider: "anthropic" | "openrouter";
  finishReason: string | null;
};

type CompletionOptions = {
  prompt: string;
  maxTokens: number;
  validateText?: (text: string) => string | null;
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
  else if (normalized.includes("gpt-5.6-luna")) name = "GPT-5.6 Luna";
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
  prompt: CompletionOptions["prompt"];
  maxTokens: CompletionOptions["maxTokens"];
  validateText?: CompletionOptions["validateText"];
  webSearch?: boolean;
}): Promise<TextCompletion> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Fallback OpenRouter não configurado (OPENROUTER_API_KEY ausente)");

  const failures: string[] = [];

  for (const requestedModel of OPENROUTER_FALLBACK_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "https://blog.patinepstore.com.br",
            "X-OpenRouter-Title": "Blog Patinep Store",
          },
          body: JSON.stringify({
            model: requestedModel,
            messages: [{ role: "user", content: opts.prompt }],
            max_tokens: opts.maxTokens,
            response_format: { type: "json_object" },
            reasoning: { effort: "low", exclude: true },
            provider: { require_parameters: true },
            ...(opts.webSearch
              ? {
                  tools: [
                    {
                      type: "openrouter:web_search",
                      parameters: {
                        engine: "exa",
                        max_results: 8,
                        max_total_results: 8,
                        search_context_size: "medium",
                      },
                    },
                  ],
                }
              : {}),
          }),
          signal: AbortSignal.timeout(180_000),
        });

        const body = (await response.json().catch(() => ({}))) as OpenRouterResponse;
        if (!response.ok || body.error) {
          if (response.status === 402 || body.error?.code === 402) {
            throw new OpenRouterCreditsError();
          }

          const detail = body.error?.message || `HTTP ${response.status}`;
          failures.push(`${modelDisplayName(requestedModel)}: ${detail}`);
          break;
        }

        const choice = body.choices?.[0];
        const finishReason = choice?.finish_reason || null;
        if (["length", "max_tokens", "content_filter"].includes(finishReason || "")) {
          failures.push(
            `${modelDisplayName(requestedModel)}: conclusão interrompida (${finishReason})`
          );
          break;
        }

        const text = extractOpenRouterText(choice?.message?.content);
        if (!text) {
          if (attempt < 2) {
            console.warn(`[llm] ${requestedModel} retornou resposta vazia; repetindo uma vez`);
            continue;
          }
          failures.push(`${modelDisplayName(requestedModel)}: resposta vazia após 2 tentativas`);
          break;
        }

        const validationError = opts.validateText?.(text);
        if (validationError) {
          failures.push(`${modelDisplayName(requestedModel)}: ${validationError}`);
          break;
        }

        const model = body.model || requestedModel;
        return {
          text,
          model,
          modelLabel: modelDisplayName(model, "openrouter"),
          provider: "openrouter",
          finishReason,
        };
      } catch (error) {
        if (error instanceof OpenRouterCreditsError) throw error;

        const detail = error instanceof Error ? error.message : String(error);
        failures.push(`${modelDisplayName(requestedModel)}: ${detail}`);
        break;
      }
    }

    console.warn(`[llm] usando o próximo fallback após falha de ${requestedModel}`);
  }

  throw new Error(`OpenRouter não concluiu a geração: ${failures.join(" | ")}`);
}

/** Tenta a Anthropic primeiro e percorre a cadeia OpenRouter se ela falhar. */
export async function createTextCompletion(
  anthropic: Anthropic,
  opts: CompletionOptions & { anthropicModel: string }
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
    const validationError = opts.validateText?.(block.text);
    if (validationError) {
      throw new Error(`Anthropic retornou conteúdo inválido: ${validationError}`);
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
    console.warn(
      `[llm] Anthropic falhou (${detail}); usando cadeia ${OPENROUTER_FALLBACK_MODELS.join(" -> ")}`
    );
    return createOpenRouterCompletion({
      prompt: opts.prompt,
      maxTokens: opts.maxTokens,
      validateText: opts.validateText,
    });
  }
}
