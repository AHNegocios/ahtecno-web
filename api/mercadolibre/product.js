import { errorResponse, HttpError, jsonResponse, readJsonBody } from '../_lib/http.js'
import { requireAdmin } from '../_lib/admin-auth.js'
import {
  fetchNormalizedProduct,
  normalizeManualPrice,
  parseMercadoLibreReference,
} from '../_lib/mercadolibre-client.js'
import { getValidAccessToken } from '../_lib/token-store.js'

export const saveProduct = async (supabase, existingProduct, normalized) => {
  const productsTable = supabase.from('Productos')
  const saveQuery = existingProduct
    ? productsTable.update(normalized).eq('id', existingProduct.id)
    : productsTable.insert(normalized)
  const { data, error } = await saveQuery.select('*').single()

  if (error) {
    console.error(error)
    const errorCode = error.code ? ` Código: ${error.code}.` : ''
    throw new HttpError(
      422,
      `La base de datos rechazó el producto.${errorCode}`,
    )
  }

  return data
}

export async function POST(request) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = await readJsonBody(request)
    const { productId, offerItemId } = parseMercadoLibreReference(
      body.ml_reference || body.ml_id,
    )
    const affiliateUrl = String(body.affiliate_url || '').trim()
    const manualPrice = normalizeManualPrice(body.manual_price)

    const { data: existingProduct, error: existingError } = await supabase
      .from('Productos')
      .select('id, link, etiqueta, ml_item_id, precio, price_source')
      .eq('ml_id', productId)
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
    const fallbackPrice = manualPrice ?? existingProduct?.precio ?? null
    const fallbackPriceSource = manualPrice
      ? 'manual'
      : existingProduct?.price_source || 'manual'
    const normalized = {
      ...(await fetchNormalizedProduct(productId, accessToken, {
        offerItemId: offerItemId || existingProduct?.ml_item_id || null,
        manualPrice: fallbackPrice,
        fallbackPriceSource,
      })),
      link: storedAffiliateUrl,
      etiqueta: existingProduct?.etiqueta || 'Nuevo',
    }

    const data = await saveProduct(supabase, existingProduct, normalized)
    return jsonResponse({ ok: true, product: data })
  } catch (error) {
    return errorResponse(error)
  }
}
