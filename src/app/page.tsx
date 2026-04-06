import { supabase, POSTS_PER_PAGE, CATEGORY_LABELS, BlogPost } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import Link from "next/link";

export const revalidate = 300;

async function getPosts(): Promise<BlogPost[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(POSTS_PER_PAGE);
  return (data as BlogPost[]) || [];
}

async function getPostCount(): Promise<number> {
  const { count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
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

      {/* Grid de posts */}
      {posts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 0",
            color: "var(--cinza-texto)",
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600 }}>
            Os primeiros artigos estão sendo gerados.
          </p>
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
