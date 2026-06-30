import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStats } from "@/lib/stats";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const stats = await getStats();
  return NextResponse.json(stats);
}
