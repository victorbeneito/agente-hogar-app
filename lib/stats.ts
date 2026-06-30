import { supabaseAdmin } from "@/lib/supabase";

function startOfTodayIso(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

export interface Stats {
  visitorsToday: number;
  chatsIniciados: number;
  esperandoHumano: number;
  resueltosPorBot: number;
  pctResueltos: number;
}

export async function getStats(): Promise<Stats> {
  const since = startOfTodayIso();

  const { count: visitorsToday } = await supabaseAdmin
    .from("visitors")
    .select("id", { count: "exact", head: true })
    .gte("first_seen", since);

  const { data: conversationsToday } = await supabaseAdmin
    .from("conversations")
    .select("id, status")
    .gte("created_at", since);

  const chatsIniciados = conversationsToday?.length ?? 0;
  const esperandoHumano = (conversationsToday ?? []).filter((c) => c.status === "waiting_human").length;

  let resueltosPorBot = 0;
  if (conversationsToday && conversationsToday.length > 0) {
    const ids = conversationsToday.map((c) => c.id);
    const { data: humanMsgs } = await supabaseAdmin
      .from("messages")
      .select("conversation_id")
      .eq("role", "human_agent")
      .in("conversation_id", ids);

    const conversationsWithHuman = new Set((humanMsgs ?? []).map((m) => m.conversation_id));
    resueltosPorBot = conversationsToday.filter((c) => !conversationsWithHuman.has(c.id)).length;
  }

  const pctResueltos = chatsIniciados > 0 ? Math.round((resueltosPorBot / chatsIniciados) * 100) : 0;

  return {
    visitorsToday: visitorsToday ?? 0,
    chatsIniciados,
    esperandoHumano,
    resueltosPorBot,
    pctResueltos,
  };
}
