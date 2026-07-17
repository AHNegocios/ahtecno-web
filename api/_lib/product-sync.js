import {
  fetchNormalizedProduct,
  normalizeItemId,
} from './mercadolibre-client.js'
import { getValidAccessToken } from './token-store.js'

const SYNC_BATCH_SIZE = 4

const safeSyncError = (error) =>
  String(error?.message || 'No se pudo actualizar desde Mercado Libre.').slice(
    0,
    500,
  )

const markSyncError = async (supabase, productId, error) => {
  const { error: updateError } = await supabase
    .from('Productos')
    .update({ sync_error: safeSyncError(error) })
    .eq('id', productId)

  if (updateError) console.error(updateError)
}

const syncProduct = async (supabase, product, accessToken) => {
  const itemId = normalizeItemId(product.ml_id)

  try {
    const normalized = await fetchNormalizedProduct(itemId, accessToken, {
      offerItemId: product.ml_item_id || null,
    })
    const { data, error } = await supabase
      .from('Productos')
      .update(normalized)
      .eq('id', product.id)
      .select('id, ml_id, titulo, precio, last_synced_at')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    await markSyncError(supabase, product.id, error)
    throw error
  }
}

export const syncAllProducts = async (supabase) => {
  const { data: products, error } = await supabase
    .from('Productos')
    .select('id, ml_id, ml_item_id')
    .not('ml_id', 'is', null)
    .neq('ml_id', '')
    .order('id', { ascending: true })

  if (error) throw error
  if (!products?.length) {
    return { total: 0, updated: 0, failed: 0, failures: [] }
  }

  const accessToken = await getValidAccessToken(supabase)
  const results = []

  for (let index = 0; index < products.length; index += SYNC_BATCH_SIZE) {
    const batch = products.slice(index, index + SYNC_BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(async (product) => {
        try {
          const updated = await syncProduct(supabase, product, accessToken)
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
  return {
    total: results.length,
    updated: results.length - failures.length,
    failed: failures.length,
    failures,
  }
}
