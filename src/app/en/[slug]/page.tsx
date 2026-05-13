import { supabase, BlogPost, CATEGORY_LABELS_EN } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  BASE_URL,
  articleSchema,
  faqSchema,
  breadcrumbSchema,
  postLanguagesAlternates,
  stripLeadingH1,
  extractTldr,
  addUtmToCtaHtml,
} from "@/lib/seo";
import CtaTracker from "@/components/CtaTracker";

export const revalidate = 3600;

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

async function getRelatedPosts(
  category: string,
  excludeSlug: string
): Promise<BlogPost[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("lang", "en")
    .eq("category", category)
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(3);
  return (data as BlogPost[]) || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };

  const url = `${BASE_URL}/en/${slug}`;
  const ptSlug = post.original_slug;
  return {
    title: post.title,
    description: post.meta_description,
    openGraph: {
      title: post.title,
      description: post.meta_description,
      type: "article",
      url,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      locale: "en_US",
      authors: ["Patinep Store"],
      section: CATEGORY_LABELS_EN[post.category] || post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.meta_description,
    },
    alternates: {
      canonical: url,
      languages: postLanguagesAlternates(ptSlug || slug, slug, true),
    },
  };
}

export default async function EnPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.category, slug);

  const categoryLabel = CATEGORY_LABELS_EN[post.category] || post.category;
  const date = new Date(post.published_at).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const tldr = extractTldr(post.content_html);
  const cleanedContent = stripLeadingH1(post.content_html);

  const schemas = [
    articleSchema({ post }),
    faqSchema(post.faq_json),
    breadcrumbSchema([
      { name: "Blog", url: `${BASE_URL}/en` },
      {
        name: categoryLabel,
        url: `${BASE_URL}/en/categoria/${post.category}`,
      },
      { name: post.title, url: `${BASE_URL}/en/${slug}` },
    ]),
  ].filter(Boolean);

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}

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
            {/* Breadcrumbs */}
            <nav
              aria-label="Breadcrumb"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 14,
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
                fontWeight: 600,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/en"
                style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
              >
                Blog
              </Link>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>
              <Link
                href={`/en/categoria/${post.category}`}
                style={{ color: "#FCC425", textDecoration: "none" }}
              >
                {categoryLabel}
              </Link>
            </nav>

            <div
              className="flex items-center gap-3"
              style={{ marginBottom: 14, flexWrap: "wrap" }}
            >
              {post.original_slug && (
                <Link
                  href={`/${post.original_slug}`}
                  hrefLang="pt-BR"
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
            <div
              className="flex items-center gap-3"
              style={{ flexWrap: "wrap" }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 500,
                }}
              >
                Patinep Store
              </span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <time
                dateTime={post.published_at}
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 500,
                }}
              >
                {date}
              </time>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 500,
                }}
              >
                {post.reading_time_min} min read
              </span>
            </div>
          </div>
        </div>

        {/* Yellow bar */}
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, #FCC425, #E0AB00)",
          }}
        />

        {/* Content */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
          {/* TL;DR */}
          {tldr && (
            <aside
              aria-label="Summary"
              style={{
                background: "#ffffff",
                borderLeft: "3px solid #FCC425",
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 28,
                boxShadow: "var(--sombra-card)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#FCC425",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Summary
              </div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--preto)",
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {tldr}
              </p>
            </aside>
          )}

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: cleanedContent }}
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
            <>
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
                  dangerouslySetInnerHTML={{
                    __html: addUtmToCtaHtml(post.cta_html, slug),
                  }}
                />
              </div>
              <CtaTracker slug={slug} />
            </>
          )}

          {/* Related posts */}
          {related.length > 0 && (
            <section aria-label="Related articles" style={{ marginTop: 48 }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--preto)",
                  marginBottom: 20,
                  letterSpacing: "-0.3px",
                }}
              >
                Keep reading about {categoryLabel}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 14,
                }}
              >
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/en/${r.slug}`}
                    style={{
                      display: "block",
                      background: "#ffffff",
                      borderRadius: 12,
                      padding: "14px 16px",
                      textDecoration: "none",
                      boxShadow: "var(--sombra-card)",
                      borderTop: "3px solid #FCC425",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#FCC425",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {categoryLabel}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--preto)",
                        lineHeight: 1.3,
                        marginBottom: 6,
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--cinza-texto)",
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                      }}
                    >
                      {r.meta_description}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back */}
          <div
            style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: "1px solid var(--cinza-medio)",
            }}
          >
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
