import { supabase, BlogPost, CATEGORY_LABELS_EN } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://blog.patinepstore.com.br";

type Props = { params: Promise<{ slug: string }> };

async function getPost(slug: string): Promise<BlogPost | null> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("lang", "en")
    .eq("status", "published")
    .maybeSingle();
  return (data as BlogPost) || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.meta_description,
    openGraph: {
      title: post.title,
      description: post.meta_description,
      type: "article",
      publishedTime: post.published_at,
      locale: "en_US",
    },
    alternates: {
      canonical: `${BASE_URL}/en/${slug}`,
      languages: {
        "en": `${BASE_URL}/en/${slug}`,
        ...(post.original_slug ? { "pt-BR": `${BASE_URL}/${post.original_slug}` } : {}),
      },
    },
  };
}

export default async function EnPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const categoryLabel = CATEGORY_LABELS_EN[post.category] || post.category;
  const date = new Date(post.published_at).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description,
    author: { "@type": "Organization", name: "Patinep Store" },
    publisher: {
      "@type": "Organization",
      name: "Patinep Store",
      url: "https://patinepstore.com.br",
    },
    datePublished: post.published_at,
    inLanguage: "en",
  };

  const faqSchema = post.faq_json?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq_json.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article>
        {/* Hero */}
        <div
          style={{
            background: "linear-gradient(135deg, #282828, #2a2a3a)",
            padding: "36px 16px 32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              position: "absolute",
              right: -16,
              top: -16,
              fontSize: 160,
              opacity: 0.04,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            ⚡
          </span>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 14, flexWrap: "wrap" }}>
              <Link
                href={`/en/categoria/${post.category}`}
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#FCC425",
                  background: "rgba(252,196,37,0.12)",
                  padding: "3px 12px",
                  borderRadius: 20,
                  textDecoration: "none",
                  letterSpacing: "0.3px",
                }}
              >
                {categoryLabel}
              </Link>
              {post.original_slug && (
                <Link
                  href={`/${post.original_slug}`}
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "3px 10px",
                    borderRadius: 20,
                    textDecoration: "none",
                    letterSpacing: "0.3px",
                  }}
                >
                  Ler em Português →
                </Link>
              )}
            </div>
            <h1
              style={{
                fontSize: "clamp(22px, 4vw, 30px)",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
                marginBottom: 14,
              }}
            >
              {post.title}
            </h1>
            <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                Patinep Store
              </span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                {date}
              </span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                {post.reading_time_min} min read
              </span>
            </div>
          </div>
        </div>

        {/* Yellow bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #FCC425, #E0AB00)" }} />

        {/* Content */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

          {/* FAQ */}
          {post.faq_json && post.faq_json.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--preto)",
                  marginBottom: 20,
                  letterSpacing: "-0.3px",
                }}
              >
                Frequently Asked Questions
              </h2>
              <div className="flex flex-col" style={{ gap: 12 }}>
                {post.faq_json.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#ffffff",
                      borderRadius: 12,
                      padding: "16px 20px",
                      boxShadow: "var(--sombra-card)",
                      borderLeft: "3px solid #FCC425",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--preto)",
                        marginBottom: 6,
                      }}
                    >
                      {item.question}
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "var(--cinza-texto)",
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          {post.cta_html && (
            <div
              style={{
                marginTop: 40,
                background: "linear-gradient(135deg, #282828, #2a2a3a)",
                borderRadius: 16,
                padding: "24px 24px 20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  right: -8,
                  bottom: -12,
                  fontSize: 80,
                  opacity: 0.06,
                  userSelect: "none",
                }}
              >
                ⚡
              </span>
              <div
                className="cta-box"
                dangerouslySetInnerHTML={{ __html: post.cta_html }}
              />
            </div>
          )}

          {/* Back */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--cinza-medio)" }}>
            <Link
              href="/en"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--cinza-texto)",
                textDecoration: "none",
              }}
            >
              ← Back to blog
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
