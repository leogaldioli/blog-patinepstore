// Varredura diária de novidades (web search) → tópicos prioridade 10 com
// fatos pesquisados. Agendado ANTES do refill/geração:
//   0 7 * * * curl "http://localhost:7013/api/cron/news?secret=$CRON_SECRET"
// Dias sem novidade relevante inserem 0 tópicos (comportamento esperado).

import { NextRequest, NextResponse } from "next/server";
import { sweepNews } from "@/lib/news";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const summary = await sweepNews();
    return NextResponse.json(summary);
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[cron/news] varredura falhou:", detail);
    return NextResponse.json({ error: "Varredura falhou", detail }, { status: 500 });
  }
}
