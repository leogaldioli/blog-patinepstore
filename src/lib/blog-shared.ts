// Tipos e constantes compartilhados (sem dependência de pg — importável
// por client components).

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
  updated_at: string | null;
  lang: "pt" | "en";
  original_slug: string | null;
};

export type BlogTopic = {
  id: string;
  keyword: string;
  title_suggestion: string;
  category: string;
  status: "pending" | "generating" | "done" | "error";
  priority: number;
  retry_count: number | null;
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

export const CATEGORY_LABELS_EN: Record<string, string> = {
  "guia-de-compra": "Buying Guide",
  manutencao: "Maintenance",
  regulamentacao: "Regulations",
  economia: "Economy",
  seguranca: "Safety",
  hiperlocal: "Maringá & Region",
  delivery: "Delivery",
  faq: "FAQ",
  tecnico: "Technical",
  lifestyle: "Lifestyle",
};

export const POSTS_PER_PAGE = 12;
