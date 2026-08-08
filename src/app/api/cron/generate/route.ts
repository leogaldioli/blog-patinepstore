import { NextRequest, NextResponse } from "next/server";
import { generatePost, getPendingTopics } from "@/lib/generate";
import { notifyBot, escapeHtml } from "@/lib/notify";
import { BASE_URL } from "@/lib/seo";
import {
  OPENROUTER_CREDITS_ERROR_CODE,
  type ProviderCreditsErrorCode,
} from "@/lib/llm";

// 2/dia: ritmo sustentável — 148 posts em 18 dias (abr/2026) deixou 38% das
// páginas "rastreada, não indexada" no GSC. Qualidade > volume; ajustável
// via ?limit= no crontab.
const POSTS_PER_RUN = 2;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit")) || POSTS_PER_RUN;
  const safeLimit = Math.min(Math.max(1, limit), 20);

  let topics;
  try {
    topics = await getPendingTopics(safeLimit);
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao buscar tópicos", detail: err instanceof Error ? err.message : JSON.stringify(err) },
      { status: 500 }
    );
  }

  if (topics.length === 0) {
    return NextResponse.json({ message: "Nenhum tópico pendente", generated: 0 });
  }

  // Geração sequencial com delay para respeitar rate limit de 10k tokens/min do Haiku
  const summary: {
    topic: string;
    success: boolean;
    slug?: string;
    title?: string;
    enSlug?: string;
    model?: string;
    enModel?: string;
    error?: string;
    errorCode?: ProviderCreditsErrorCode;
    warning?: string;
  }[] = [];
  let blockedProvider: ProviderCreditsErrorCode | undefined;
  for (const topic of topics) {
    const result = await generatePost(topic);
    summary.push({ topic: topic.keyword, ...result });
    if (result.errorCode) {
      blockedProvider = result.errorCode;
      break;
    }
    if (summary.length < topics.length) {
      await new Promise((r) => setTimeout(r, 15000)); // 15s entre posts (max_tokens maior → mais tokens/min)
    }
  }

  const succeeded = summary.filter((s) => s.success).length;
  const drafts = summary.filter((s) => s.success && s.warning).length;
  const failed = summary.filter((s) => !s.success).length;
  // Inclui o tópico que detectou a falta de saldo, pois ele voltou a `pending`.
  const deferred = blockedProvider ? topics.length - succeeded : 0;

  console.log(`[cron/generate] ${succeeded} gerados (${drafts} para revisão), ${failed} erros`);

  const formatSuccess = (s: (typeof summary)[number]) => {
    const flags = [
      s.warning ? "📝 draft p/ revisão" : null,
      `PT: ${escapeHtml(s.model || "modelo não informado")}`,
      s.enSlug
        ? `EN: ${escapeHtml(s.enModel || "modelo não informado")}`
        : "EN ❌",
    ]
      .filter(Boolean)
      .join(" · ");
    return `• <a href="${BASE_URL}/${s.slug}">${escapeHtml(s.title || s.topic)}</a>\n  ${flags}`;
  };

  // Notifica o dono no Telegram (via bot-patinep) — best-effort
  if (succeeded > 0 || failed > 0) {
    if (blockedProvider) {
      const generatedLine =
        succeeded > 0
          ? `\n\n✅ Gerados antes da pausa:\n${summary.filter((s) => s.success).map(formatSuccess).join("\n")}`
          : "";
      const billingLine =
        blockedProvider === OPENROUTER_CREDITS_ERROR_CODE
          ? `O fallback OpenRouter ficou sem créditos. <a href="https://openrouter.ai/credits">Recarregue o saldo</a> para retomar.`
          : `Os créditos da Anthropic acabaram e o fallback OpenRouter não pôde assumir. <a href="https://console.anthropic.com/settings/billing">Ver faturamento da Anthropic</a>.`;
      await notifyBot(
        `⚠️ <b>Blog Patinep: geração pausada</b>\n\n` +
          `${billingLine}\n` +
          `📋 ${deferred} tópico${deferred > 1 ? "s" : ""} preservado${deferred > 1 ? "s" : ""} na fila.${generatedLine}`
      );
    } else {
      const lines = summary.map((s) => {
        if (s.success) {
          return formatSuccess(s);
        }
        return `• ⚠️ Falhou: ${escapeHtml(s.topic)} — ${escapeHtml((s.error || "").slice(0, 120))}`;
      });
      const header =
        succeeded > 0
          ? `🛴 <b>Blog Patinep: ${succeeded} post${succeeded > 1 ? "s" : ""} novo${succeeded > 1 ? "s" : ""}</b>${failed > 0 ? ` (${failed} falha${failed > 1 ? "s" : ""})` : ""}`
          : `⚠️ <b>Blog Patinep: geração falhou (${failed})</b>`;
      await notifyBot(`${header}\n\n${lines.join("\n")}`);
    }
  }

  return NextResponse.json(
    {
      generated: succeeded,
      drafts_for_review: drafts,
      failed,
      deferred,
      provider_blocked: Boolean(blockedProvider),
      blocked_provider: blockedProvider || null,
      results: summary,
    },
    { status: blockedProvider ? 503 : 200 }
  );
}
