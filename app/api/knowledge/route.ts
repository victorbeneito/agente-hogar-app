import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { openai, EMBEDDING_MODEL } from "@/lib/openai";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: documents, error } = await supabaseAdmin
    .from("knowledge_base")
    .select("id, title, content, category, created_at, updated_at")
    .order("category", { ascending: true })
    .order("title", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ documents: documents ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title = (body?.title as string | undefined)?.trim();
  const content = (body?.content as string | undefined)?.trim();
  const category = body?.category as string | undefined;

  if (!title || !content || !category) {
    return NextResponse.json({ error: "title, content y category son obligatorios" }, { status: 400 });
  }

  const embeddingRes = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: content });
  const embedding = embeddingRes.data[0].embedding;

  const { data: document, error } = await supabaseAdmin
    .from("knowledge_base")
    .insert({ title, content, category, embedding })
    .select("id, title, content, category, created_at, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ document });
}
