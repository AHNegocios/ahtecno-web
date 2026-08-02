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

const PUBLICATION_MODES = new Set(['draft', 'scheduled', 'published'])

const parsePublicationDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, 'La fecha prevista no es válida.')
  }
  return date
}

const normalizeContentUrl = (value) => {
  const normalized = String(value || '').trim()
  if (!normalized) return null
  try {
    const url = new URL(normalized)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    return url.toString()
  } catch {
    throw new HttpError(400, 'El enlace del contenido debe ser una dirección válida.')
  }
}

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
    const requestedPublicationMode = String(body.publication_mode || '').trim()
    const plannedPublishAt = parsePublicationDate(body.planned_publish_at)
    const contentUrl = normalizeContentUrl(body.content_url)
    const editorialNotes = String(body.editorial_notes || '').trim().slice(0, 1000) || null

    if (
      requestedPublicationMode &&
      !PUBLICATION_MODES.has(requestedPublicationMode)
    ) {
      throw new HttpError(400, 'El estado editorial elegido no es válido.')
    }

    let hasAvailabilitySchema = true
    let hasEditorialSchema = true
    let existingResult = await supabase
      .from('Productos')
      .select(
        'id, link, etiqueta, categoria, ml_item_id, precio, currency_id, price_source, unavailable_since, is_visible, publication_status, planned_publish_at, published_at, content_url, editorial_notes',
      )
      .eq('ml_id', productId)
      .maybeSingle()

    for (let attempt = 0; existingResult.error && attempt < 2; attempt += 1) {
      const message = String(existingResult.error.message || '')
      if (
        hasEditorialSchema &&
        /publication_status|planned_publish_at|published_at|content_url|editorial_notes/i.test(
          message,
        )
      ) {
        hasEditorialSchema = false
      } else if (
        hasAvailabilitySchema &&
        /unavailable_since|consecutive_sync_failures/i.test(message)
      ) {
        hasAvailabilitySchema = false
      } else {
        break
      }

      const optionalFields = [
        hasAvailabilitySchema ? ', unavailable_since' : '',
        hasEditorialSchema
          ? ', is_visible, publication_status, planned_publish_at, published_at, content_url, editorial_notes'
          : '',
      ].join('')
      existingResult = await supabase
        .from('Productos')
        .select(
          `id, link, etiqueta, categoria, ml_item_id, precio, currency_id, price_source${optionalFields}`,
        )
        .eq('ml_id', productId)
        .maybeSingle()
    }

    if (existingResult.error) throw existingResult.error
    const existingProduct = existingResult.data

    if (!hasEditorialSchema && requestedPublicationMode) {
      throw new HttpError(
        409,
        'Primero ejecutá la migración de Base de datos editorial en Supabase.',
      )
    }

    const publicationMode =
      requestedPublicationMode || existingProduct?.publication_status || 'published'
    const effectivePlannedAt =
      plannedPublishAt ||
      (existingProduct?.planned_publish_at
        ? new Date(existingProduct.planned_publish_at)
        : null)

    if (publicationMode === 'scheduled') {
      if (!effectivePlannedAt || Number.isNaN(effectivePlannedAt.getTime())) {
        throw new HttpError(400, 'Elegí una fecha prevista para programar el producto.')
      }
      if (effectivePlannedAt <= new Date()) {
        throw new HttpError(400, 'La fecha programada debe estar en el futuro.')
      }
    }

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
      ...(hasEditorialSchema
        ? {
            publication_status: publicationMode,
            planned_publish_at: effectivePlannedAt?.toISOString() || null,
            published_at:
              publicationMode === 'published'
                ? existingProduct?.published_at || new Date().toISOString()
                : publicationMode === 'scheduled'
                  ? effectivePlannedAt.toISOString()
                  : null,
            is_visible: publicationMode !== 'draft',
            content_url: contentUrl ?? existingProduct?.content_url ?? null,
            editorial_notes:
              editorialNotes ?? existingProduct?.editorial_notes ?? null,
          }
        : {}),
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
