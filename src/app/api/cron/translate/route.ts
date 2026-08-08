import { NextRequest, NextResponse } from "next/server";
import { translatePostToEnglish, getPendingTranslations } from "@/lib/generate";
import type { ProviderCreditsErrorCode } from "@/lib/llm";

const POSTS_PER_RUN = 5;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit")) || POSTS_PER_RUN;
  const safeLimit = Math.min(Math.max(1, limit), 10);

  let posts;
  try {
    posts = await getPendingTranslations(safeLimit);
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao buscar posts para tradução", detail: err instanceof Error ? err.message : JSON.stringify(err) },
      { status: 500 }
    );
  }

  if (posts.length === 0) {
    return NextResponse.json({ message: "Nenhum post pendente de tradução", translated: 0 });
  }

  const summary: {
    slug: string;
    success: boolean;
    enSlug?: string;
    model?: string;
    error?: string;
    errorCode?: ProviderCreditsErrorCode;
  }[] = [];
  let blockedProvider: ProviderCreditsErrorCode | undefined;

  for (const post of posts) {
    const result = await translatePostToEnglish(post);
    summary.push({ slug: post.slug, ...result });
    if (result.errorCode) {
      blockedProvider = result.errorCode;
      break;
    }
    if (summary.length < posts.length) {
      await new Promise((r) => setTimeout(r, 8000));
    }
  }

  const succeeded = summary.filter((s) => s.success).length;
  const failed = summary.filter((s) => !s.success).length;

  console.log(`[cron/translate] ${succeeded} traduzidos, ${failed} erros`);

  return NextResponse.json(
    {
      translated: succeeded,
      failed,
      deferred: blockedProvider ? posts.length - succeeded : 0,
      provider_blocked: Boolean(blockedProvider),
      blocked_provider: blockedProvider || null,
      results: summary,
    },
    { status: blockedProvider ? 503 : 200 }
  );
}
