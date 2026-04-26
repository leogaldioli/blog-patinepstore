import { supabase, POSTS_PER_PAGE, CATEGORY_LABELS_EN, BlogPost } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL, breadcrumbSchema } from "@/lib/seo";

export const revalidate = 300;

const CATEGORY_INTROS_EN: Record<string, string> = {
  "guia-de-compra":
    "In-depth comparisons, best-model lists and buying guides to choose the right electric scooter for your weight, route and budget.",
  manutencao:
    "How to take care of your electric scooter: cleaning, tire pressure, battery replacement, lubrication and common troubleshooting.",
  regulamentacao:
    "Brazilian regulations (CONTRAN 996/2023), Maringá city rules and traffic guidance for electric scooters.",
  economia:
    "How much it costs to ride an electric scooter, comparisons with car/motorcycle/Uber and ROI for daily commuters.",
  seguranca:
    "Required gear, correct riding posture, accident prevention and visibility tips for urban traffic.",
  hiperlocal:
    "Everything about electric scooters in Maringá-PR (Brazil): routes, stores, local regulations and where to ride safely.",
  delivery:
    "Electric scooters for couriers: models with cargo racks, full-shift range and best price-to-performance for delivery work.",
  faq: "Direct answers to the most common questions about electric scooters and e-bikes.",
  tecnico:
    "Technical analysis of motors, batteries, controllers and electronic components of electric scooters.",
  lifestyle:
    "Urban mobility, sustainability and the electric two-wheel lifestyle in Brazilian cities.",
};

type Props = { params: Promise<{ cat: string }> };

async function getPosts(category: string): Promise<BlogPost[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("lang", "en")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(POSTS_PER_PAGE);
  return (data as BlogPost[]) || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  const label = CATEGORY_LABELS_EN[cat];
  if (!label) return { title: "Category not found", robots: { index: false } };

  const url = `${BASE_URL}/en/categoria/${cat}`;
  const description =
    CATEGORY_INTROS_EN[cat] ||
    `Articles about ${label.toLowerCase()} for electric scooters from Patinep Store.`;

  return {
    title: `${label} — Electric Scooter Articles | Patinep Store`,
    description,
    openGraph: {
      title: `${label} — Patinep Store Blog`,
      description,
      type: "website",
      url,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image" },
    alternates: {
      canonical: url,
      languages: {
        en: url,
        "pt-BR": `${BASE_URL}/categoria/${cat}`,
        "x-default": `${BASE_URL}/categoria/${cat}`,
      },
    },
  };
}

export default async function EnCategoryPage({ params }: Props) {
  const { cat } = await params;
  const label = CATEGORY_LABELS_EN[cat];
  if (!label) notFound();

  const posts = await getPosts(cat);
  const intro = CATEGORY_INTROS_EN[cat];

  const breadcrumbs = breadcrumbSchema([
    { name: "Blog", url: `${BASE_URL}/en` },
    { name: label, url: `${BASE_URL}/en/categoria/${cat}` },
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
            href="/en"
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
          {posts.length} {posts.length === 1 ? "article" : "articles"} published
        </p>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--cinza-texto)" }}>
          <p style={{ fontSize: 15, fontWeight: 600 }}>No articles in this category yet.</p>
          <p style={{ fontSize: 13 }}>Check back soon!</p>
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
            <PostCard key={post.id} post={post} lang="en" />
          ))}
        </div>
      )}
    </div>
  );
}
