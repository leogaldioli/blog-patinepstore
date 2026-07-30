// Saúde da esteira de conteúdo — feita para monitoramento externo (Uptime
// Kuma na VPS): retorna 503 quando a esteira está travada (fila vazia E sem
// post novo há 72h), 200 caso contrário. NÃO usar no healthcheck do Docker
// (o /api/health continua sendo o healthcheck do container).
//   curl "https://blog.patinepstore.com.br/api/cron/status?secret=..."

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const STALL_HOURS = 72;

async function countTopics(status: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from("blog_topics")
    .select("id", { count: "exact", head: true })
    .eq("status", status);
  return count ?? 0;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [pending, generating, errorCount, done] = await Promise.all([
    countTopics("pending"),
    countTopics("generating"),
    countTopics("error"),
    countTopics("done"),
  ]);

  const { data: lastPost } = await supabaseAdmin
    .from("blog_posts")
    .select("published_at, slug")
    .eq("status", "published")
    .eq("lang", "pt")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: drafts } = await supabaseAdmin
    .from("blog_posts")
    .select("id", { count: "exact", head: true })
    .eq("status", "draft");

  const lastPublishedAt = (lastPost as { published_at?: string } | null)?.published_at ?? null;
  const hoursSinceLastPost = lastPublishedAt
    ? (Date.now() - new Date(lastPublishedAt).getTime()) / 3_600_000
    : Infinity;

  // Travada = sem tópico na fila E sem post recente. Fila vazia sozinha não é
  // falha (o refill roda antes da geração); post recente sozinho também não.
  const stalled = pending === 0 && hoursSinceLastPost > STALL_HOURS;

  const body = {
    healthy: !stalled,
    topics: { pending, generating, error: errorCount, done },
    last_published_at: lastPublishedAt,
    hours_since_last_post: Number.isFinite(hoursSinceLastPost)
      ? Math.round(hoursSinceLastPost * 10) / 10
      : null,
    drafts_awaiting_review: drafts ?? 0,
    ts: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: stalled ? 503 : 200 });
}
