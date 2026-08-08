This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Esteira de conteúdo (automática)

Pipeline auto-abastecida rodando via cron na VPS (`crontab -l` como root), todos os endpoints protegidos por `?secret=$CRON_SECRET`:

### Provedores de IA

A esteira tenta a Anthropic primeiro e usa o DeepSeek V4 Pro via OpenRouter
quando a chamada principal falha. Configure as variáveis abaixo no
`.env.production` da VPS (nunca salve a chave no Git):

```dotenv
ANTHROPIC_API_KEY=...
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=deepseek/deepseek-v4-pro
```

`OPENROUTER_MODEL` é opcional. Os resultados dos crons e as notificações de
posts no Telegram informam o modelo efetivamente usado em PT e EN.

| Horário (UTC) | Endpoint | Função |
|---|---|---|
| 07:00 diário | `/api/cron/news` | Varredura de novidades com web search (legislação, mercado, tendências, curiosidades — nunca acidentes nem marcas concorrentes): cria 0-2 tópicos prioridade 10 com os fatos pesquisados salvos em `blog_topics.research`, que o redator usa como fonte |
| 07:30 diário | `/api/cron/topics` | Reabastece a fila: destrava `generating`, re-enfileira `error` (retry < 3) e, se pending < 15, gera ~30 tópicos novos com Claude (dedupe contra todos os keywords já usados) |
| 08:00 diário | `/api/cron/generate?limit=2` | Gera 2 posts PT (Claude com fallback DeepSeek V4 Pro + fact-check) + versão EN de cada |
| 09:00 diário | `/api/cron/translate` | Rede de segurança: traduz posts PT sem versão EN |

Sob demanda:
- `/api/cron/status` — saúde da esteira (503 se travada: fila vazia + sem post há 72h). Apontar no Uptime Kuma.
- `/api/cron/refresh-ctas?limit=10` — retrofit: posts de manutenção/técnico ganham CTA de assistência (WhatsApp) no lugar do CTA de venda. Rodar em loop até `remaining: 0`.
- `/api/cron/optimize-meta?slugs=a,b,c` — reescreve title/meta de posts com CTR ruim no GSC (URL não muda).

CTA por intenção (`src/lib/generate.ts`): categoria `manutencao`/`tecnico` ou keyword de defeito → WhatsApp da assistência (`wa.me/554491024396`); resto → LP de venda. Racional: GSC mostrou que os posts top são de defeito (leitor já TEM patinete) e o repasse blog→site era ~1% com CTA de venda.

GEO/AEO: `/llms.txt` dinâmico + AI crawlers liberados no `robots.txt` — o conteúdo EN existe para answer engines citarem a loja.
