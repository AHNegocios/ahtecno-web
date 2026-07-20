export const slugifyProductTitle = (title = '') =>
  String(title || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'producto'

export const getProductIdentifier = (product = {}) =>
  String(product.ml_id || product.id || '').trim()

export const getProductPath = (product = {}) => {
  const identifier = getProductIdentifier(product)
  if (!identifier) return '/productos'

  return `/producto/${encodeURIComponent(identifier)}/${slugifyProductTitle(product.titulo)}`
}

export const normalizeProductIdentifier = (value = '') => {
  const identifier = decodeURIComponent(String(value || '')).trim()

  if (/^MLA-?\d+$/i.test(identifier)) {
    return { field: 'ml_id', value: identifier.toUpperCase().replace(/^MLA-/, 'MLA') }
  }

  if (/^\d+$/.test(identifier)) return { field: 'id', value: Number(identifier) }

  return null
}
