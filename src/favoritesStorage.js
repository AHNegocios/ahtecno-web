export const FAVORITES_STORAGE_KEY = 'ahtecno-favorites-v1'

const normalizeId = (value) => String(value ?? '').trim()

const normalizeCurrency = (value) => {
  const currency = String(value || 'ARS').trim().toUpperCase()
  return /^[A-Z]{3}$/.test(currency) ? currency : 'ARS'
}

export const normalizeFavoriteSnapshot = (
  product = {},
  savedAt = new Date().toISOString(),
) => {
  const id = normalizeId(product.id)
  if (!id) return null

  return {
    id,
    titulo: String(product.titulo || 'Producto guardado').trim(),
    imagen: String(product.imagen || '').trim(),
    precio: Number(product.precio) || 0,
    currency_id: normalizeCurrency(product.currency_id),
    categoria: String(product.categoria || '').trim(),
    ml_id: String(product.ml_id || '').trim(),
    saved_at: savedAt,
  }
}

export const parseStoredFavorites = (value) => {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) return []

    const seen = new Set()
    return parsed.reduce((favorites, entry) => {
      const normalized = normalizeFavoriteSnapshot(
        entry,
        entry?.saved_at || new Date().toISOString(),
      )
      if (!normalized || seen.has(normalized.id)) return favorites
      seen.add(normalized.id)
      favorites.push(normalized)
      return favorites
    }, [])
  } catch {
    return []
  }
}
