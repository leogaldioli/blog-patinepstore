// Reescrita de title/meta_description para posts com CTR ruim no Google
// (muitas impressões, poucos cliques — dados do Search Console).
// A URL (slug) NUNCA muda; só título (H1/<title>) e meta description.
// O trigger de updated_at renova dateModified/sitemap → Google recrawla.
// Uso: curl "http://localhost:7013/api/cron/optimize-meta?secret=...&slugs=a,b,c"

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin, BlogPost } from "@/lib/supabase";
import { parseGeneratedJson, blocoDataAtual, dataAtualBr } from "@/lib/generate";
import { createTextCompletion } from "@/lib/llm";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DELAY_MS = 2000;
const MAX_SLUGS = 15;

function buildMetaPrompt(post: BlogPost): string {
  const contentSample = post.content_html.replace(/<[^>]+>/g, " ").slice(0, 1500);
  const lang = post.lang === "en" ? "inglês (US)" : "português brasileiro";
  const year = dataAtualBr().ano;
  return `Você é especialista em SEO on-page. Este post tem MUITAS impressões no Google e CTR baixo — o título/meta não estão ganhando o clique. Reescreva os dois. A URL não muda.

${blocoDataAtual()}

Título atual: ${post.title}
Meta atual: ${post.meta_description}
Categoria: ${post.category}
Início do conteúdo: ${contentSample}

REGRAS:
- Idioma: ${lang}
- Título: keyword principal (deduza do título atual/conteúdo) no INÍCIO, até ~62 caracteres, com elemento concreto que ganhe o clique (número, ano ${year}, benefício, resposta direta). Sem clickbait vazio, sem inventar dados.
- meta_description: 150-160 caracteres — resposta/benefício + um motivo específico para clicar.
- Mantenha a intenção de busca do post (não mude o assunto).

Retorne APENAS JSON válido: {"title": "...", "meta_description": "..."}`;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const slugsParam = req.nextUrl.searchParams.get("slugs") || "";
  const slugs = slugsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SLUGS);

  if (slugs.length === 0) {
    return NextResponse.json(
      { error: "Informe ?slugs=slug-1,slug-2 (máx. 15)" },
      { status: 400 }
    );
  }

  const results: {
    slug: string;
    success: boolean;
    before?: { title: string; meta: string };
    after?: { title: string; meta: string };
    model?: string;
    error?: string;
  }[] = [];

  for (const slug of slugs) {
    try {
      const { data } = await supabaseAdmin
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      const post = data as BlogPost | null;
      if (!post) throw new Error("post não encontrado");

      const completion = await createTextCompletion(anthropic, {
        anthropicModel: "claude-opus-5",
        maxTokens: 4000,
        prompt: buildMetaPrompt(post),
      });
      const parsed = parseGeneratedJson(completion.text);
      if (!parsed?.title || !parsed?.meta_description) {
        throw new Error("JSON sem title/meta_description");
      }

      const { error: upErr } = await supabaseAdmin
        .from("blog_posts")
        .update({ title: parsed.title, meta_description: parsed.meta_description })
        .eq("id", post.id);
      if (upErr) throw new Error(upErr.message);

      results.push({
        slug,
        success: true,
        before: { title: post.title, meta: post.meta_description },
        after: { title: parsed.title, meta: parsed.meta_description },
        model: completion.modelLabel,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`[optimize-meta] falha em ${slug}:`, detail);
      results.push({ slug, success: false, error: detail });
    }
    if (results.length < slugs.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  const updated = results.filter((r) => r.success).length;
  console.log(`[optimize-meta] ${updated}/${slugs.length} titles/metas reescritos`);
  return NextResponse.json({ updated, failed: slugs.length - updated, results });
}
