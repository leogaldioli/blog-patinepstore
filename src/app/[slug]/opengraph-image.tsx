import { ImageResponse } from "next/og";
import { supabase, CATEGORY_LABELS } from "@/lib/supabase";

export const alt = "Patinep Store — artigo sobre patinetes elétricos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, category")
    .eq("slug", slug)
    .eq("lang", "pt")
    .eq("status", "published")
    .maybeSingle();

  const title = post?.title || "Patinep Store";
  const category =
    (post?.category && CATEGORY_LABELS[post.category]) || "Patinep Store";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #282828 0%, #2a2a3a 100%)",
          padding: "60px 72px",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            fontSize: 360,
            opacity: 0.06,
            color: "#FCC425",
          }}
        >
          ⚡
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#FCC425",
              background: "rgba(252,196,37,0.14)",
              padding: "6px 16px",
              borderRadius: 999,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {category}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: title.length > 70 ? 48 : title.length > 50 ? 56 : 64,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-1.2px",
              maxWidth: 1050,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #FCC425",
            paddingTop: 20,
            zIndex: 1,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>
              patinep
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                paddingTop: 6,
              }}
            >
              blog
            </span>
          </div>
          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.55)" }}>
            blog.patinepstore.com.br
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
