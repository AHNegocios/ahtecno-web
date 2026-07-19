import { requireAdmin } from '../_lib/admin-auth.js'
import { errorResponse, jsonResponse } from '../_lib/http.js'

export async function GET(request) {
  try {
    const { supabase } = await requireAdmin(request)
    const { data, error } = await supabase
      .from('Productos')
      .select(
        'id, titulo, precio, currency_id, imagen, ml_id, price_source, price_needs_review, last_synced_at, sync_error',
      )
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return jsonResponse({ ok: true, products: data || [] })
  } catch (error) {
    return errorResponse(error)
  }
}
