import { errorResponse, HttpError, jsonResponse, readJsonBody } from '../_lib/http.js'
import { requireAdmin } from '../_lib/admin-auth.js'
import {
  fetchProductBundle,
  normalizeItemId,
  normalizeProduct,
} from '../_lib/mercadolibre-client.js'
import { getValidAccessToken } from '../_lib/token-store.js'

export async function POST(request) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = await readJsonBody(request)
    const itemId = normalizeItemId(body.ml_id)
    const affiliateUrl = String(body.affiliate_url || '').trim()

    const { data: existingProduct, error: existingError } = await supabase
      .from('Productos')
      .select('id, link')
      .eq('ml_id', itemId)
      .maybeSingle()

    if (existingError) throw existingError

    const storedAffiliateUrl = affiliateUrl || existingProduct?.link || ''
    if (!storedAffiliateUrl) {
      throw new HttpError(
        400,
        'Agregá el enlace de afiliado la primera vez que cargás el producto.',
      )
    }

    const accessToken = await getValidAccessToken(supabase)
    const bundle = await fetchProductBundle(itemId, accessToken)
    const normalized = {
      ...normalizeProduct(bundle),
      link: storedAffiliateUrl,
    }

    const { data, error } = await supabase
      .from('Productos')
      .upsert(normalized, { onConflict: 'ml_id' })
      .select('*')
      .single()

    if (error) throw error
    return jsonResponse({ ok: true, product: data })
  } catch (error) {
    return errorResponse(error)
  }
}
