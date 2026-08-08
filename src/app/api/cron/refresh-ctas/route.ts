// Retrofit de CTAs por intenção: posts de manutenção/técnico publicados com
// CTA de VENDA passam a ter CTA de ASSISTÊNCIA (WhatsApp da oficina).
// Processa N por chamada (rate limit Haiku); rodar em loop até remaining=0:
//   curl "http://localhost:7013/api/cron/refresh-ctas?secret=...&limit=10"
// Auto-rastreável: um post está "feito" quando cta_html contém wa.me.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin, BlogPost } from "@/lib/supabase";
import { parseGeneratedJson, whatsappCtaLink } from "@/lib/generate";
import { createTextCompletion } from "@/lib/llm";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TARGET_CATEGORIES = ["manutencao", "tecnico"];
const DELAY_MS = 4000;

function buildCtaPrompt(post: BlogPost, waLink: string): string {
  if (post.lang === "en") {
    return `You write for Patinep Store, an e-scooter shop in Maringá, Brazil, with its own repair workshop (original parts, honest diagnostics). The blog post below is about maintenance/technical issues — the reader OWNS an e-scooter and has a problem.

Write ONLY the closing CTA block inviting the reader to contact Patinep's repair service on WhatsApp.

Post: "${post.title}"
Summary: ${post.meta_description}

RULES:
- HTML with ONLY h3, p, strong and one <a href='${waLink}'>button text</a>. NO div, NO style, NO class.
- 2-4 sentences, contextual to this post's specific problem, direct tone.
- Mention: own workshop in Maringá, original parts.
- Button text explicit, e.g. "Chat with our repair team on WhatsApp".

Return ONLY valid JSON: {"cta_html": "..."}`;
  }
  return `Você é redator da Patinep Store, loja de micromobilidade elétrica em Maringá, PR, com oficina/assistência técnica própria (peças originais, diagnóstico honesto). O post abaixo é sobre manutenção/problema técnico — o leitor JÁ TEM um patinete/scooter e está com problema.

Escreva APENAS o bloco de CTA final convidando o leitor a falar com a assistência técnica da Patinep no WhatsApp.

Post: "${post.title}"
Resumo: ${post.meta_description}

REGRAS:
- HTML apenas com h3, p, strong e um <a href='${waLink}'>texto do botão</a>. SEM div, SEM style, SEM class.
- 2-4 frases, contextual ao problema específico do post, tom direto.
- Mencione: oficina própria em Maringá, peças originais.
- Texto do botão explícito, ex.: "Falar com a assistência no WhatsApp".

Retorne APENAS JSON válido: {"cta_html": "..."}`;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit")) || 10, 1), 20);

  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("id, slug, title, meta_description, category, lang, cta_html, lp_link")
    .eq("status", "published")
    .in("category", TARGET_CATEGORIES);

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar posts", detail: error.message }, { status: 500 });
  }

  const all = (data as BlogPost[]) || [];
  const pendingPosts = all.filter((p) => !(p.cta_html || "").includes("wa.me"));
  const batch = pendingPosts.slice(0, limit);

  const results: {
    slug: string;
    lang: string;
    success: boolean;
    model?: string;
    error?: string;
  }[] = [];

  for (const post of batch) {
    const waLink = whatsappCtaLink(post.title.slice(0, 80), post.lang === "en" ? "en" : "pt");
    try {
      const completion = await createTextCompletion(anthropic, {
        anthropicModel: "claude-haiku-4-5-20251001",
        maxTokens: 1024,
        prompt: buildCtaPrompt(post, waLink),
      });
      const rawText = completion.text;
      const parsed = parseGeneratedJson(rawText);
      if (!parsed?.cta_html || !String(parsed.cta_html).includes("wa.me")) {
        throw new Error("CTA gerado sem link wa.me");
      }
      const { error: upErr } = await supabaseAdmin
        .from("blog_posts")
        .update({ cta_html: parsed.cta_html, lp_link: waLink })
        .eq("id", post.id);
      if (upErr) throw new Error(upErr.message);
      results.push({
        slug: post.slug,
        lang: post.lang,
        success: true,
        model: completion.modelLabel,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`[refresh-ctas] falha em ${post.slug}:`, detail);
      results.push({ slug: post.slug, lang: post.lang, success: false, error: detail });
    }
    if (results.length < batch.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  const updated = results.filter((r) => r.success).length;
  const remaining = pendingPosts.length - updated;
  console.log(`[refresh-ctas] ${updated} CTAs atualizados, ${remaining} restantes`);

  return NextResponse.json({ updated, failed: results.length - updated, remaining, results });
}
