#!/usr/bin/env bash
# Deploy manual do blog-patinepstore para VPS
# Uso: ./scripts/deploy.sh [--skip-tests]
set -euo pipefail

VPS_HOST="46.202.147.81"
VPS_USER="root"
DEPLOY_PATH="/opt/blog-patinepstore"
APP_NAME="blog-patinepstore"

SKIP_TESTS=false
for arg in "$@"; do
  case $arg in
    --skip-tests) SKIP_TESTS=true ;;
  esac
done

# Testes (não há testes no blog por ora)
if [ "$SKIP_TESTS" = false ]; then
  echo "Sem testes configurados, pulando..."
fi

echo "Empacotando código..."
TMPFILE=$(mktemp /tmp/deploy-blog-XXXXXX.tar.gz)
tar czf "$TMPFILE" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude='.env*' \
  --exclude='*.env' \
  --exclude=.DS_Store \
  .

SIZE=$(du -h "$TMPFILE" | cut -f1)
echo "Pacote: $SIZE"

echo "Enviando para VPS..."
scp "$TMPFILE" "${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/_build.tar.gz"
rm "$TMPFILE"

echo "Buildando e deployando na VPS..."
ssh "${VPS_USER}@${VPS_HOST}" bash -s <<'REMOTE'
set -euo pipefail
cd /opt/blog-patinepstore

rm -rf _build
mkdir _build
tar xzf _build.tar.gz -C _build 2>/dev/null
rm _build.tar.gz

SUPABASE_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.production | cut -d= -f2-)
SUPABASE_KEY=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.production | cut -d= -f2-)
BASE_URL=$(grep '^NEXT_PUBLIC_BASE_URL=' .env.production | cut -d= -f2-)

cd _build
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_KEY" \
  --build-arg NEXT_PUBLIC_BASE_URL="$BASE_URL" \
  -t blog-patinepstore:latest .

cd /opt/blog-patinepstore
docker compose -f docker-compose.prod.yml up -d --force-recreate

rm -rf _build
docker image prune -f

echo ""
echo "=== Status ==="
docker ps --filter name=blog-patinepstore --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
REMOTE

echo ""
echo "Deploy concluído!"
