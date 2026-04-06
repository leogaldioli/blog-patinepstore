import { supabase, POSTS_PER_PAGE, CATEGORY_LABELS, BlogPost } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

type Props = { params: Promise<{ cat: string }> };

async function getPosts(category: string): Promise<BlogPost[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(POSTS_PER_PAGE);
  return (data as BlogPost[]) || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  const label = CATEGORY_LABELS[cat];
  if (!label) return { title: "Categoria não encontrada" };
  return {
    title: `${label} — Artigos sobre patinetes e scooters elétricos`,
    description: `Artigos sobre ${label.toLowerCase()} de patinetes elétricos, scooters e micromobilidade da Patinep Store.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params;
  const label = CATEGORY_LABELS[cat];
  if (!label) notFound();

  const posts = await getPosts(cat);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px 48px" }}>
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--cinza-texto)", textDecoration: "none" }}
        >
          ← Blog
        </Link>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "var(--preto)",
            letterSpacing: "-0.5px",
            marginTop: 12,
            marginBottom: 8,
          }}
        >
          {label}
        </h1>
        <p style={{ fontSize: 14, color: "var(--cinza-texto)", fontWeight: 500 }}>
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
