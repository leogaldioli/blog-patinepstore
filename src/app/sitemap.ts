import { supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://blog.patinepstore.com.br";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, published_at, category")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const postUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${BASE_URL}/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categories = [
    "guia-de-compra",
    "manutencao",
    "regulamentacao",
    "economia",
    "seguranca",
    "hiperlocal",
    "delivery",
    "faq",
    "tecnico",
    "lifestyle",
  ];

  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categoria/${cat}`,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    ...categoryUrls,
    ...postUrls,
  ];
}
