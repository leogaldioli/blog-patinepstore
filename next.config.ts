import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  // pg roda só no server (Postgres da VPS pós-migração do Supabase)
  serverExternalPackages: ["pg"],
  async rewrites() {
    return [
      { source: "/memento/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/memento/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/memento/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  // basePath: '/blog', // ← ativar após migrar site principal para a VPS (Fase 5)
};

export default nextConfig;
