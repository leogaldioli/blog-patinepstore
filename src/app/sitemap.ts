import { supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://blog.patinepstore.com.br";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, published_at, updated_at, category, lang")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const allPosts = posts || [];
  const ptPosts = allPosts.filter((p) => p.lang === "pt" || !p.lang);
  const enPosts = allPosts.filter((p) => p.lang === "en");

  const ptPostUrls: MetadataRoute.Sitemap = ptPosts.map((post) => ({
    url: `${BASE_URL}/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const enPostUrls: MetadataRoute.Sitemap = enPosts.map((post) => ({
    url: `${BASE_URL}/en/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "monthly",
    priority: 0.6,
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

  const ptCategoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categoria/${cat}`,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  const enCategoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/en/categoria/${cat}`,
    changeFrequency: "daily",
    priority: 0.4,
  }));

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/en`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/sobre`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/en/about`, changeFrequency: "monthly", priority: 0.4 },
    ...ptCategoryUrls,
    ...enCategoryUrls,
    ...ptPostUrls,
    ...enPostUrls,
  ];
}
