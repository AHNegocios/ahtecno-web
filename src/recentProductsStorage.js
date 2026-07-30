import {
  normalizeFavoriteSnapshot,
  parseStoredFavorites,
} from './favoritesStorage.js'

export const RECENT_PRODUCTS_STORAGE_KEY = 'ahtecno-recent-products-v1'
export const RECENT_PRODUCTS_LIMIT = 6

export const parseStoredRecentProducts = (value) =>
  parseStoredFavorites(value)
    .map((product) => ({
      ...product,
      seen_at: product.saved_at,
    }))
    .slice(0, RECENT_PRODUCTS_LIMIT)

export const prependRecentProduct = (
  products,
  product,
  seenAt = new Date().toISOString(),
) => {
  const snapshot = normalizeFavoriteSnapshot(product, seenAt)
  if (!snapshot) return products

  return [
    {
      ...snapshot,
      seen_at: seenAt,
    },
    ...products.filter((entry) => entry.id !== snapshot.id),
  ].slice(0, RECENT_PRODUCTS_LIMIT)
}
