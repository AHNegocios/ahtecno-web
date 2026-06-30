// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 1. La URL base de tu proyecto (ya te la dejé lista)
const supabaseUrl = 'https://emypgoqssauxmjipdxmc.supabase.co' 

// 2. Pegá acá tu clave larga reemplazando este texto:
const supabaseAnonKey = 'sb_publishable_8lFihYbWaQB4KUgsaeJCug_fsftjA5t'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)