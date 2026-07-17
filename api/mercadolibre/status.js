import { requireAdmin } from '../_lib/admin-auth.js'
import { getConfigurationStatus } from '../_lib/config.js'
import { errorResponse, jsonResponse } from '../_lib/http.js'

export async function GET(request) {
  try {
    const { supabase } = await requireAdmin(request)
    const configuration = getConfigurationStatus()
    if (!configuration.configured) {
      return jsonResponse({ ok: true, ...configuration, connected: false })
    }

    const { data, error } = await supabase
      .from('mercadolibre_credentials')
      .select('expires_at, updated_at')
      .eq('id', 1)
      .maybeSingle()

    if (error) throw error
    return jsonResponse({
      ok: true,
      configured: true,
      missing: [],
      connected: Boolean(data),
      expiresAt: data?.expires_at || null,
      updatedAt: data?.updated_at || null,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
