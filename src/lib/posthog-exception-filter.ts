function exceptionText(properties: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(properties)) {
    if (!key.startsWith("$exception")) continue;
    try {
      parts.push(typeof value === "string" ? value : JSON.stringify(value));
    } catch {
      // A malformed third-party payload must not break analytics initialization.
    }
  }

  return parts.join(" ");
}

/**
 * Drops only signatures whose stack belongs to third-party GTM/CMP code.
 * Application exceptions and React/Next.js errors continue to reach PostHog.
 */
export function isKnownThirdPartyException(
  eventName: string,
  properties: Record<string, unknown>,
): boolean {
  if (eventName !== "$exception") return false;

  const text = exceptionText(properties);
  const isOpaqueCrossOriginError = /(?:^|["'])Script error\.?(?:["']|$)/i.test(text);
  const isGtmJsonError = /undefined[\\"']* is not valid JSON/i.test(text) &&
    /(?:\/|\.)gtm\.js/i.test(text);
  const isCmpConsentError = /Cannot read properties of undefined \(reading ["']consents["']\)/i.test(text) &&
    /tcfv2\/cmp2\.js/i.test(text);

  return isOpaqueCrossOriginError || isGtmJsonError || isCmpConsentError;
}
