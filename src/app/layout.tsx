import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  BASE_URL,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Blog Patinep Store — Patinetes e Scooters Elétricos",
    template: "%s | Patinep Store",
  },
  description:
    "Guias, comparativos, manutenção e tudo sobre patinetes elétricos, scooters e bicicletas elétricas. Especialistas em micromobilidade em Maringá.",
  metadataBase: new URL(BASE_URL),
  applicationName: "Patinep Store Blog",
  authors: [{ name: "Patinep Store", url: "https://patinepstore.com.br" }],
  keywords: [
    "patinete elétrico",
    "scooter elétrico",
    "micromobilidade",
    "patinete Maringá",
    "patinete adulto",
    "patinete infantil",
    "regulamentação patinete",
    "manutenção patinete",
  ],
  openGraph: {
    siteName: "Patinep Store",
    locale: "pt_BR",
    type: "website",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    site: "@patinepstore",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "pt-BR": BASE_URL,
      "en": `${BASE_URL}/en`,
      "x-default": BASE_URL,
    },
  },
  verification: {
    google: "HVh9Tc4Q9X21tqIER7ywWU8BHD6RQ8lI0Fvc1A5Sj1A",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <GoogleTagManager gtmId="GTM-KV8ZKF3X" />
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema()),
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: "var(--creme)" }}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
