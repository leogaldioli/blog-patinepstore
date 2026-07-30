// Reabastece a fila de tópicos. Agendado na VPS antes do cron de geração:
//   30 7 * * * curl "http://localhost:7013/api/cron/topics?secret=$CRON_SECRET"
// Idempotente: se a fila tem >= 15 pendentes, só destrava/re-enfileira e sai.

import { NextRequest, NextResponse } from "next/server";
import { refillTopics } from "@/lib/topics";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // force=1: gera um lote novo mesmo com a fila cheia (uso manual/teste)
    const force = req.nextUrl.searchParams.get("force") === "1";
    const summary = await refillTopics(force);
    return NextResponse.json(summary);
  } catch (err) {
    const detail = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[cron/topics] refill falhou:", detail);
    return NextResponse.json({ error: "Refill falhou", detail }, { status: 500 });
  }
}
