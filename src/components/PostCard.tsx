import Link from "next/link";
import { BlogPost, CATEGORY_LABELS } from "@/lib/supabase";

type Props = {
  post: BlogPost;
};

export default function PostCard({ post }: Props) {
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;
  const date = new Date(post.published_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Link href={`/${post.slug}`} style={{ textDecoration: "none" }}>
      <article
        style={{
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "var(--sombra-card)",
          overflow: "hidden",
          transition: "box-shadow 0.2s, transform 0.2s",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "var(--sombra-hover)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "var(--sombra-card)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        {/* Header do card — dark com accent amarelo */}
        <div
          style={{
            background: "linear-gradient(135deg, #282828, #2a2a3a)",
            padding: "20px 20px 16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Raio decorativo */}
          <span
            style={{
              position: "absolute",
              right: -8,
              top: -8,
              fontSize: 64,
              opacity: 0.05,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            ⚡
          </span>

          {/* Badge de categoria */}
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              color: "#FCC425",
              background: "rgba(252,196,37,0.12)",
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: "0.3px",
              marginBottom: 10,
            }}
          >
            {categoryLabel}
          </span>

          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.35,
              letterSpacing: "-0.2px",
              margin: 0,
            }}
          >
            {post.title}
          </h2>
        </div>

        {/* Body do card */}
        <div
          style={{
            padding: "14px 20px 18px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--cinza-texto)",
              lineHeight: 1.5,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.meta_description}
          </p>

          <div
            className="flex items-center justify-between"
            style={{ marginTop: 4 }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--cinza-texto)" }}>
              {date}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--cinza-texto)",
              }}
            >
              {post.reading_time_min} min de leitura
            </span>
          </div>
        </div>

        {/* Barra amarela no rodapé do card */}
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, #FCC425, #E0AB00)",
          }}
        />
      </article>
    </Link>
  );
}
