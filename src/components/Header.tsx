"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORY_LABELS, CATEGORY_LABELS_EN } from "@/lib/supabase";

const destaque = ["guia-de-compra", "manutencao", "regulamentacao", "delivery"];

function getLangSwitcherHref(pathname: string): { href: string; label: string } {
  const isEn = pathname.startsWith("/en");

  if (isEn) {
    // EN → PT
    if (pathname === "/en") return { href: "/", label: "PT" };
    const rest = pathname.slice(3); // remove "/en"
    if (rest.startsWith("/categoria/")) return { href: rest, label: "PT" };
    // post page: go to PT home
    return { href: "/", label: "PT" };
  } else {
    // PT → EN
    if (pathname === "/") return { href: "/en", label: "EN" };
    if (pathname.startsWith("/categoria/")) return { href: "/en" + pathname, label: "EN" };
    // post page: go to EN home
    return { href: "/en", label: "EN" };
  }
}

export default function Header() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const labels = isEn ? CATEGORY_LABELS_EN : CATEGORY_LABELS;
  const categoryBase = isEn ? "/en/categoria" : "/categoria";
  const homeHref = isEn ? "/en" : "/";
  const { href: langHref, label: langLabel } = getLangSwitcherHref(pathname);

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
        <Link href={homeHref} style={{ textDecoration: "none" }}>
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

        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <Link
            href={langHref}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "5px 10px",
              borderRadius: 8,
              textDecoration: "none",
              letterSpacing: "0.5px",
            }}
          >
            {langLabel}
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
            {isEn ? "Visit store" : "Ir para a loja"}
          </a>
        </div>
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
              href={`${categoryBase}/${cat}`}
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
              {labels[cat]}
            </Link>
          ))}
          <Link
            href={homeHref}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(252, 196, 37, 0.8)",
              padding: "4px 12px",
              textDecoration: "none",
            }}
          >
            {isEn ? "All articles →" : "Ver todas →"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
