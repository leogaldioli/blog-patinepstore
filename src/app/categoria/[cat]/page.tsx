import { supabase, POSTS_PER_PAGE, CATEGORY_LABELS, BlogPost } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL, breadcrumbSchema } from "@/lib/seo";

export const revalidate = 300;

const CATEGORY_INTROS: Record<string, string> = {
  "guia-de-compra":
    "Comparativos completos, listas de melhores modelos e guias para escolher o patinete ou scooter elétrico ideal para seu uso, peso e orçamento.",
  manutencao:
    "Como cuidar do seu patinete elétrico: limpeza, calibragem de pneus, troca de bateria, lubrificação e diagnóstico de problemas comuns.",
  regulamentacao:
    "Resolução CONTRAN 996/2023, leis municipais de Maringá-PR e regras de circulação para patinetes elétricos no Brasil.",
  economia:
    "Quanto custa rodar de patinete elétrico, comparativos com carro/moto/Uber e cálculos de retorno do investimento.",
  seguranca:
    "Equipamentos obrigatórios, postura correta de pilotagem, prevenção de acidentes e dicas de visibilidade no trânsito.",
  hiperlocal:
    "Tudo sobre patinetes elétricos em Maringá-PR e região: rotas, lojas, regulamentação local e onde andar com segurança.",
  delivery:
    "Patinetes elétricos para entregadores: modelos com bagageiro, autonomia para um turno completo e custo-benefício no delivery.",
  faq: "Respostas diretas para as dúvidas mais comuns sobre patinetes elétricos, scooters e bicicletas elétricas.",
  tecnico:
    "Análise técnica de motores, baterias, controladores e componentes eletrônicos de patinetes e scooters elétricos.",
  lifestyle:
    "Mobilidade urbana, sustentabilidade e o estilo de vida sobre rodas elétricas em centros urbanos brasileiros.",
};

type Props = { params: Promise<{ cat: string }> };

async function getPosts(category: string): Promise<BlogPost[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("lang", "pt")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(POSTS_PER_PAGE);
  return (data as BlogPost[]) || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  const label = CATEGORY_LABELS[cat];
  if (!label) return { title: "Categoria não encontrada", robots: { index: false } };

  const url = `${BASE_URL}/categoria/${cat}`;
  const description =
    CATEGORY_INTROS[cat] ||
    `Artigos sobre ${label.toLowerCase()} de patinetes elétricos da Patinep Store.`;

  return {
    title: `${label} — Artigos sobre patinetes e scooters elétricos`,
    description,
    openGraph: {
      title: `${label} — Patinep Store Blog`,
      description,
      type: "website",
      url,
      locale: "pt_BR",
    },
    twitter: { card: "summary_large_image" },
    alternates: {
      canonical: url,
      languages: {
        "pt-BR": url,
        en: `${BASE_URL}/en/categoria/${cat}`,
        "x-default": url,
      },
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params;
  const label = CATEGORY_LABELS[cat];
  if (!label) notFound();

  const posts = await getPosts(cat);
  const intro = CATEGORY_INTROS[cat];

  const breadcrumbs = breadcrumbSchema([
    { name: "Blog", url: `${BASE_URL}/` },
    { name: label, url: `${BASE_URL}/categoria/${cat}` },
  ]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px 48px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div style={{ marginBottom: 32 }}>
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--cinza-texto)",
            marginBottom: 12,
          }}
        >
          <Link
            href="/"
            style={{ color: "var(--cinza-texto)", textDecoration: "none" }}
          >
            Blog
          </Link>
          <span>/</span>
          <span style={{ color: "var(--preto)" }}>{label}</span>
        </nav>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "var(--preto)",
            letterSpacing: "-0.5px",
            marginBottom: 8,
          }}
        >
          {label}
        </h1>
        {intro && (
          <p
            style={{
              fontSize: 14,
              color: "var(--cinza-texto)",
              fontWeight: 500,
              lineHeight: 1.55,
              marginBottom: 8,
              maxWidth: 720,
            }}
          >
            {intro}
          </p>
        )}
        <p style={{ fontSize: 13, color: "var(--cinza-texto)", fontWeight: 500 }}>
          {posts.length} {posts.length === 1 ? "artigo" : "artigos"} publicados
        </p>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--cinza-texto)" }}>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Ainda não há artigos nesta categoria.</p>
          <p style={{ fontSize: 13 }}>Volte em breve!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
