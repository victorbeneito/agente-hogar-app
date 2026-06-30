# Agente IA - El Hogar de Tus Sueños

## Objetivo del proyecto
Aplicación Next.js en Vercel (agente.elhogardetusuenos.com) que reemplaza tawk.to 
con sistema propio de atención al cliente con IA. Incluye widget de chat, panel admin 
web, tracking de visitantes en tiempo real y gestión completa desde móvil vía Telegram.

## Lo que hay que construir

### 1. Widget de chat embebible (public/widget.js)
- Botón flotante esquina inferior derecha
- Abre ventana de chat con el agente IA
- session_id único en localStorage por visitante
- Si cliente escribe "quiero hablar con persona" o similar → handoff humano
- Autocontenido (estilos inline, sin dependencias), menos de 30KB
- Se incrusta con:
  <script src="https://agente.elhogardetusuenos.com/widget.js" defer></script>

### 2. Script de tracking de visitantes (public/tracker.js)
Script SEPARADO del widget que se incrusta también en la tienda:
  <script src="https://agente.elhogardetusuenos.com/tracker.js" defer></script>

Funcionalidad:
- Detecta cuando un visitante llega a la tienda
- Recoge: IP, país (via api.ipapi.co gratuita), dispositivo (mobile/desktop), 
  navegador, página actual, página de origen (referrer)
- Envía datos a /api/track al cargar cada página
- Actualiza la página activa del visitante en tiempo real conforme navega
- Vincula al session_id para conectar tracking con conversaciones de chat
- Envía notificación Telegram al admin cuando llega un visitante nuevo

### 3. Panel admin en /admin (PWA instalable en móvil)
El panel debe funcionar como PWA (Progressive Web App) para instalarlo en el móvil
como si fuera una app nativa. Incluir manifest.json y service worker básico.

Secciones:
- **Visitantes en vivo**: mapa/lista de visitantes activos ahora mismo con país,
  dispositivo, página que están viendo, tiempo en el sitio, si han abierto el chat
- **Conversaciones**: lista de chats activos y pendientes de atención humana
- **Historial**: conversaciones pasadas con búsqueda por fecha y contenido
- **Tomar control**: admin escribe directamente en el chat, bot queda silenciado
- **Base de conocimiento**: añadir/editar/eliminar documentos que usa la IA
- **Estadísticas**: visitantes hoy/semana/mes, chats iniciados, % resueltos por bot,
  páginas más visitadas, países de origen, tiempo medio en el sitio

### 4. Telegram como interfaz móvil principal
Telegram actúa como la "app móvil" del sistema. El bot debe responder a comandos
y enviar notificaciones proactivas al admin.

Notificaciones automáticas que el bot envía:
- Visitante nuevo: "👤 Nuevo visitante desde 🇪🇸 España - Viendo: /estores-enrollables 
  - Dispositivo: móvil - IP: xxx.xxx.xxx.xxx"
- Chat iniciado: "💬 Nuevo chat abierto - Visitante desde España pregunta: [primer mensaje]"
- Handoff solicitado: "🚨 ATENCIÓN REQUERIDA - El cliente quiere hablar con una persona.
  Resumen: [últimos 3 mensajes] - Ver en panel: https://agente.elhogardetusuenos.com/admin"
- Chat cerrado: "✅ Conversación cerrada - Duración: 5 min - Resuelto por: bot"

Comandos que el admin puede enviar al bot de Telegram para gestionar desde móvil:
- /activos — lista visitantes en el sitio ahora mismo
- /chats — lista conversaciones abiertas
- /responder [session_id] [mensaje] — responde directamente al cliente desde Telegram
- /silenciar [session_id] — silencia el bot para esa conversación (toma control)
- /bot [session_id] — reactiva el bot en esa conversación
- /stats — estadísticas del día

### 5. API Routes
- POST /api/chat — RAG + OpenAI + guarda en Supabase
- GET /api/conversations — lista para panel admin
- PATCH /api/conversations/[id] — actualizar status (bot/human/closed)
- POST /api/handoff — cambia status + notifica Telegram
- POST /api/track — recibe datos de tracking del visitor
- GET /api/visitors — visitantes activos ahora mismo
- GET /api/knowledge — lista documentos
- POST /api/knowledge — añade documento
- PATCH /api/knowledge/[id] — edita documento
- DELETE /api/knowledge/[id] — elimina documento
- POST /api/telegram/webhook — recibe comandos del admin desde Telegram
- GET /api/stats — estadísticas agregadas

## Stack tecnológico
- Next.js 15 App Router + TypeScript (ya instalado)
- Supabase: PostgreSQL + pgvector (RAG) + Realtime (panel en vivo)
- OpenAI: gpt-4o-mini (chat) + text-embedding-3-small (embeddings)
- NextAuth.js para login panel admin
- Tailwind CSS (ya instalado)
- Telegram Bot API: notificaciones + interfaz móvil de gestión
- ipapi.co (gratuito, sin API key) para geolocalización por IP

## Variables de entorno (.env.local)
OPENAI_API_KEY=

SUPABASE_URL=

SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

TELEGRAM_BOT_TOKEN=

TELEGRAM_CHAT_ID=

NEXTAUTH_SECRET=

NEXTAUTH_URL=https://agente.elhogardetusuenos.com

ADMIN_PASSWORD=

## Sistema de diseño (El Hogar de Tus Sueños)

El widget de chat y el panel admin deben seguir exactamente la misma identidad visual
de la tienda elhogardetusuenos.com. Configurar en tailwind.config.ts y en CSS variables.

### Colores
- Primary:    #6BAEC9  (azul/teal — botones principales, cabecera del chat)
- Secondary:  #6A6A6A  (gris — texto secundario, bordes)
- Terciari:   #DDC9A3  (beige/crema — fondos cálidos, acentos)
- Accent:     #F7A36B  (coral — notificaciones, badges, alertas)
- Fondo:      #F8F8F5  (blanco cálido — fondo general)
- Hover:      #AED7E6  (azul claro — estados hover de botones)
- Negro:      #1A1A1A  (textos principales)

El panel admin también debe tener modo oscuro usando los mismos colores con 
fondos en #1A1A1A/#2D2D2D y textos en #F8F8F5, tal como aparece en el prototipo.

### Tipografía
- Font principal:    Poppins (Google Fonts)
- Font secundaria:   Orienta (o Georgia como fallback si no está disponible en Google Fonts)
- H1: 68px / line-height 72px
- H2: 42px / line-height 48px
- H3: 26px / line-height 48px
- H4: 16px / line-height 48px
- Paragraph: 16px / line-height 24px
- Small: 14px / line-height 24px
- Caption: 12px / line-height 16px

### Border radius y sombras
Usar border-radius redondeados (ver Corner radius de la guía).
Aplicar sombras suaves (Shadow 01 para cards, Shadow 02 para modales, 
Shadow 03 para el widget flotante de chat).

### Widget de chat — apariencia específica
- Header del chat: fondo #6BAEC9 (primary), texto blanco, logo de la tienda
- Burbuja del bot: fondo #F8F8F5, borde #AED7E6, texto #1A1A1A
- Burbuja del usuario: fondo #6BAEC9, texto blanco
- Botón de envío: #6BAEC9, hover #AED7E6
- Botón flotante: #6BAEC9 con icono de chat blanco, sombra Shadow 03
- Estado "esperando humano": accent #F7A36B

### Panel admin — apariencia
- Sidebar: fondo #1A1A1A (modo oscuro por defecto para panel profesional)
- Cards de conversación activa: borde izquierdo #6BAEC9
- Conversación esperando humano: borde izquierdo #F7A36B (accent/coral)
- Botones primarios: #6BAEC9
- Estadísticas: usar #DDC9A3 para fondos de cards de métricas

### Configurar en tailwind.config.ts
colors: {
  primary: '#6BAEC9',
  secondary: '#6A6A6A', 
  terciari: '#DDC9A3',
  accent: '#F7A36B',
  fondo: '#F8F8F5',
  hover: '#AED7E6',
}
fontFamily: {
  poppins: ['Poppins', 'sans-serif'],
  orienta: ['Orienta', 'Georgia', 'serif'],
}

## Esquema Supabase

### conversations
```sql
id uuid PK default gen_random_uuid(),
session_id text UNIQUE NOT NULL,
status text DEFAULT 'bot', -- 'bot'|'waiting_human'|'human'|'closed'
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now(),
metadata jsonb -- dispositivo, navegador, página de entrada
```

### messages
```sql
id uuid PK default gen_random_uuid(),
conversation_id uuid FK → conversations(id),
role text NOT NULL, -- 'user'|'assistant'|'human_agent'
content text NOT NULL,
created_at timestamptz DEFAULT now()
```

### visitors
```sql
id uuid PK default gen_random_uuid(),
session_id text NOT NULL,
ip text,
country text,
country_code text,
city text,
device text, -- 'mobile'|'desktop'|'tablet'
browser text,
current_page text,
referrer text,
pages_visited jsonb DEFAULT '[]', -- array de {url, timestamp}
first_seen timestamptz DEFAULT now(),
last_seen timestamptz DEFAULT now(),
has_chatted boolean DEFAULT false
```

### knowledge_base
```sql
id uuid PK default gen_random_uuid(),
title text NOT NULL,
content text NOT NULL,
category text, -- 'producto'|'envio'|'devolucion'|'faq'|'empresa'
embedding vector(1536),
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
```

Función SQL a crear:
```sql
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
```

## Flujo completo

### Visitante llega a la tienda
1. tracker.js se ejecuta → POST /api/track con IP, página, dispositivo
2. Se crea registro en visitors
3. Telegram recibe: "👤 Nuevo visitante desde 🇪🇸 España - Viendo: [página]"
4. Panel admin actualiza lista de visitantes en vivo (Supabase Realtime)
5. Conforme navega, se actualizan pages_visited y current_page en tiempo real

### Visitante abre el chat
1. Widget inicializa con session_id
2. Telegram recibe: "💬 Chat abierto - [país] pregunta: [primer mensaje]"
3. /api/chat: embedding del mensaje → match_documents → prompt con RAG → OpenAI → respuesta
4. Conversación guardada en messages

### Handoff humano
1. Detector de intención identifica palabras clave de handoff
2. POST /api/handoff → status = 'waiting_human'
3. Telegram: "🚨 ATENCIÓN - cliente quiere hablar contigo. [resumen] [enlace panel]"
4. Admin puede responder desde Telegram con /responder [session_id] [texto]
   O puede abrir el panel admin en el móvil (PWA) y escribir desde ahí
5. Respuesta del admin llega al widget del cliente en tiempo real

## PWA (Panel Admin instalable en móvil)
- Crear public/manifest.json con nombre, iconos, colores de la app
- Crear app/sw.js (service worker) para funcionamiento offline básico
- El panel en /admin debe ser responsive y usable en pantalla de móvil
- Añadir botón "Instalar app" en el panel para facilitar la instalación

## Productos de la tienda (seed inicial knowledge_base)
Crear datos iniciales para:
- Estores enrollables lisos: colores disponibles, cómo medir el hueco, 
  precio orientativo por m², plazo de fabricación
- Estores enrollables digitales: proceso de envío de foto, resolución mínima,
  colores disponibles, precio orientativo
- Colchas: tallas disponibles, materiales, cuidados
- Fundas de sofá: medidas estándar, materiales, instrucciones de lavado
- Fundas nórdicas: tallas, rellenos disponibles, cuidados
- Envíos: plazos (fabricación 2-3 días + envío 24-48h), transportistas, 
  seguimiento, envío gratis a partir de X€
- Devoluciones: productos estándar (30 días), productos a medida (sin devolución
  salvo defecto de fabricación)
- Pagos: métodos aceptados, seguridad, facturación
- Contacto: email, teléfono, horario de atención

## Orden de implementación
1. Esquema Supabase completo (todas las tablas + función match_documents)
2. /api/track + tabla visitors + notificación Telegram de visitante nuevo
3. public/tracker.js embebible
4. /api/chat con RAG funcionando + seed inicial knowledge_base
5. public/widget.js embebible
6. Configurar Telegram Bot con webhook /api/telegram/webhook
7. Comandos Telegram (/activos, /chats, /responder, /silenciar, /bot, /stats)
8. Panel admin /admin con Supabase Realtime (visitantes + conversaciones)
9. PWA manifest + service worker
10. UI base de conocimiento en panel admin
11. Estadísticas
12. Pulido visual responsive

## Notas
- Modular y reutilizable para vender a clínicas, restaurantes, veterinarias
- Comentarios en código en español
- Bundle ligero, sin dependencias innecesarias
- El sistema de Telegram es suficiente como app móvil sin necesitar 
  desarrollar una app nativa (iOS/Android)