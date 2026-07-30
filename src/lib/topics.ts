// Reabastecimento automático da fila de tópicos (blog_topics).
// A fila original (seed manual de 183 tópicos) esgotou em abr/2026 e a esteira
// parou em silêncio por 3 meses. Este módulo mantém a fila viva:
//   1. destrava tópicos presos em 'generating' (crash no meio da geração)
//   2. re-enfileira 'error' com retry_count < 3
//   3. se pending < MIN_QUEUE, gera novos tópicos com Claude (dedupe contra
//      todos os keywords já usados) e insere como 'pending'.
// Chamado por /api/cron/topics (diário, antes do cron de geração).

import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "./supabase";
import { parseGeneratedJson } from "./generate";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MIN_QUEUE = 15;
const BATCH_SIZE = 30;

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

type NewTopic = {
  keyword: string;
  title_suggestion: string;
  category: string;
  priority: number;
};

function buildTopicsPrompt(existingKeywords: string[], batch: number): string {
  return `Você é o estrategista de SEO do blog da Patinep Store — loja especializada em micromobilidade elétrica (patinetes, scooters e bicicletas elétricas) em Maringá, PR, Brasil. Pioneira na cidade, 6+ anos, +3.000 clientes, nota 4.9 no Google, oficina/assistência técnica própria com peças originais. Marcas: Foston (principal), Bee Green, Panda.

MISSÃO: gerar ${batch} NOVOS tópicos de post para a fila de geração de conteúdo.

DADOS DE PERFORMANCE (Google Search Console, últimos 90 dias — use para guiar a escolha):
- Os posts que mais geram cliques são de MANUTENÇÃO/DEFEITO ("bateria não carrega", "travado sem aceleração", "display não liga", "calibrar pneu", "quanto tempo carregar") — gente que JÁ TEM patinete e busca solução → público da assistência técnica.
- Transporte também performa: "pode levar patinete no avião", "como transportar no carro".
- Hiperlocal converte: "oficina de patinete em Maringá", "conserto de patinete elétrico em maringá" (query nº1 em cliques), posts de Londrina/Curitiba/região trazem tráfego.
- Perguntas diretas estilo FAQ ranqueiam bem (posição média 7).

MIX DESEJADO NESTE LOTE (aproximado):
- ~40% manutencao + tecnico + faq (dor de quem já tem o equipamento; priorize sintomas/problemas específicos ainda não cobertos)
- ~20% guia-de-compra (comparativos, modelos Foston/Bee Green, faixas de preço)
- ~15% hiperlocal (Maringá, Sarandi, Paiçandu, Londrina, Cianorte, Campo Mourão, Umuarama, Paraná)
- ~25% distribuído entre regulamentacao, economia, seguranca, delivery, lifestyle

CATEGORIAS VÁLIDAS (use exatamente estes slugs): ${CATEGORIES.join(", ")}

REGRAS:
- keyword: como alguém digitaria no Google (long-tail, português natural, sem aspas)
- title_suggestion: título SEO com a keyword no início, até ~62 caracteres, com elemento concreto (número, ano, benefício)
- priority: 1-10 (10 = maior potencial de tráfego/conversão; manutenção específica e hiperlocal Maringá merecem 8-10)
- NÃO repita nem parafraseie nenhum keyword da lista de JÁ EXISTENTES abaixo — os tópicos precisam ser genuinamente novos (ângulo, sintoma, cidade ou pergunta diferente)
- Nada de tópicos genéricos demais ("o que é patinete elétrico") nem impossíveis de responder com os dados da loja

KEYWORDS JÁ EXISTENTES (NÃO repetir):
${existingKeywords.join("\n")}

RETORNE APENAS JSON VÁLIDO (sem markdown):
{"topics": [{"keyword": "...", "title_suggestion": "...", "category": "...", "priority": 8}]}`;
}

/** Chama Claude com fallback de modelo (pipeline roda sozinha na VPS). */
async function createWithFallback(prompt: string): Promise<string> {
  const models = ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5-20251001"];
  let lastErr: unknown;
  for (const model of models) {
    try {
      const msg = await anthropic.messages.create({
        model,
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content.find((b) => b.type === "text");
      if (msg.stop_reason === "refusal" || !text || !("text" in text)) {
        throw new Error(`resposta sem texto (stop_reason=${msg.stop_reason})`);
      }
      console.log(`[topics] tópicos gerados com ${model}`);
      return text.text;
    } catch (err) {
      lastErr = err;
      console.warn(`[topics] modelo ${model} falhou, tentando próximo:`, err);
    }
  }
  throw lastErr;
}

function normalizeKeyword(k: string): string {
  return k
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type RefillSummary = {
  unstuck: number;
  retried: number;
  pending_before: number;
  generated: number;
  inserted: number;
  skipped_duplicates: number;
  pending_after: number;
};

export async function refillTopics(force = false): Promise<RefillSummary> {
  // 1. Destravar tópicos presos em 'generating' (processo morreu no meio)
  const { data: stuck } = await supabaseAdmin
    .from("blog_topics")
    .select("id")
    .eq("status", "generating");
  const stuckIds = ((stuck as { id: string }[] | null) || []).map((t) => t.id);
  if (stuckIds.length > 0) {
    await supabaseAdmin
      .from("blog_topics")
      .update({ status: "pending" })
      .in("id", stuckIds);
  }

  // 2. Re-enfileirar erros com retry_count < 3
  const { data: errored } = await supabaseAdmin
    .from("blog_topics")
    .select("id, retry_count")
    .eq("status", "error");
  const retriable = ((errored as { id: string; retry_count: number | null }[] | null) || [])
    .filter((t) => (t.retry_count ?? 0) < 3)
    .map((t) => t.id);
  if (retriable.length > 0) {
    await supabaseAdmin
      .from("blog_topics")
      .update({ status: "pending" })
      .in("id", retriable);
  }

  // 3. Contar pendentes
  const { count } = await supabaseAdmin
    .from("blog_topics")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  const pendingBefore = count ?? 0;

  const summary: RefillSummary = {
    unstuck: stuckIds.length,
    retried: retriable.length,
    pending_before: pendingBefore,
    generated: 0,
    inserted: 0,
    skipped_duplicates: 0,
    pending_after: pendingBefore,
  };

  if (!force && pendingBefore >= MIN_QUEUE) return summary;

  // 4. Gerar novos tópicos com dedupe contra todos os keywords existentes
  const { data: all } = await supabaseAdmin.from("blog_topics").select("keyword");
  const existing = ((all as { keyword: string }[] | null) || []).map((t) => t.keyword);
  const existingSet = new Set(existing.map(normalizeKeyword));

  const raw = await createWithFallback(buildTopicsPrompt(existing, BATCH_SIZE));
  const parsed = parseGeneratedJson(raw);
  const topics: NewTopic[] = Array.isArray(parsed?.topics) ? parsed.topics : [];
  summary.generated = topics.length;

  for (const t of topics) {
    if (!t?.keyword || !t?.title_suggestion) continue;
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
      priority: Math.min(Math.max(Number(t.priority) || 5, 1), 10),
      status: "pending",
    });
    if (!error) summary.inserted++;
  }

  summary.pending_after = pendingBefore + summary.inserted;
  console.log(
    `[topics] refill: +${summary.inserted} novos (${summary.skipped_duplicates} duplicados), ` +
      `${summary.retried} erros re-enfileirados, ${summary.unstuck} destravados → ${summary.pending_after} pendentes`
  );
  return summary;
}
