import { errorResponse, HttpError, jsonResponse, readJsonBody } from '../_lib/http.js'
import { requireAdmin } from '../_lib/admin-auth.js'
import {
  fetchNormalizedProduct,
  normalizeManualPrice,
  parseMercadoLibreReference,
} from '../_lib/mercadolibre-client.js'
import { verifyAffiliateLink } from '../_lib/affiliate-link.js'
import { recordPriceHistory } from '../_lib/price-history.js'
import { getValidAccessToken } from '../_lib/token-store.js'
import { categorySlugs } from '../../src/catalogConfig.js'
import { hasInactiveMercadoLibreStatus } from '../../src/productVisibility.js'

export const normalizeSiteCategory = (value) => {
  const category = String(value || '').trim()
  if (!category || category === 'automatico') return null

  if (!categorySlugs.includes(category)) {
    throw new HttpError(400, 'Elegí una categoría válida de AH Tecno.')
  }

  return category
}

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
    const requestedCategory = normalizeSiteCategory(body.category)

    let hasAvailabilitySchema = true
    let existingResult = await supabase
      .from('Productos')
      .select(
        'id, link, etiqueta, categoria, ml_item_id, precio, currency_id, price_source, unavailable_since',
      )
      .eq('ml_id', productId)
      .maybeSingle()

    if (
      existingResult.error &&
      /unavailable_since|consecutive_sync_failures/.test(
        String(existingResult.error.message || ''),
      )
    ) {
      hasAvailabilitySchema = false
      existingResult = await supabase
        .from('Productos')
        .select('id, link, etiqueta, categoria, ml_item_id, precio, currency_id, price_source')
        .eq('ml_id', productId)
        .maybeSingle()
    }

    if (existingResult.error) throw existingResult.error
    const existingProduct = existingResult.data

    const storedAffiliateUrl = affiliateUrl || existingProduct?.link || ''
    if (!storedAffiliateUrl) {
      throw new HttpError(
        400,
        'Agregá el enlace de afiliado la primera vez que cargás el producto.',
      )
    }

    const affiliateLinkResult = await verifyAffiliateLink(storedAffiliateUrl)
    if (affiliateLinkResult.definitive && affiliateLinkResult.ok === false) {
      throw new HttpError(400, affiliateLinkResult.reason)
    }

    const accessToken = await getValidAccessToken(supabase)
    const fallbackPrice = manualPrice ?? existingProduct?.precio ?? null
    const fallbackPriceSource = manualPrice
      ? 'manual'
      : existingProduct?.price_source || 'manual'
    const mercadoLibreProduct = await fetchNormalizedProduct(
      productId,
      accessToken,
      {
        offerItemId: offerItemId || existingProduct?.ml_item_id || null,
        manualPrice: fallbackPrice,
        fallbackPriceSource,
      },
    )
    const normalized = {
      ...mercadoLibreProduct,
      link: storedAffiliateUrl,
      etiqueta: existingProduct?.etiqueta || 'Nuevo',
      categoria: requestedCategory || existingProduct?.categoria || null,
      ...(hasAvailabilitySchema
        ? {
            unavailable_since: hasInactiveMercadoLibreStatus(
              mercadoLibreProduct.ml_status,
            )
              ? existingProduct?.unavailable_since || new Date().toISOString()
              : null,
            consecutive_sync_failures: 0,
          }
        : {}),
    }

    const data = await saveProduct(supabase, existingProduct, normalized)
    await recordPriceHistory(
      supabase,
      existingProduct,
      data,
      existingProduct ? 'import' : 'initial',
    )
    return jsonResponse({ ok: true, product: data })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(request) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = await readJsonBody(request)
    const productId = String(body.product_id || '').trim()
    const categoria = normalizeSiteCategory(body.category)

    if (!productId || typeof body.is_visible !== 'boolean') {
      throw new HttpError(400, 'La configuración del producto es inválida.')
    }

    const { data, error } = await supabase
      .from('Productos')
      .update({ categoria, is_visible: body.is_visible })
      .eq('id', productId)
      .select('*')
      .single()

    if (error) throw error
    return jsonResponse({ ok: true, product: data })
  } catch (error) {
    return errorResponse(error)
  }
}
