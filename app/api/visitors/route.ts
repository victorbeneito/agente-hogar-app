import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const since = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();

  const { data: visitors, error } = await supabaseAdmin
    .from("visitors")
    .select("*")
    .gte("last_seen", since)
    .order("last_seen", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ visitors: visitors ?? [] });
}
