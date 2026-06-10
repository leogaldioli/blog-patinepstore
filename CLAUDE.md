@AGENTS.md

## Deploy (Produção)

**Caminho único: `./scripts/deploy.sh`** — `next build` roda LOCALMENTE no Mac (NEXT_PUBLIC_* puxadas do `.env.production` da VPS via SSH na hora do build); a VPS só monta imagem COPY-only. **NUNCA buildar na VPS** — 8GB / ~15 apps; build de Next na VPS já derrubou a máquina inteira por OOM (10/jun/2026).
