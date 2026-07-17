// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// La clave publicable puede vivir en el navegador. La seguridad de escritura debe
// estar protegida con políticas RLS en Supabase. Las variables permiten mover la
// configuración a Vercel sin romper la instalación actual durante la transición.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://emypgoqssauxmjipdxmc.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_8lFihYbWaQB4KUgsaeJCug_fsftjA5t'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
