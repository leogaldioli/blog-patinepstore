import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // basePath: '/blog', // ← ativar após migrar site principal para a VPS (Fase 5)
};

export default nextConfig;
