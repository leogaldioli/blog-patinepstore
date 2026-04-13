import Anthropic from "@anthropic-ai/sdk";
import { slugify } from "./slugify";
import { supabaseAdmin, BlogTopic, BlogPost } from "./supabase";

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

DADOS VERIFICADOS — USE APENAS ESTES (nunca invente números ou velocidades):

Regulamentação Maringá (Lei Municipal nº 11.981/2025):
- Ciclovias e ciclofaixas: velocidade máxima 20 km/h
- Calçadas, praças e parques: velocidade máxima 6 km/h
- Vias de trânsito compartilhado: permitido apenas em vias com limite de até 40 km/h
- Uso de capacete obrigatório
- Equipamentos obrigatórios: indicador de velocidade, campainha, sinalização noturna
- Proibido circular em vias rápidas ou ruas com velocidades elevadas

Regulamentação federal (Resolução CONTRAN 996/2023):
- Patinetes e scooters elétricas: equipamento de mobilidade de baixa velocidade
- Velocidade máxima do veículo: 32 km/h (limitação técnica do equipamento)
- CNH não exigida para patinetes elétricos (até 32 km/h)
- Scooters motorizadas acima de 50 cc: exigem CNH categoria A
- Faixa etária: mínimo 16 anos sem acompanhante

Dados de mercado verificados (use apenas estes, sem inventar):
- Autonomia típica patinetes elétricos: 20 a 40 km por carga (varia por modelo)
- Custo médio de recarga: R$ 0,10 a R$ 0,30 por carga completa (em Maringá, tarifa ~R$ 0,85/kWh)
- Tempo de recarga: 3 a 6 horas (bateria padrão 36V/10Ah a 48V/13Ah)
- Faixa de preço: patinetes entry-level R$ 1.800–R$ 3.500; premium R$ 4.000–R$ 8.000

ESCREVA UM POST DE BLOG COMPLETO SOBRE: "${topic.keyword}"
Sugestão de título: "${topic.title_suggestion}"
Categoria: ${topic.category}

ESTRUTURA OBRIGATÓRIA:
1. Introdução (150-200 palavras) — responde diretamente o tema
2. 4 a 6 seções com H2 (cada seção começa com 1-2 frases diretas e citáveis para AEO)
3. Seção FAQ com 3-5 perguntas e respostas objetivas (máx. 3 frases por resposta)
4. CTA contextual ao tema (NÃO use CTAs genéricos — crie um específico para este conteúdo)

REGRAS DE QUALIDADE:
- NUNCA invente velocidades, preços, autonomia ou dados técnicos além dos fornecidos acima
- Se não tiver o dado exato, use faixas ("entre X e Y") ou omita o número
- NUNCA use: "Certamente", "Com certeza", "Ótima pergunta", "Neste artigo", "Vamos explorar"
- Respostas diretas, sem rodeios, sem enrolação
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
  "cta_html": "HTML do CTA: apenas h3, p, strong e <a href='...'>Texto do botão</a>. SEM div, SEM style, SEM class, SEM qualquer atributo de estilo.",
  "lp_link": "${lpLink || "null"}",
  "reading_time_min": número_inteiro
}`;
}

function buildEnglishTranslationPrompt(ptPost: {
  title: string;
  meta_description: string;
  content_html: string;
  faq: { question: string; answer: string }[];
  cta_html: string;
  lp_link: string | null;
}): string {
  return `You are a professional translator and content writer for Patinep Store, a specialized e-scooter and micro-mobility shop based in Maringá, Brazil.

Translate the following Brazilian Portuguese blog post to English (US). Keep the context Brazilian (Maringá, Brazilian laws, BRL prices) but explain references so international readers understand them.

IMPORTANT RULES:
- Translate naturally — do NOT do word-for-word translation
- Keep all HTML tags and structure intact
- Convert currency references: keep BRL values but add context like "R$ 2,000 (approx. USD 400)"
- Keep Maringá references — they add authenticity and local SEO value
- Maintain the same tone: direct, expert, helpful
- Translate FAQ questions as they would naturally be typed in English on Google
- Keep all links unchanged
- Return ONLY valid JSON, no markdown

INPUT POST:
Title: ${ptPost.title}
Meta: ${ptPost.meta_description}
Content: ${ptPost.content_html.slice(0, 4000)}
FAQ: ${JSON.stringify(ptPost.faq)}
CTA: ${ptPost.cta_html || ""}

OUTPUT FORMAT (valid JSON only):
{
  "title": "SEO title in English with keyword",
  "meta_description": "150-160 char description in English",
  "content_html": "Full translated HTML",
  "faq": [{"question": "question as typed on Google in English", "answer": "direct answer in 2-3 sentences"}],
  "cta_html": "Translated CTA HTML: only h3, p, strong and <a href='...'>Button text</a>. NO div, NO style, NO class attributes.",
  "lp_link": ${JSON.stringify(ptPost.lp_link)},
  "reading_time_min": same_integer_as_original
}`;
}

const FACT_CHECK_PROMPT = `Você é um revisor de fatos para conteúdo sobre patinetes e scooters elétricas no Brasil.

DADOS VERIFICADOS (referência oficial):
- Lei Maringá 11.981/2025: ciclovias/ciclofaixas máx 20 km/h | calçadas/praças/parques máx 6 km/h | vias compartilhadas: só onde limite é até 40 km/h
- Lei Maringá 11.981/2025 equipamentos obrigatórios: capacete, indicador de velocidade, campainha, sinalização noturna (lanternas/refletores) — CORRETO mencionar esses itens
- CONTRAN 996/2023: velocidade técnica máxima 32 km/h | CNH NÃO exigida para patinetes elétricos | CNH-A apenas para motos/scooters > 50cc | idade mínima 16 anos
- Autonomia real dos modelos de mercado: 20 a 40 km por carga
- Custo de recarga: R$ 0,10 a R$ 0,30 por carga completa

CONTEÚDO A VERIFICAR:
{CONTENT}

Identifique afirmações factuais incorretas ou contraditórias com os dados acima.
Ignore opiniões, recomendações comerciais e estimativas vagas.
Foque apenas em: velocidades, limites legais, exigência de CNH, autonomia, custo de recarga.

Responda APENAS com JSON válido (sem markdown):
{"valid": true, "issues": []}
ou
{"valid": false, "issues": ["descrição clara do problema"]}`;

async function validatePost(
  content: string,
  faq: { question: string; answer: string }[]
): Promise<{ valid: boolean; issues: string[] }> {
  const faqText = faq.map((f) => `P: ${f.question}\nR: ${f.answer}`).join("\n\n");
  const fullContent = content.replace(/<[^>]+>/g, " ") + "\n\nFAQ:\n" + faqText;
  const prompt = FACT_CHECK_PROMPT.replace("{CONTENT}", fullContent.slice(0, 5000));

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { valid: true, issues: [] };
    const result = JSON.parse(jsonMatch[0]);
    return {
      valid: result.valid !== false,
      issues: Array.isArray(result.issues) ? result.issues : [],
    };
  } catch {
    return { valid: true, issues: [] };
  }
}

function parseGeneratedJson(rawText: string): GeneratedPost {
  let jsonStr: string | null = null;
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  } else {
    const braceMatch = rawText.match(/\{[\s\S]*\}/);
    if (braceMatch) jsonStr = braceMatch[0];
  }

  if (!jsonStr) throw new Error("Resposta não contém JSON válido");

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Fix control chars inside JSON strings
    let fixed = "";
    let inStr = false;
    let esc = false;
    for (const c of jsonStr) {
      if (esc) { fixed += c; esc = false; continue; }
      if (c === "\\" && inStr) { fixed += c; esc = true; continue; }
      if (c === '"') { inStr = !inStr; fixed += c; continue; }
      if (inStr && c === "\n") { fixed += "\\n"; continue; }
      if (inStr && c === "\r") { fixed += "\\r"; continue; }
      if (inStr && c === "\t") { fixed += "\\t"; continue; }
      fixed += c;
    }
    return JSON.parse(fixed);
  }
}

export async function generatePost(
  topic: BlogTopic
): Promise<{ success: boolean; slug?: string; enSlug?: string; error?: string; warning?: string }> {
  try {
    await supabaseAdmin
      .from("blog_topics")
      .update({ status: "generating" })
      .eq("id", topic.id);

    // ── Generate PT post ──
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: buildPrompt(topic) }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";
    let generated: GeneratedPost;
    try {
      generated = parseGeneratedJson(rawText);
    } catch (e) {
      console.error("[generate] JSON inválido PT:", rawText.slice(0, 200));
      throw new Error(`JSON inválido: ${rawText.slice(0, 200)}`);
    }

    const slug = slugify(generated.title);
    const { data: existing } = await supabaseAdmin
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .eq("lang", "pt")
      .maybeSingle();
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const validation = await validatePost(generated.content_html, generated.faq);
    const postStatus = validation.valid ? "published" : "draft";

    if (!validation.valid) {
      console.warn(`[generate] PT "${generated.title}" → draft. Problemas:`, validation.issues);
    }

    const { error: insertError } = await supabaseAdmin.from("blog_posts").insert({
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
      status: postStatus,
      lang: "pt",
      original_slug: null,
    });

    if (insertError) throw insertError;

    await supabaseAdmin
      .from("blog_topics")
      .update({ status: "done", generated_at: new Date().toISOString() })
      .eq("id", topic.id);

    // ── Generate EN version ──
    let enSlug: string | undefined;
    try {
      enSlug = await generateEnglishVersion({
        title: generated.title,
        meta_description: generated.meta_description,
        content_html: generated.content_html,
        faq: generated.faq,
        cta_html: generated.cta_html,
        lp_link: generated.lp_link === "null" ? null : generated.lp_link,
        topic_id: topic.id,
        category: topic.category,
        original_slug: finalSlug,
      });
    } catch (enErr) {
      console.error("[generate] EN version failed for", finalSlug, ":", enErr);
    }

    return {
      success: true,
      slug: finalSlug,
      enSlug,
      ...(validation.valid ? {} : { warning: `Draft — revisar: ${validation.issues.join("; ")}` }),
    };
  } catch (err) {
    await supabaseAdmin
      .from("blog_topics")
      .update({ status: "error" })
      .eq("id", topic.id);

    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

async function generateEnglishVersion(opts: {
  title: string;
  meta_description: string;
  content_html: string;
  faq: { question: string; answer: string }[];
  cta_html: string;
  lp_link: string | null;
  topic_id: string;
  category: string;
  original_slug: string;
}): Promise<string> {
  const prompt = buildEnglishTranslationPrompt(opts);

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const generated = parseGeneratedJson(rawText);

  const baseSlug = slugify(generated.title);
  const { data: existing } = await supabaseAdmin
    .from("blog_posts")
    .select("id")
    .eq("slug", baseSlug)
    .eq("lang", "en")
    .maybeSingle();
  const enSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const { error } = await supabaseAdmin.from("blog_posts").insert({
    topic_id: opts.topic_id,
    slug: enSlug,
    title: generated.title,
    meta_description: generated.meta_description,
    content_html: generated.content_html,
    category: opts.category,
    reading_time_min: generated.reading_time_min || 5,
    faq_json: generated.faq,
    cta_html: generated.cta_html,
    lp_link: generated.lp_link,
    status: "published",
    lang: "en",
    original_slug: opts.original_slug,
  });

  if (error) throw error;
  return enSlug;
}

/** Translate a single published PT post to English. */
export async function translatePostToEnglish(
  ptPost: BlogPost
): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    // Check if EN version already exists
    const { data: existing } = await supabaseAdmin
      .from("blog_posts")
      .select("id, slug")
      .eq("original_slug", ptPost.slug)
      .eq("lang", "en")
      .maybeSingle();

    if (existing) {
      return { success: true, slug: existing.slug };
    }

    const enSlug = await generateEnglishVersion({
      title: ptPost.title,
      meta_description: ptPost.meta_description,
      content_html: ptPost.content_html,
      faq: ptPost.faq_json || [],
      cta_html: ptPost.cta_html || "",
      lp_link: ptPost.lp_link,
      topic_id: ptPost.topic_id || "",
      category: ptPost.category,
      original_slug: ptPost.slug,
    });

    return { success: true, slug: enSlug };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[translate] Failed for", ptPost.slug, ":", message);
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

/** PT posts that don't yet have an EN translation. */
export async function getPendingTranslations(limit: number): Promise<BlogPost[]> {
  // Get all EN posts' original_slugs
  const { data: enPosts } = await supabaseAdmin
    .from("blog_posts")
    .select("original_slug")
    .eq("lang", "en")
    .not("original_slug", "is", null);

  const translatedSlugs = new Set((enPosts || []).map((p) => p.original_slug as string));

  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("lang", "pt")
    .order("published_at", { ascending: false })
    .limit(limit * 3); // fetch more, filter in memory

  if (error) throw error;

  return ((data as BlogPost[]) || [])
    .filter((p) => !translatedSlugs.has(p.slug))
    .slice(0, limit);
}
