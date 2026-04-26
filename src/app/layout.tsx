import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Blog Patinep Store — Patinetes e Scooters Elétricos",
    template: "%s | Patinep Store",
  },
  description:
    "Guias, comparativos, manutenção e tudo sobre patinetes elétricos, scooters e bicicletas elétricas. Especialistas em micromobilidade em Maringá.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://blog.patinepstore.com.br"
  ),
  openGraph: {
    siteName: "Patinep Store",
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
