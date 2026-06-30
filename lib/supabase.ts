import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente para operaciones desde el navegador / con permisos limitados (RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con permisos de servicio, solo para uso en API routes del servidor
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
