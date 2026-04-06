import { NextRequest, NextResponse } from "next/server";
import { generatePost, getPendingTopics } from "@/lib/generate";

const POSTS_PER_RUN = 10;

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
      { error: "Erro ao buscar tópicos", detail: String(err) },
      { status: 500 }
    );
  }

  if (topics.length === 0) {
    return NextResponse.json({ message: "Nenhum tópico pendente", generated: 0 });
  }

  const results = await Promise.allSettled(topics.map((t) => generatePost(t)));

  const summary = results.map((r, i) => ({
    topic: topics[i].keyword,
    ...(r.status === "fulfilled"
      ? r.value
      : { success: false, error: String(r.reason) }),
  }));

  const succeeded = summary.filter((s) => s.success).length;
  const failed = summary.filter((s) => !s.success).length;

  console.log(`[cron/generate] ${succeeded} gerados, ${failed} erros`);

  return NextResponse.json({
    generated: succeeded,
    failed,
    results: summary,
  });
}
