import { supabase, POSTS_PER_PAGE, CATEGORY_LABELS_EN, BlogPost } from "@/lib/supabase";
import PostsGrid from "@/components/PostsGrid";
import Link from "next/link";
import type { Metadata } from "next";
import { BASE_URL } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Electric Scooter Blog — Patinep Store",
  description:
    "Guides, comparisons, maintenance and everything about electric scooters and micro-mobility. Experts in Maringá, Brazil.",
  alternates: {
    canonical: `${BASE_URL}/en`,
    languages: {
      en: `${BASE_URL}/en`,
      "pt-BR": BASE_URL,
      "x-default": BASE_URL,
    },
  },
  openGraph: {
    title: "Electric Scooter Blog — Patinep Store",
    description:
      "Guides, comparisons, maintenance and everything about electric scooters and micro-mobility.",
    url: `${BASE_URL}/en`,
    type: "website",
    locale: "en_US",
  },
};

async function getPosts(): Promise<BlogPost[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("lang", "en")
    .order("published_at", { ascending: false })
    .limit(POSTS_PER_PAGE);
  return (data as BlogPost[]) || [];
}

async function getPostCount(): Promise<number> {
  const { count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .eq("lang", "en");
  return count || 0;
}

export default async function EnHomePage() {
  const [posts, total] = await Promise.all([getPosts(), getPostCount()]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px 48px" }}>
      {/* Hero */}
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--preto)",
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
            marginBottom: 10,
          }}
        >
          Everything about electric scooters and e-bikes
        </h1>
        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--cinza-texto)", marginBottom: 0 }}>
          Buying guides, comparisons, maintenance and regulations.{" "}
          {total > 0 && `${total} articles published.`}
        </p>
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 36 }}>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_LABELS_EN).map(([slug, label]) => (
            <Link
              key={slug}
              href={`/en/categoria/${slug}`}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--preto)",
                background: "var(--cinza-claro)",
                border: "1px solid var(--cinza-medio)",
                padding: "6px 14px",
                borderRadius: 20,
                textDecoration: "none",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Posts grid with infinite scroll */}
      <PostsGrid initialPosts={posts} lang="en" total={total} />
    </div>
  );
}
