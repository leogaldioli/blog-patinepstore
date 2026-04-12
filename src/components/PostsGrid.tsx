"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, BlogPost, POSTS_PER_PAGE } from "@/lib/supabase";
import PostCard from "./PostCard";

type Props = {
  initialPosts: BlogPost[];
  lang: "pt" | "en";
  total: number;
};

export default function PostsGrid({ initialPosts, lang, total }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(initialPosts.length < total);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .eq("lang", lang)
      .order("published_at", { ascending: false })
      .range(offset, offset + POSTS_PER_PAGE - 1);

    const newPosts = (data as BlogPost[]) || [];

    if (newPosts.length > 0) {
      setPosts((prev) => [...prev, ...newPosts]);
      setOffset((prev) => prev + newPosts.length);
    }

    if (newPosts.length < POSTS_PER_PAGE) {
      setHasMore(false);
    }

    setLoading(false);
  }, [loading, hasMore, offset, lang]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0", color: "var(--cinza-texto)" }}>
        <p style={{ fontSize: 15, fontWeight: 600 }}>
          {lang === "en" ? "English articles are being generated." : "Os primeiros artigos estão sendo gerados."}
        </p>
        <p style={{ fontSize: 13 }}>
          {lang === "en" ? "Check back soon!" : "Volte em breve!"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {posts.map((post) => (
          <PostCard key={post.id} post={post} lang={lang} />
        ))}
      </div>

      {/* Sentinel — triggers loadMore when visible */}
      <div ref={sentinelRef} style={{ height: 1, marginTop: 40 }} />

      {loading && (
        <div style={{ textAlign: "center", padding: "16px 0", color: "var(--cinza-texto)" }}>
          <p style={{ fontSize: 13, fontWeight: 500 }}>
            {lang === "en" ? "Loading more articles…" : "Carregando mais artigos…"}
          </p>
        </div>
      )}

      {!hasMore && posts.length >= POSTS_PER_PAGE && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--cinza-texto)" }}>
          <p style={{ fontSize: 12, fontWeight: 500, opacity: 0.6 }}>
            {lang === "en" ? `${posts.length} articles · end of list` : `${posts.length} artigos · fim da lista`}
          </p>
        </div>
      )}
    </>
  );
}
