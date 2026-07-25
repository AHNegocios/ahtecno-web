import {
  fetchNormalizedProduct,
  normalizeItemId,
} from './mercadolibre-client.js'
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
) => {
  const now = new Date().toISOString()
  const fields = hasAvailabilitySchema
    ? ', unavailable_since'
    : ''
  const { data, error: updateError } = await supabase
    .from('Productos')
    .update({
      ml_status: 'not_found',
      last_synced_at: now,
      sync_error:
        'Mercado Libre confirmó que la publicación ya no existe o fue eliminada.',
      ...(hasAvailabilitySchema
        ? {
            unavailable_since: product.unavailable_since || now,
            consecutive_sync_failures:
              (Number(product.consecutive_sync_failures) || 0) + 1,
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

const syncProduct = async (
  supabase,
  product,
  accessToken,
  hasAvailabilitySchema,
) => {
  const itemId = normalizeItemId(product.ml_id)

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
        `id, ml_id, titulo, precio, price_source, price_needs_review, ml_status, last_synced_at${fields}`,
      )
      .single()

    if (error) throw error
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

export const syncAllProducts = async (supabase) => {
  let hasAvailabilitySchema = true
  let productsResult = await supabase
    .from('Productos')
    .select(
      'id, ml_id, ml_item_id, precio, price_source, unavailable_since, consecutive_sync_failures',
    )
    .not('ml_id', 'is', null)
    .neq('ml_id', '')
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
      .select('id, ml_id, ml_item_id, precio, price_source')
      .not('ml_id', 'is', null)
      .neq('ml_id', '')
      .order('id', { ascending: true })
  }

  if (productsResult.error) throw productsResult.error
  const products = productsResult.data
  if (!products?.length) {
    return { total: 0, updated: 0, failed: 0, needsReview: 0, failures: [] }
  }

  const accessToken = await getValidAccessToken(supabase)
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
          return { ok: true, product: updated }
        } catch (syncError) {
          return {
            ok: false,
            mlId: product.ml_id,
            error: safeSyncError(syncError),
          }
        }
      }),
    )
    results.push(...batchResults)
  }

  const failures = results.filter((result) => !result.ok)
  const needsReview = results.filter(
    (result) => result.ok && result.product.price_needs_review,
  ).length
  const hidden = results.filter(
    (result) =>
      result.ok && hasInactiveMercadoLibreStatus(result.product.ml_status),
  ).length
  const expired = results.filter(
    (result) =>
      result.ok && hasExpiredMercadoLibreStatus(result.product.ml_status),
  ).length
  return {
    total: results.length,
    updated: results.length - failures.length,
    failed: failures.length,
    needsReview,
    hidden,
    expired,
    failures,
  }
}
