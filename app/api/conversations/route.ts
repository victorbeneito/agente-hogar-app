import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status"); // 'open' | 'closed' | null (todas)
  const q = searchParams.get("q");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabaseAdmin
    .from("conversations")
    .select("id, session_id, status, created_at, updated_at, metadata")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (status === "open") {
    query = query.neq("status", "closed");
  } else if (status === "closed") {
    query = query.eq("status", "closed");
  }

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  if (q) {
    const { data: matchingMessages } = await supabaseAdmin
      .from("messages")
      .select("conversation_id")
      .ilike("content", `%${q}%`);

    const ids = [...new Set((matchingMessages ?? []).map((m) => m.conversation_id))];
    if (ids.length === 0) {
      return NextResponse.json({ conversations: [] });
    }
    query = query.in("id", ids);
  }

  const { data: conversations, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ conversations: conversations ?? [] });
}
