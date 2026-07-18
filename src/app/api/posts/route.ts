// GET ?lang=pt&offset=0 — página de posts publicados (paginação do
// PostsGrid). Pós-migração: o browser não fala mais com o banco; client
// components consomem esta rota.

import { NextResponse, type NextRequest } from "next/server";
import { supabase, POSTS_PER_PAGE } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") === "en" ? "en" : "pt";
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("lang", lang)
    .order("published_at", { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ posts: data ?? [] });
}
