import { requireAdmin } from '../_lib/admin-auth.js'
import { errorResponse, jsonResponse } from '../_lib/http.js'

export async function GET(request) {
  try {
    const { supabase } = await requireAdmin(request)
    const [productsResult, clicksResult] = await Promise.all([
      supabase
        .from('Productos')
        .select(
          'id, titulo, precio, currency_id, imagen, ml_id, categoria, is_visible, ml_status, price_source, price_needs_review, last_synced_at, sync_error',
        )
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('product_click_totals').select('product_id, clicks'),
    ])

    if (productsResult.error) throw productsResult.error
    if (clicksResult.error) console.error(clicksResult.error)

    const clickTotals = new Map(
      (clicksResult.data || []).map(({ product_id: productId, clicks }) => [
        String(productId),
        Number(clicks) || 0,
      ]),
    )
    const products = (productsResult.data || []).map((product) => ({
      ...product,
      outbound_clicks: clickTotals.get(String(product.id)) || 0,
    }))

    return jsonResponse({ ok: true, products })
  } catch (error) {
    return errorResponse(error)
  }
}
