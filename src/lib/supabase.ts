import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

// Client público — leitura de posts publicados
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin — escrita (usado no cron de geração)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type BlogPost = {
  id: string;
  topic_id: string | null;
  slug: string;
  title: string;
  meta_description: string;
  content_html: string;
  category: string;
  reading_time_min: number;
  faq_json: { question: string; answer: string }[] | null;
  cta_html: string | null;
  lp_link: string | null;
  status: "published" | "draft" | "removed";
  published_at: string;
  view_count: number;
  created_at: string;
};

export type BlogTopic = {
  id: string;
  keyword: string;
  title_suggestion: string;
  category: string;
  status: "pending" | "generating" | "done" | "error";
  priority: number;
  created_at: string;
  generated_at: string | null;
};

export const CATEGORY_LABELS: Record<string, string> = {
  "guia-de-compra": "Guia de Compra",
  manutencao: "Manutenção",
  regulamentacao: "Regulamentação",
  economia: "Economia",
  seguranca: "Segurança",
  hiperlocal: "Maringá e Região",
  delivery: "Delivery",
  faq: "Perguntas Frequentes",
  tecnico: "Técnico",
  lifestyle: "Lifestyle",
};

export const POSTS_PER_PAGE = 12;
