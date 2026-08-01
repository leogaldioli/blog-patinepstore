// Varredura diária de novidades com WEB SEARCH (server-side tool do Claude).
// Pesquisa legislação, mercado, tendências e curiosidades de micromobilidade
// (Brasil + global) e cria 0-2 tópicos prioridade 10 com os FATOS pesquisados
// salvos em blog_topics.research — o redator (Haiku, sem web) escreve o post
// a partir desses fatos, não da memória dele.
//
// Regras editoriais fixas: NUNCA acidentes/mortes/roubos; NUNCA marcas
// concorrentes (Patinep vende Foston, Bee Green, Panda e Goo Elétricos —
// outras marcas de equipamento não são citadas). Se não houver nada
// genuinamente novo e relevante, retorna lista vazia — dia sem novidade
// não vira post forçado.
//
// Chamado por /api/cron/news (07:00 UTC, antes do refill e da geração — o
// tópico criado hoje vira post hoje às 08:00, ainda fresco).

import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "./supabase";
import { parseGeneratedJson, blocoDataAtual } from "./generate";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_SEARCHES = 8;
const MAX_NEWS_TOPICS = 2;

const CATEGORIES = [
  "guia-de-compra",
  "manutencao",
  "regulamentacao",
  "economia",
  "seguranca",
  "hiperlocal",
  "delivery",
  "faq",
  "tecnico",
  "lifestyle",
] as const;

function buildNewsPrompt(existingKeywords: string[]): string {
  return `Você é o editor de novidades do blog da Patinep Store — loja de micromobilidade elétrica (patinetes, scooters, bicicletas elétricas) em Maringá, PR, Brasil, com oficina própria. Marcas vendidas: Foston, Bee Green, Panda, Goo Elétricos.

${blocoDataAtual()}

MISSÃO: pesquisar na web (use a ferramenta de busca) o que há de GENUINAMENTE NOVO e relevante para leitores brasileiros de micromobilidade, e propor até ${MAX_NEWS_TOPICS} tópicos de post. Pesquise nestas frentes:

1. LEGISLAÇÃO: novidades de regulamentação de patinetes/scooters/bikes elétricas — CONTRAN, DENATRAN, leis municipais/estaduais (Maringá e Paraná valem ouro), fiscalização, exigências novas
2. MERCADO: movimentos do setor de micromobilidade no Brasil (crescimento, importação, preços, baterias, infraestrutura de ciclovias)
3. TENDÊNCIAS GLOBAIS: o que está acontecendo lá fora que chega ao Brasil (tecnologia de baterias, regulação em outros países, padrões de uso urbano)
4. CURIOSIDADES: fatos interessantes e positivos sobre mobilidade elétrica que rendem um post leve

REGRAS EDITORIAIS INEGOCIÁVEIS:
- NUNCA proponha tópico sobre acidentes, mortes, incêndios, roubos ou qualquer tragédia — mesmo que seja a notícia mais quente. Blog da loja = tom positivo e útil.
- NUNCA cite marcas de patinetes/scooters/bikes que a Patinep NÃO vende (marcas da casa: Foston, Bee Green, Panda, Goo Elétricos; qualquer outra — generalize para a categoria/tecnologia ou descarte)
- Só proponha o que for RELEVANTE para quem tem ou quer ter um patinete/scooter no Brasil — notícia corporativa de empresa estrangeira sem efeito prático aqui não interessa
- Se depois de pesquisar você não encontrar nada genuinamente novo/relevante, retorne {"topics": []} — isso é uma resposta correta, não uma falha

PARA CADA TÓPICO, o campo "research" é o mais importante: escreva um resumo FACTUAL do que você encontrou (datas, números, o que muda na prática, nomes oficiais de leis/resoluções) com as URLs das fontes. O redator do post NÃO tem acesso à internet — ele vai escrever usando SOMENTE o que estiver em "research". Seja completo: 150-300 palavras por research.

FORMATO (categorias válidas: ${CATEGORIES.join(", ")}):
- keyword: como alguém buscaria isso no Google
- title_suggestion: título SEO ≤62 chars, keyword no início
- NÃO repita nenhum destes keywords já usados:
${existingKeywords.join("\n")}

Ao final da pesquisa, RETORNE APENAS JSON válido (sem markdown):
{"topics": [{"keyword": "...", "title_suggestion": "...", "category": "...", "priority": 10, "research": "fatos + fontes (URLs) + datas"}]}`;
}

/** Extrai o texto concatenado da resposta (com web search o content intercala
 *  blocos de busca e texto) e faz o loop de pause_turn do server tool. */
async function runWithWebSearch(prompt: string, model: string): Promise<string> {
  type Msg = { role: "user" | "assistant"; content: unknown };
  const messages: Msg[] = [{ role: "user", content: prompt }];
  const tools = [
    { type: "web_search_20260209" as const, name: "web_search" as const, max_uses: MAX_SEARCHES },
  ];

  for (let i = 0; i < 5; i++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 16000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: tools as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages as any,
    });

    if (response.stop_reason === "pause_turn") {
      // Loop server-side pausou — reenvia com o turno parcial pra continuar
      messages.push({ role: "assistant", content: response.content });
      continue;
    }
    if (response.stop_reason === "refusal") {
      throw new Error("Pesquisa recusada pelo modelo (refusal)");
    }

    return response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n");
  }
  throw new Error("Web search não concluiu após 5 continuações (pause_turn)");
}

function normalizeKeyword(k: string): string {
  return k
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type NewsSummary = {
  model_used: string | null;
  found: number;
  inserted: number;
  skipped_duplicates: number;
  topics: { keyword: string; category: string }[];
};

export async function sweepNews(): Promise<NewsSummary> {
  const { data: all } = await supabaseAdmin.from("blog_topics").select("keyword");
  const existing = ((all as { keyword: string }[] | null) || []).map((t) => t.keyword);
  const existingSet = new Set(existing.map(normalizeKeyword));

  const prompt = buildNewsPrompt(existing);

  // Opus → Sonnet (ambos suportam web_search_20260209); sem novidade ≠ erro
  let raw: string | null = null;
  let modelUsed: string | null = null;
  for (const model of ["claude-opus-5", "claude-sonnet-5"]) {
    try {
      raw = await runWithWebSearch(prompt, model);
      modelUsed = model;
      break;
    } catch (err) {
      console.warn(`[news] ${model} falhou:`, err instanceof Error ? err.message : err);
    }
  }
  if (raw === null) throw new Error("Varredura de notícias falhou em todos os modelos");

  const parsed = parseGeneratedJson(raw);
  const topics: {
    keyword: string;
    title_suggestion: string;
    category: string;
    priority: number;
    research: string;
  }[] = Array.isArray(parsed?.topics) ? parsed.topics : [];

  const summary: NewsSummary = {
    model_used: modelUsed,
    found: topics.length,
    inserted: 0,
    skipped_duplicates: 0,
    topics: [],
  };

  for (const t of topics.slice(0, MAX_NEWS_TOPICS)) {
    if (!t?.keyword || !t?.title_suggestion || !t?.research) continue;
    if (!CATEGORIES.includes(t.category as (typeof CATEGORIES)[number])) continue;
    const norm = normalizeKeyword(t.keyword);
    if (existingSet.has(norm)) {
      summary.skipped_duplicates++;
      continue;
    }
    existingSet.add(norm);
    const { error } = await supabaseAdmin.from("blog_topics").insert({
      keyword: t.keyword.trim(),
      title_suggestion: t.title_suggestion.trim(),
      category: t.category,
      priority: 10,
      status: "pending",
      research: t.research.trim(),
    });
    if (!error) {
      summary.inserted++;
      summary.topics.push({ keyword: t.keyword.trim(), category: t.category });
    }
  }

  console.log(
    `[news] varredura (${modelUsed}): ${summary.found} encontrados, ${summary.inserted} inseridos, ${summary.skipped_duplicates} duplicados`
  );
  return summary;
}
