// Notificação de eventos da esteira no Telegram, via bot-patinep (endpoint
// POST /notify — rede Docker interna "easypanel"). Best-effort: se as envs
// não existem ou o bot está fora, loga e segue — nunca quebra a geração.
//   BOT_NOTIFY_URL=http://bot-patinep:8080/notify
//   BOT_NOTIFY_SECRET=<mesmo NOTIFY_SECRET do .env.production do bot>
//   BOT_NOTIFY_CHAT=-528351219  (grupo do time — o mesmo dos leads/vendas;
//                                sem essa env o bot usa o chat privado do dono)

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function notifyBot(message: string): Promise<void> {
  const url = process.env.BOT_NOTIFY_URL;
  const secret = process.env.BOT_NOTIFY_SECRET;
  if (!url || !secret) return; // notificação é opcional
  const chatId = Number(process.env.BOT_NOTIFY_CHAT) || undefined;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-notify-secret": secret },
      body: JSON.stringify({ message, ...(chatId ? { chat_id: chatId } : {}) }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.warn(`[notify] bot respondeu ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.warn("[notify] falha ao notificar bot:", err instanceof Error ? err.message : err);
  }
}
