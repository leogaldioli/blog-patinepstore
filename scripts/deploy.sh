#!/usr/bin/env bash
# Deploy manual do blog-patinepstore para VPS — build LOCAL no Mac.
#
# NUNCA rode `next build` na VPS: 8GB compartilhados com ~15 apps; um build
# pesado na VPS já derrubou a máquina inteira por OOM (incidente 10/jun/2026).
# As NEXT_PUBLIC_* (inlined no bundle) são puxadas do .env.production da VPS
# na hora do build — fonte única de verdade.
#
# Uso: ./scripts/deploy.sh
set -euo pipefail

VPS_HOST="46.202.147.81"
VPS_USER="root"
DEPLOY_PATH="/opt/blog-patinepstore"
APP_NAME="blog-patinepstore"
HEALTH_URL="https://blog.patinepstore.com.br"

cd "$(dirname "$0")/.."

echo "🔑 Puxando NEXT_PUBLIC_* do .env.production da VPS..."
eval "$(ssh "${VPS_USER}@${VPS_HOST}" "grep -E '^NEXT_PUBLIC_(SUPABASE_URL|SUPABASE_ANON_KEY|BASE_URL)=' ${DEPLOY_PATH}/.env.production" | sed 's/^/export /')"
: "${NEXT_PUBLIC_SUPABASE_URL:?não encontrada no .env.production da VPS}"

echo "🏗  Build local do Next.js..."
npm run build

# standalone pode vir aninhado (Next infere workspace root errado)
STANDALONE=".next/standalone"
if [ ! -f "$STANDALONE/server.js" ]; then
  NESTED=$(find .next/standalone -maxdepth 4 -name server.js | head -1)
  [ -n "$NESTED" ] || { echo "❌ server.js não encontrado — build falhou?"; exit 1; }
  STANDALONE=$(dirname "$NESTED")
fi

echo "📦 Empacotando artefatos (standalone em $STANDALONE)..."
STAGE=$(mktemp -d "/tmp/${APP_NAME}-deploy-XXXXXX")
cp -R "$STANDALONE/" "$STAGE/standalone/"
cp -R .next/static "$STAGE/static"
cp -R public "$STAGE/public"

cat > "$STAGE/Dockerfile.prebuilt" << 'DOCKER'
# Imagem montada a partir de artefatos buildados FORA da VPS. Só COPY.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY standalone/ ./
COPY static/ ./.next/static
COPY public/ ./public
RUN chown -R nextjs:nodejs /app/.next
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
DOCKER

TARBALL="/tmp/${APP_NAME}-prebuilt.tar.gz"
COPYFILE_DISABLE=1 tar czf "$TARBALL" -C "$STAGE" .
echo "   pacote: $(du -h "$TARBALL" | cut -f1)"

echo "🚀 Enviando e subindo na VPS..."
scp -q "$TARBALL" "${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/_prebuilt.tar.gz"
ssh "${VPS_USER}@${VPS_HOST}" bash -s << EOF
set -euo pipefail
cd "${DEPLOY_PATH}"
rm -rf _prebuilt && mkdir _prebuilt
tar xzf _prebuilt.tar.gz -C _prebuilt
docker build -q -t "${APP_NAME}:latest" -f _prebuilt/Dockerfile.prebuilt _prebuilt
docker compose -f docker-compose.prod.yml up -d --force-recreate
rm -rf _prebuilt _prebuilt.tar.gz
docker image prune -f > /dev/null
EOF

rm -rf "$STAGE" "$TARBALL"

echo "⏳ Verificando..."
sleep 8
ssh "${VPS_USER}@${VPS_HOST}" "docker ps --filter name=${APP_NAME} --format '{{.Names}} {{.Status}}'"
curl -s -o /dev/null -w "${HEALTH_URL} → %{http_code}\n" "$HEALTH_URL"
echo "✅ Deploy concluído"
