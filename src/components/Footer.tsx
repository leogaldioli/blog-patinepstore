export default function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #282828, #2a2a3a)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 16px 24px",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.5px",
                }}
              >
                patinep store
              </span>
              <span style={{ fontSize: 16, color: "#FCC425" }}>⚡</span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                fontWeight: 500,
                maxWidth: 260,
                lineHeight: 1.5,
              }}
            >
              Especialistas em micromobilidade elétrica em Maringá, PR. 6+ anos,
              +3.000 clientes, nota 4.9 no Google.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Loja
            </span>
            {[
              { label: "Site da loja", href: "https://patinepstore.com.br" },
              {
                label: "Patinetes elétricos",
                href: "https://lps.patinepstore.com.br/lp-patinete",
              },
              {
                label: "Scooters elétricas",
                href: "https://lps.patinepstore.com.br/lp-scooter",
              },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            marginTop: 24,
            paddingTop: 16,
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} Patinep Store — Maringá, PR. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
