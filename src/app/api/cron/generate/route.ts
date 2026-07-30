import { NextRequest, NextResponse } from "next/server";
import { generatePost, getPendingTopics } from "@/lib/generate";

// 3/dia: ritmo sustentável — 148 posts em 18 dias (abr/2026) deixou 38% das
// páginas "rastreada, não indexada" no GSC. Qualidade > volume; ajustável
// via ?limit= no crontab.
const POSTS_PER_RUN = 3;

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
  const summary: { topic: string; success: boolean; slug?: string; error?: string; warning?: string }[] = [];
  for (const topic of topics) {
    const result = await generatePost(topic);
    summary.push({ topic: topic.keyword, ...result });
    if (summary.length < topics.length) {
      await new Promise((r) => setTimeout(r, 8000)); // 8s entre posts
    }
  }

  const succeeded = summary.filter((s) => s.success).length;
  const drafts = summary.filter((s) => s.success && s.warning).length;
  const failed = summary.filter((s) => !s.success).length;

  console.log(`[cron/generate] ${succeeded} gerados (${drafts} para revisão), ${failed} erros`);

  return NextResponse.json({
    generated: succeeded,
    drafts_for_review: drafts,
    failed,
    results: summary,
  });
}
