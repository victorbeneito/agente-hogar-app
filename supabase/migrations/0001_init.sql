-- ============================================================
-- Esquema inicial: Agente IA - El Hogar de Tus Sueños
-- Tablas: conversations, messages, visitors, knowledge_base
-- Función RAG: match_documents
-- ============================================================

-- Extensiones necesarias
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists vector;     -- pgvector (RAG embeddings)

-- ============================================================
-- Tabla: conversations
-- ============================================================
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null,
  status text not null default 'bot' check (status in ('bot', 'waiting_human', 'human', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb -- dispositivo, navegador, página de entrada
);

create index if not exists idx_conversations_status on conversations(status);
create index if not exists idx_conversations_session_id on conversations(session_id);
create index if not exists idx_conversations_updated_at on conversations(updated_at desc);

-- ============================================================
-- Tabla: messages
-- ============================================================
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'human_agent')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_messages_created_at on messages(created_at);

-- ============================================================
-- Tabla: visitors
-- ============================================================
create table if not exists visitors (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  ip text,
  country text,
  country_code text,
  city text,
  device text check (device in ('mobile', 'desktop', 'tablet')),
  browser text,
  current_page text,
  referrer text,
  pages_visited jsonb not null default '[]'::jsonb, -- array de {url, timestamp}
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  has_chatted boolean not null default false
);

create index if not exists idx_visitors_session_id on visitors(session_id);
create index if not exists idx_visitors_last_seen on visitors(last_seen desc);

-- ============================================================
-- Tabla: knowledge_base
-- ============================================================
create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text check (category in ('producto', 'envio', 'devolucion', 'faq', 'empresa')),
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_knowledge_base_category on knowledge_base(category);

-- Índice vectorial para búsqueda de similitud (ivfflat, coseno)
create index if not exists idx_knowledge_base_embedding on knowledge_base
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============================================================
-- Función RAG: match_documents
-- ============================================================
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table(id uuid, title text, content text, category text, similarity float)
language sql stable
as $$
  select id, title, content, category,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- ============================================================
-- Trigger: actualizar updated_at automáticamente
-- ============================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_conversations_updated_at on conversations;
create trigger trg_conversations_updated_at
  before update on conversations
  for each row execute function set_updated_at();

drop trigger if exists trg_knowledge_base_updated_at on knowledge_base;
create trigger trg_knowledge_base_updated_at
  before update on knowledge_base
  for each row execute function set_updated_at();

-- ============================================================
-- RLS (Row Level Security)
-- Activado en todas las tablas. Sin políticas públicas: solo la
-- service_role_key (usada en las API routes del servidor) puede
-- leer/escribir. La anon_key (embebida en widget.js/tracker.js)
-- queda bloqueada por defecto.
-- ============================================================
alter table conversations enable row level security;
alter table messages enable row level security;
alter table visitors enable row level security;
alter table knowledge_base enable row level security;

-- ============================================================
-- Realtime: habilitar replicación para panel admin en vivo
-- (idempotente: solo añade la tabla si no está ya en la publicación)
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table conversations;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'visitors'
  ) then
    alter publication supabase_realtime add table visitors;
  end if;
end $$;
