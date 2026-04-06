import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/supabase";

const destaque = ["guia-de-compra", "manutencao", "regulamentacao", "delivery"];

export default function Header() {
  return (
    <header
      style={{
        background: "linear-gradient(135deg, #282828, #2a2a3a)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Barra principal */}
      <div
        className="flex items-center justify-between"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 16px 12px" }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.5px",
                lineHeight: 1,
              }}
            >
              patinep
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                paddingTop: 1,
              }}
            >
              blog
            </span>
            <span
              style={{ fontSize: 16, color: "#FCC425", marginLeft: 2, lineHeight: 1 }}
            >
              ⚡
            </span>
          </div>
        </Link>

        <a
          href="https://patinepstore.com.br"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#FCC425",
            color: "#282828",
            fontWeight: 700,
            fontSize: 13,
            padding: "8px 16px",
            borderRadius: 12,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Ir para a loja
        </a>
      </div>

      {/* Navegação por categorias */}
      <nav
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 16px 12px",
          overflowX: "auto",
        }}
      >
        <div className="flex gap-2" style={{ whiteSpace: "nowrap" }}>
          {destaque.map((cat) => (
            <Link
              key={cat}
              href={`/categoria/${cat}`}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                padding: "4px 12px",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.12)",
                textDecoration: "none",
              }}
            >
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
          <Link
            href="/"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(252, 196, 37, 0.8)",
              padding: "4px 12px",
              textDecoration: "none",
            }}
          >
            Ver todas →
          </Link>
        </div>
      </nav>
    </header>
  );
}
