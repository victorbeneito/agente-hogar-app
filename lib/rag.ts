import { supabaseAdmin } from "@/lib/supabase";
import { openai, EMBEDDING_MODEL } from "@/lib/openai";

const MATCH_THRESHOLD = 0.35;
const MATCH_COUNT = 6;

export async function searchKnowledgeBase(query: string) {
  const embeddingRes = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
  });
  const queryEmbedding = embeddingRes.data[0].embedding;

  const { data: matches } = await supabaseAdmin.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
  });

  return (matches ?? []).map((m: { title: string; content: string; category: string }) => ({
    titulo: m.title,
    categoria: m.category,
    contenido: m.content,
  }));
}
