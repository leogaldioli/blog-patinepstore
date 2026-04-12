import { supabase, POSTS_PER_PAGE, CATEGORY_LABELS, BlogPost } from "@/lib/supabase";
import PostsGrid from "@/components/PostsGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getPosts(): Promise<BlogPost[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("lang", "pt")
    .order("published_at", { ascending: false })
    .limit(POSTS_PER_PAGE);
  return (data as BlogPost[]) || [];
}

async function getPostCount(): Promise<number> {
  const { count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .eq("lang", "pt");
  return count || 0;
}

export default async function HomePage() {
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
          Tudo sobre patinetes e scooters elétricos
        </h1>
        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--cinza-texto)", marginBottom: 0 }}>
          Guias, comparativos, manutenção e regulamentação.{" "}
          {total > 0 && `${total} artigos publicados.`}
        </p>
      </div>

      {/* Categorias */}
      <div style={{ marginBottom: 36 }}>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
            <Link
              key={slug}
              href={`/categoria/${slug}`}
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

      {/* Grid de posts com infinite scroll */}
      <PostsGrid initialPosts={posts} lang="pt" total={total} />
    </div>
  );
}
