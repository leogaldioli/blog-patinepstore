import type { Metadata } from "next";
import Link from "next/link";
import {
  BASE_URL,
  STORE_URL,
  ORG_NAME,
  organizationSchema,
  breadcrumbSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sobre o Patinep Store",
  description:
    "Loja especializada em patinetes e scooters elétricos em Maringá-PR desde 2020. Conheça a equipe, missão e expertise técnica em micromobilidade.",
  alternates: {
    canonical: `${BASE_URL}/sobre`,
    languages: {
      "pt-BR": `${BASE_URL}/sobre`,
      en: `${BASE_URL}/en/about`,
      "x-default": `${BASE_URL}/sobre`,
    },
  },
  openGraph: {
    title: "Sobre o Patinep Store",
    description:
      "Loja especializada em patinetes e scooters elétricos em Maringá-PR.",
    type: "profile",
    url: `${BASE_URL}/sobre`,
  },
};

export default function SobrePage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `Sobre o ${ORG_NAME}`,
    url: `${BASE_URL}/sobre`,
    inLanguage: "pt-BR",
    mainEntity: organizationSchema(),
  };

  const breadcrumbs = breadcrumbSchema([
    { name: "Blog", url: `${BASE_URL}/` },
    { name: "Sobre", url: `${BASE_URL}/sobre` },
  ]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px 64px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--cinza-texto)",
          marginBottom: 16,
        }}
      >
        <Link href="/" style={{ color: "var(--cinza-texto)", textDecoration: "none" }}>
          Blog
        </Link>
        <span>/</span>
        <span style={{ color: "var(--preto)" }}>Sobre</span>
      </nav>

      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "var(--preto)",
          letterSpacing: "-0.5px",
          marginBottom: 20,
        }}
      >
        Sobre a Patinep Store
      </h1>

      <div style={{ fontSize: 15, color: "var(--preto)", lineHeight: 1.7, fontWeight: 500 }}>
        <p style={{ marginBottom: 16 }}>
          A <strong>Patinep Store</strong> é uma loja especializada em patinetes
          e scooters elétricos em <strong>Maringá-PR</strong>. Atendemos
          consumidores finais, entregadores e empresas de delivery com vendas,
          manutenção e consultoria técnica em micromobilidade.
        </p>
        <p style={{ marginBottom: 16 }}>
          Este blog é o espaço onde nossa equipe compartilha o que aprende no
          dia a dia da loja: comparativos honestos entre modelos, guias de
          manutenção testados em bancada, esclarecimentos sobre a{" "}
          <strong>Resolução CONTRAN 996/2023</strong> e as regras locais de
          Maringá, e dicas práticas para quem usa patinete elétrico como meio
          de transporte ou ferramenta de trabalho.
        </p>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--preto)",
            marginTop: 32,
            marginBottom: 12,
            letterSpacing: "-0.3px",
          }}
        >
          Nossa metodologia
        </h2>
        <p style={{ marginBottom: 16 }}>
          Cada artigo passa por revisão técnica baseada na experiência prática
          da equipe com centenas de modelos vendidos e atendidos em assistência
          técnica. Quando citamos números (autonomia, velocidade, peso, preço),
          eles vêm de:
        </p>
        <ul style={{ marginBottom: 16, paddingLeft: 24, lineHeight: 1.8 }}>
          <li>Especificações oficiais dos fabricantes</li>
          <li>
            Testes próprios em condições reais (terreno urbano de Maringá,
            piloto entre 70-90 kg)
          </li>
          <li>Legislação publicada (CONTRAN, leis municipais)</li>
          <li>Histórico de manutenção e defeitos atendidos pela loja</li>
        </ul>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--preto)",
            marginTop: 32,
            marginBottom: 12,
            letterSpacing: "-0.3px",
          }}
        >
          Contato e loja física
        </h2>
        <p style={{ marginBottom: 16 }}>
          Loja: <strong>Maringá-PR, Brasil</strong>. Visite{" "}
          <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#FCC425", fontWeight: 700 }}
          >
            patinepstore.com.br
          </a>{" "}
          para ver catálogo, agendar manutenção ou tirar dúvidas com nosso
          atendimento.
        </p>
      </div>

      <div style={{ marginTop: 40 }}>
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "#FCC425",
            color: "#282828",
            fontWeight: 700,
            fontSize: 14,
            padding: "10px 20px",
            borderRadius: 12,
            textDecoration: "none",
          }}
        >
          Visitar a loja →
        </a>
      </div>
    </div>
  );
}
