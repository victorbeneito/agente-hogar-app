import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendHumanMessage } from "@/lib/conversations";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const content = (body?.content as string | undefined)?.trim();

  if (!content) {
    return NextResponse.json({ error: "content es obligatorio" }, { status: 400 });
  }

  await sendHumanMessage(id, content);

  return NextResponse.json({ ok: true });
}
