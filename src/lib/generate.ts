import Anthropic from "@anthropic-ai/sdk";
import { slugify } from "./slugify";
import { supabaseAdmin, BlogTopic } from "./supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type GeneratedPost = {
  title: string;
  meta_description: string;
  content_html: string;
  faq: { question: string; answer: string }[];
  cta_html: string;
  lp_link: string | null;
  reading_time_min: number;
};

function getLpLink(category: string, keyword: string): string | null {
  const text = (category + " " + keyword).toLowerCase();
  if (
    text.includes("scooter") ||
    text.includes("moto eletrica") ||
    text.includes("autopropelido")
  ) {
    return "https://lps.patinepstore.com.br/lp-scooter";
  }
  if (
    text.includes("patinete") ||
    text.includes("patinetes") ||
    text.includes("e-scooter")
  ) {
    return "https://lps.patinepstore.com.br/lp-patinete";
  }
  return null;
}

function buildPrompt(topic: BlogTopic): string {
  const lpLink = getLpLink(topic.category, topic.keyword);
  const lpInstruction = lpLink
    ? `Inclua um link para ${lpLink} de forma natural no conteúdo ou no CTA.`
    : `Inclua um link para https://patinepstore.com.br de forma natural no conteúdo ou no CTA.`;

  return `Você é redator da Patinep Store, loja especializada em micromobilidade elétrica em Maringá, PR, Brasil.

SOBRE A PATINEP STORE:
- Pioneira em Maringá, 6+ anos no mercado
- +3.000 clientes, nota 4.9 no Google
- Assistência técnica própria, peças originais
- Marcas: Foston (principal), Bee Green, Panda
- Tom: informal, direto, local — como um especialista que quer ajudar

ESCREVA UM POST DE BLOG COMPLETO SOBRE: "${topic.keyword}"
Sugestão de título: "${topic.title_suggestion}"
Categoria: ${topic.category}

ESTRUTURA OBRIGATÓRIA:
1. Introdução (150-200 palavras) — responde diretamente o tema
2. 4 a 6 seções com H2 (cada seção começa com 1-2 frases diretas e citáveis para AEO)
3. Seção FAQ com 3-5 perguntas e respostas objetivas (máx. 3 frases por resposta)
4. CTA contextual ao tema (NÃO use CTAs genéricos — crie um específico para este conteúdo)

REGRAS DE QUALIDADE:
- NUNCA use: "Certamente", "Com certeza", "Ótima pergunta", "Neste artigo", "Vamos explorar"
- Respostas diretas, sem rodeios, sem enrolação
- Use dados específicos quando possível (wattage, km de autonomia, faixa de preço)
- Mencione Maringá quando contextualmente relevante
- Português brasileiro com acentuação correta
- Parágrafos curtos (3-4 linhas máximo)

LINKS: ${lpInstruction}

RETORNE APENAS JSON VÁLIDO no formato:
{
  "title": "título SEO com keyword",
  "meta_description": "descrição de 150-160 caracteres, atraente",
  "content_html": "HTML completo do post (use h2, h3, p, ul, li, strong, a)",
  "faq": [{"question": "pergunta exata como alguém digitaria no Google", "answer": "resposta direta em 2-3 frases"}],
  "cta_html": "HTML do CTA contextual com link",
  "lp_link": "${lpLink || "null"}",
  "reading_time_min": número_inteiro
}`;
}

export async function generatePost(
  topic: BlogTopic
): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    // Marca como 'generating' para evitar duplicatas
    await supabaseAdmin
      .from("blog_topics")
      .update({ status: "generating" })
      .eq("id", topic.id);

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: buildPrompt(topic),
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extrai JSON da resposta — tenta bloco de código primeiro, depois busca genérica
    let jsonStr: string | null = null;
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      const braceMatch = rawText.match(/\{[\s\S]*\}/);
      if (braceMatch) jsonStr = braceMatch[0];
    }

    if (!jsonStr) throw new Error("Resposta não contém JSON válido");

    // Sanitiza caracteres de controle que quebram JSON.parse
    jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F]/g, (c) => {
      const escapes: Record<string, string> = {
        "\n": "\\n", "\r": "\\r", "\t": "\\t",
        "\b": "\\b", "\f": "\\f",
      };
      return escapes[c] ?? "";
    });

    let generated: GeneratedPost;
    try {
      generated = JSON.parse(jsonStr);
    } catch {
      // Última tentativa: extrai campos individualmente se o JSON estiver corrompido
      throw new Error(`JSON inválido após sanitização: ${jsonStr.slice(0, 200)}`);
    }

    const slug = slugify(generated.title);

    // Verifica se slug já existe
    const { data: existing } = await supabaseAdmin
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const { error: insertError } = await supabaseAdmin
      .from("blog_posts")
      .insert({
        topic_id: topic.id,
        slug: finalSlug,
        title: generated.title,
        meta_description: generated.meta_description,
        content_html: generated.content_html,
        category: topic.category,
        reading_time_min: generated.reading_time_min || 5,
        faq_json: generated.faq,
        cta_html: generated.cta_html,
        lp_link: generated.lp_link === "null" ? null : generated.lp_link,
        status: "published",
      });

    if (insertError) throw insertError;

    await supabaseAdmin
      .from("blog_topics")
      .update({ status: "done", generated_at: new Date().toISOString() })
      .eq("id", topic.id);

    return { success: true, slug: finalSlug };
  } catch (err) {
    await supabaseAdmin
      .from("blog_topics")
      .update({ status: "error" })
      .eq("id", topic.id);

    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

export async function getPendingTopics(limit: number): Promise<BlogTopic[]> {
  const { data, error } = await supabaseAdmin
    .from("blog_topics")
    .select("*")
    .eq("status", "pending")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data as BlogTopic[]) || [];
}
