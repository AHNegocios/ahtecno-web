import {
  fetchNormalizedProduct,
  normalizeItemId,
} from './mercadolibre-client.js'
import { verifyAffiliateLink } from './affiliate-link.js'
import { recordPriceHistory } from './price-history.js'
import { getValidAccessToken } from './token-store.js'
import {
  hasExpiredMercadoLibreStatus,
  hasInactiveMercadoLibreStatus,
} from '../../src/productVisibility.js'

const SYNC_BATCH_SIZE = 4

const safeSyncError = (error) =>
  String(error?.message || 'No se pudo actualizar desde Mercado Libre.').slice(
    0,
    500,
  )

export const isDefinitivelyUnavailableError = (error) =>
  error?.name === 'HttpError' &&
  [404, 410].includes(error?.status) &&
  /Mercado Libre|publicación vinculada/i.test(String(error?.message || ''))

const buildAvailabilityFields = (product, mlStatus) => {
  const inactive = hasInactiveMercadoLibreStatus(mlStatus)

  return {
    consecutive_sync_failures: 0,
    unavailable_since: inactive
      ? product.unavailable_since || new Date().toISOString()
      : null,
  }
}

const markSyncError = async (
  supabase,
  product,
  error,
  hasAvailabilitySchema,
) => {
  const { error: updateError } = await supabase
    .from('Productos')
    .update({
      sync_error: safeSyncError(error),
      ...(hasAvailabilitySchema
        ? {
            consecutive_sync_failures:
              (Number(product.consecutive_sync_failures) || 0) + 1,
          }
        : {}),
    })
    .eq('id', product.id)

  if (updateError) console.error(updateError)
}

const markUnavailable = async (
  supabase,
  product,
  error,
  hasAvailabilitySchema,
  {
    mlStatus = 'not_found',
    syncError = 'Mercado Libre confirmó que la publicación ya no existe o fue eliminada.',
  } = {},
) => {
  const now = new Date().toISOString()
  const fields = hasAvailabilitySchema
    ? ', unavailable_since'
    : ''
  const { data, error: updateError } = await supabase
    .from('Productos')
    .update({
      ml_status: mlStatus,
      last_synced_at: now,
      sync_error: syncError,
      ...(hasAvailabilitySchema
        ? {
            unavailable_since: product.unavailable_since || now,
            consecutive_sync_failures: 0,
          }
        : {}),
    })
    .eq('id', product.id)
    .select(
      `id, ml_id, titulo, precio, price_source, price_needs_review, ml_status, last_synced_at${fields}`,
    )
    .single()

  if (updateError) throw updateError
  return { ...data, expired: true, original_error: safeSyncError(error) }
}

const markLinkOnlyProductAvailable = async (
  supabase,
  product,
  hasAvailabilitySchema,
) => {
  const availabilityFields = hasAvailabilitySchema
    ? {
        unavailable_since: null,
        consecutive_sync_failures: 0,
      }
    : {}
  const fields = hasAvailabilitySchema ? ', unavailable_since' : ''
  const { data, error } = await supabase
    .from('Productos')
    .update({
      ml_status: 'active',
      last_synced_at: new Date().toISOString(),
      sync_error: null,
      ...availabilityFields,
    })
    .eq('id', product.id)
    .select(
      `id, ml_id, titulo, precio, price_source, price_needs_review, ml_status, last_synced_at${fields}`,
    )
    .single()

  if (error) throw error
  return data
}

const markLinkOnlyProductUnconfirmed = async (
  supabase,
  product,
  reason,
  hasAvailabilitySchema,
) => {
  const fields = hasAvailabilitySchema
    ? ', unavailable_since, consecutive_sync_failures'
    : ''
  const { data, error } = await supabase
    .from('Productos')
    .update({
      sync_error: reason,
      ...(hasAvailabilitySchema ? { consecutive_sync_failures: 0 } : {}),
    })
    .eq('id', product.id)
    .select(
      `id, ml_id, titulo, precio, price_source, price_needs_review, ml_status, last_synced_at${fields}`,
    )
    .single()

  if (error) throw error
  return { ...data, sync_skipped: true }
}

const syncProduct = async (
  supabase,
  product,
  accessToken,
  hasAvailabilitySchema,
) => {
  const affiliateLinkResult = await verifyAffiliateLink(product.link)

  if (affiliateLinkResult.definitive && affiliateLinkResult.ok === false) {
    return markUnavailable(
      supabase,
      product,
      new Error(affiliateLinkResult.reason),
      hasAvailabilitySchema,
      {
        mlStatus: 'link_invalid',
        syncError: affiliateLinkResult.reason,
      },
    )
  }

  let itemId
  try {
    itemId = normalizeItemId(product.ml_id)
  } catch {
    itemId = null
  }

  if (!itemId) {
    if (affiliateLinkResult.ok === true) {
      return markLinkOnlyProductAvailable(
        supabase,
        product,
        hasAvailabilitySchema,
      )
    }

    return markLinkOnlyProductUnconfirmed(
      supabase,
      product,
      affiliateLinkResult.reason,
      hasAvailabilitySchema,
    )
  }

  try {
    const normalized = await fetchNormalizedProduct(itemId, accessToken, {
      offerItemId: product.ml_item_id || null,
      manualPrice: product.precio,
      fallbackPriceSource: product.price_source || 'manual',
    })
    const availabilityFields = hasAvailabilitySchema
      ? buildAvailabilityFields(product, normalized.ml_status)
      : {}
    const fields = hasAvailabilitySchema
      ? ', unavailable_since'
      : ''
    const { data, error } = await supabase
      .from('Productos')
      .update({ ...normalized, ...availabilityFields })
      .eq('id', product.id)
      .select(
        `id, ml_id, titulo, precio, currency_id, price_source, price_needs_review, ml_status, last_synced_at${fields}`,
      )
      .single()

    if (error) throw error
    await recordPriceHistory(supabase, product, data, 'sync')
    return data
  } catch (error) {
    if (isDefinitivelyUnavailableError(error)) {
      return markUnavailable(
        supabase,
        product,
        error,
        hasAvailabilitySchema,
      )
    }

    await markSyncError(supabase, product, error, hasAvailabilitySchema)
    throw error
  }
}

export const summarizeSyncResults = (results = []) => {
  const failures = results.filter((result) => !result.ok)
  const skipped = results.filter((result) => result.ok && result.skipped).length
  const needsReview = results.filter(
    (result) =>
      result.ok &&
      !result.skipped &&
      result.product.price_needs_review,
  ).length
  const hidden = results.filter(
    (result) =>
      result.ok &&
      !result.skipped &&
      hasInactiveMercadoLibreStatus(result.product.ml_status),
  ).length
  const expired = results.filter(
    (result) =>
      result.ok &&
      !result.skipped &&
      hasExpiredMercadoLibreStatus(result.product.ml_status),
  ).length

  return {
    total: results.length,
    updated: results.length - failures.length - skipped,
    failed: failures.length,
    skipped,
    needsReview,
    hidden,
    expired,
    failures,
  }
}

export const syncAllProducts = async (supabase) => {
  let hasAvailabilitySchema = true
  let productsResult = await supabase
    .from('Productos')
    .select(
      'id, titulo, ml_id, ml_item_id, link, precio, currency_id, price_source, unavailable_since, consecutive_sync_failures',
    )
    .order('id', { ascending: true })

  if (
    productsResult.error &&
    /unavailable_since|consecutive_sync_failures/.test(
      String(productsResult.error.message || ''),
    )
  ) {
    hasAvailabilitySchema = false
    productsResult = await supabase
      .from('Productos')
      .select(
        'id, titulo, ml_id, ml_item_id, link, precio, currency_id, price_source',
      )
      .order('id', { ascending: true })
  }

  if (productsResult.error) throw productsResult.error
  const products = (productsResult.data || []).filter(
    (product) =>
      String(product.ml_id || '').trim() || String(product.link || '').trim(),
  )
  if (!products?.length) {
    return {
      total: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      needsReview: 0,
      hidden: 0,
      expired: 0,
      failures: [],
    }
  }

  const hasApiProducts = products.some((product) => {
    try {
      return Boolean(normalizeItemId(product.ml_id))
    } catch {
      return false
    }
  })
  const accessToken = hasApiProducts
    ? await getValidAccessToken(supabase)
    : null
  const results = []

  for (let index = 0; index < products.length; index += SYNC_BATCH_SIZE) {
    const batch = products.slice(index, index + SYNC_BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(async (product) => {
        try {
          const updated = await syncProduct(
            supabase,
            product,
            accessToken,
            hasAvailabilitySchema,
          )
          return {
            ok: true,
            skipped: Boolean(updated.sync_skipped),
            product: updated,
          }
        } catch (syncError) {
          return {
            ok: false,
            productId: product.id,
            title: product.titulo || 'Producto sin título',
            mlId: product.ml_id,
            error: safeSyncError(syncError),
          }
        }
      }),
    )
    results.push(...batchResults)
  }

  return summarizeSyncResults(results)
}
