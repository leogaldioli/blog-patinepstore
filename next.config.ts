import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // pg roda só no server (Postgres da VPS pós-migração do Supabase)
  serverExternalPackages: ["pg"],
  // basePath: '/blog', // ← ativar após migrar site principal para a VPS (Fase 5)
};

export default nextConfig;
