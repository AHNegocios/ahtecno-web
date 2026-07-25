import { requireAdmin } from '../_lib/admin-auth.js'
import { errorResponse, jsonResponse } from '../_lib/http.js'

export async function GET(request) {
  try {
    const { supabase } = await requireAdmin(request)
    let productsResult = await supabase
      .from('Productos')
      .select(
        'id, titulo, precio, currency_id, imagen, ml_id, categoria, is_visible, ml_status, price_source, price_needs_review, last_synced_at, sync_error, unavailable_since, consecutive_sync_failures',
      )
      .order('created_at', { ascending: false })
      .limit(100)

    if (
      productsResult.error &&
      /unavailable_since|consecutive_sync_failures/.test(
        String(productsResult.error.message || ''),
      )
    ) {
      productsResult = await supabase
        .from('Productos')
        .select(
          'id, titulo, precio, currency_id, imagen, ml_id, categoria, is_visible, ml_status, price_source, price_needs_review, last_synced_at, sync_error',
        )
        .order('created_at', { ascending: false })
        .limit(100)
    }

    if (productsResult.error) throw productsResult.error

    let eventsResult = await supabase
      .from('product_event_totals')
      .select('product_id, product_views, outbound_clicks, shares')

    if (eventsResult.error) {
      const clicksResult = await supabase
        .from('product_click_totals')
        .select('product_id, clicks')

      if (clicksResult.error) {
        console.error(eventsResult.error, clicksResult.error)
        eventsResult = { data: [], error: null }
      } else {
        eventsResult = {
          data: (clicksResult.data || []).map((row) => ({
            product_id: row.product_id,
            product_views: 0,
            outbound_clicks: row.clicks,
            shares: 0,
          })),
          error: null,
        }
      }
    }

    const eventTotals = new Map(
      (eventsResult.data || []).map((event) => [
        String(event.product_id),
        {
          product_views: Number(event.product_views) || 0,
          outbound_clicks: Number(event.outbound_clicks) || 0,
          shares: Number(event.shares) || 0,
        },
      ]),
    )
    const products = (productsResult.data || []).map((product) => ({
      ...product,
      product_views:
        eventTotals.get(String(product.id))?.product_views || 0,
      outbound_clicks:
        eventTotals.get(String(product.id))?.outbound_clicks || 0,
      shares: eventTotals.get(String(product.id))?.shares || 0,
    }))

    return jsonResponse({ ok: true, products })
  } catch (error) {
    return errorResponse(error)
  }
}
