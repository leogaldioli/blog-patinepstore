import { BlogPost, CATEGORY_LABELS, CATEGORY_LABELS_EN } from "@/lib/supabase";

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://blog.patinepstore.com.br";

export const STORE_URL = "https://patinepstore.com.br";
export const ORG_NAME = "Patinep Store";
export const ORG_LOGO = `${BASE_URL}/icon`;

export const AUTHOR = {
  name: "Equipe Patinep Store",
  url: `${BASE_URL}/sobre`,
  jobTitle: "Especialistas em Micromobilidade",
  worksFor: ORG_NAME,
};

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeEntities(s: string): string {
  return s.replace(/&[a-z#0-9]+;/gi, (m) => HTML_ENTITIES[m] || m);
}

export function stripLeadingH1(html: string): string {
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");
}

export function extractTldr(html: string): string | null {
  const stripped = stripLeadingH1(html);
  const firstP = stripped.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!firstP) return null;
  const text = decodeEntities(firstP[1].replace(/<[^>]+>/g, "").trim());
  if (text.length < 60) return null;
  return text.length > 280 ? text.slice(0, 277).trimEnd() + "…" : text;
}

export function postUrl(post: BlogPost): string {
  return post.lang === "en"
    ? `${BASE_URL}/en/${post.slug}`
    : `${BASE_URL}/${post.slug}`;
}

export function postOgImage(post: BlogPost): string {
  return `${postUrl(post)}/opengraph-image`;
}

type ArticleSchemaInput = {
  post: BlogPost;
  alsoAvailableSlug?: string | null;
};

export function articleSchema({ post }: ArticleSchemaInput) {
  const url = postUrl(post);
  const isEn = post.lang === "en";
  const labels = isEn ? CATEGORY_LABELS_EN : CATEGORY_LABELS;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description,
    image: [postOgImage(post)],
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    inLanguage: isEn ? "en" : "pt-BR",
    articleSection: labels[post.category] || post.category,
    author: {
      "@type": "Organization",
      name: ORG_NAME,
      url: STORE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: ORG_NAME,
      url: STORE_URL,
      logo: {
        "@type": "ImageObject",
        url: ORG_LOGO,
        width: 512,
        height: 512,
      },
    },
  };
}

export function faqSchema(
  faq: { question: string; answer: string }[] | null | undefined
) {
  if (!faq || faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

type Crumb = { name: string; url: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${STORE_URL}#organization`,
    name: ORG_NAME,
    url: STORE_URL,
    logo: {
      "@type": "ImageObject",
      url: ORG_LOGO,
      width: 512,
      height: 512,
    },
    description:
      "Loja especializada em patinetes e scooters elétricos em Maringá-PR. Vendas, manutenção e consultoria em micromobilidade.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Maringá",
      addressRegion: "PR",
      addressCountry: "BR",
    },
    sameAs: [STORE_URL],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}#website`,
    name: `Blog ${ORG_NAME}`,
    url: BASE_URL,
    publisher: { "@id": `${STORE_URL}#organization` },
    inLanguage: ["pt-BR", "en"],
  };
}

export function postLanguagesAlternates(
  ptSlug: string,
  enSlug: string | null,
  isEn: boolean
) {
  const langs: Record<string, string> = {};
  langs["pt-BR"] = `${BASE_URL}/${ptSlug}`;
  if (enSlug) {
    langs["en"] = `${BASE_URL}/en/${enSlug}`;
    langs["en-US"] = `${BASE_URL}/en/${enSlug}`;
  }
  langs["x-default"] = isEn && enSlug
    ? `${BASE_URL}/en/${enSlug}`
    : `${BASE_URL}/${ptSlug}`;
  return langs;
}
