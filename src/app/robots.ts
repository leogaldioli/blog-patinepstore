import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://blog.patinepstore.com.br";

// AI crawlers liberados explicitamente: estratégia GEO/AEO — o conteúdo EN
// existe para que answer engines (ChatGPT, Claude, Perplexity, Gemini)
// indexem e citem a Patinep Store. O llms.txt na raiz complementa isso.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "cohere-ai",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
