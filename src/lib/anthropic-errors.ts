export const ANTHROPIC_CREDITS_ERROR_CODE = "anthropic_insufficient_credits" as const;

export class AnthropicCreditsError extends Error {
  readonly code = ANTHROPIC_CREDITS_ERROR_CODE;

  constructor() {
    super(
      "Créditos da Anthropic insuficientes. Recarregue o saldo em https://console.anthropic.com/settings/billing"
    );
    this.name = "AnthropicCreditsError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

/**
 * A API já retorna `billing_error` nas versões atuais, mas contas antigas ainda
 * podem receber HTTP 400/invalid_request_error com a mensagem de saldo baixo.
 */
export function isAnthropicCreditsError(error: unknown): boolean {
  if (error instanceof AnthropicCreditsError) return true;

  const outer = asRecord(error);
  const response = asRecord(outer?.error);
  const detail = asRecord(response?.error);
  const types = [outer?.type, response?.type, detail?.type];
  if (types.includes("billing_error")) return true;

  const messages = [outer?.message, response?.message, detail?.message]
    .filter((value): value is string => typeof value === "string")
    .join(" ");

  return (
    /credit balance.{0,80}(too low|insufficient|exhausted)/i.test(messages) ||
    /(insufficient|exhausted).{0,80}(credit|balance)/i.test(messages)
  );
}

export function normalizeAnthropicError(error: unknown): Error {
  if (isAnthropicCreditsError(error)) return new AnthropicCreditsError();
  if (error instanceof Error) return error;
  return new Error(JSON.stringify(error));
}
