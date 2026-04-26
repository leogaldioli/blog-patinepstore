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
  title: "About Patinep Store",
  description:
    "Specialized electric scooter store in Maringá-PR, Brazil since 2020. Meet the team, mission and technical expertise in micro-mobility.",
  alternates: {
    canonical: `${BASE_URL}/en/about`,
    languages: {
      en: `${BASE_URL}/en/about`,
      "pt-BR": `${BASE_URL}/sobre`,
      "x-default": `${BASE_URL}/sobre`,
    },
  },
  openGraph: {
    title: "About Patinep Store",
    description:
      "Specialized electric scooter store in Maringá-PR, Brazil.",
    type: "profile",
    url: `${BASE_URL}/en/about`,
    locale: "en_US",
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${ORG_NAME}`,
    url: `${BASE_URL}/en/about`,
    inLanguage: "en",
    mainEntity: organizationSchema(),
  };

  const breadcrumbs = breadcrumbSchema([
    { name: "Blog", url: `${BASE_URL}/en` },
    { name: "About", url: `${BASE_URL}/en/about` },
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
        <Link href="/en" style={{ color: "var(--cinza-texto)", textDecoration: "none" }}>
          Blog
        </Link>
        <span>/</span>
        <span style={{ color: "var(--preto)" }}>About</span>
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
        About Patinep Store
      </h1>

      <div style={{ fontSize: 15, color: "var(--preto)", lineHeight: 1.7, fontWeight: 500 }}>
        <p style={{ marginBottom: 16 }}>
          <strong>Patinep Store</strong> is a specialized electric scooter and
          micro-mobility store based in <strong>Maringá-PR, Brazil</strong>. We
          serve everyday riders, delivery couriers and businesses with sales,
          maintenance and technical consulting.
        </p>
        <p style={{ marginBottom: 16 }}>
          This blog is where our team shares what we learn day-to-day in the
          shop: honest comparisons between models, maintenance guides tested on
          our own bench, clarifications on Brazilian regulations (CONTRAN
          996/2023) and Maringá&rsquo;s local rules, plus practical tips for
          anyone using an electric scooter for commuting or delivery work.
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
          Our methodology
        </h2>
        <p style={{ marginBottom: 16 }}>
          Every article is reviewed against our team&rsquo;s hands-on
          experience with hundreds of models sold and serviced. When we cite
          numbers (range, top speed, weight, price), they come from:
        </p>
        <ul style={{ marginBottom: 16, paddingLeft: 24, lineHeight: 1.8 }}>
          <li>Manufacturer official specifications</li>
          <li>
            In-house tests under real conditions (urban Maringá terrain, rider
            70-90 kg)
          </li>
          <li>Published legislation (CONTRAN, municipal laws)</li>
          <li>
            Maintenance and defect history from our service department
          </li>
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
          Contact &amp; physical store
        </h2>
        <p style={{ marginBottom: 16 }}>
          Store: <strong>Maringá-PR, Brazil</strong>. Visit{" "}
          <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#FCC425", fontWeight: 700 }}
          >
            patinepstore.com.br
          </a>{" "}
          for catalog, maintenance bookings, and customer support.
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
          Visit the store →
        </a>
      </div>
    </div>
  );
}
