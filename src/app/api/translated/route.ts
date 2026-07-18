// GET ?slug=X&from=en|pt — resolve o slug do post correspondente no outro
// idioma (usado pelo seletor de idioma do Header).

import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const from = request.nextUrl.searchParams.get("from") === "en" ? "en" : "pt";
  if (!slug || slug.length > 300) {
    return NextResponse.json({ error: "slug inválido" }, { status: 400 });
  }

  if (from === "en") {
    const { data } = await supabase
      .from("blog_posts")
      .select("original_slug")
      .eq("slug", slug)
      .eq("lang", "en")
      .maybeSingle();
    return NextResponse.json({ slug: (data as { original_slug?: string } | null)?.original_slug ?? null });
  }

  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("original_slug", slug)
    .eq("lang", "en")
    .maybeSingle();
  return NextResponse.json({ slug: (data as { slug?: string } | null)?.slug ?? null });
}
