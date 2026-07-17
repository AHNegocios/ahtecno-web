import { createClient } from '@supabase/supabase-js'
import { getSupabaseServerConfig } from './config.js'

export const createSupabaseAdmin = () => {
  const { url, secretKey } = getSupabaseServerConfig()

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
