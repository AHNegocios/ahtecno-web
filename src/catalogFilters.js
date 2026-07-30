export const priceRangeOptions = [
  { value: 'todos', label: 'Cualquier precio' },
  { value: 'hasta-50000', label: 'Hasta $50.000' },
  { value: '50000-100000', label: '$50.000 a $100.000' },
  { value: 'mas-100000', label: 'Más de $100.000' },
]

const knownPriceRanges = new Set(
  priceRangeOptions.map((option) => option.value),
)

export const normalizePriceRange = (value) =>
  knownPriceRanges.has(value) ? value : 'todos'

export const matchesPriceRange = (product, range) => {
  const normalizedRange = normalizePriceRange(range)
  const price = Number(product?.precio)

  if (normalizedRange === 'todos') return true
  if (!Number.isFinite(price) || price <= 0) return false
  if (normalizedRange === 'hasta-50000') return price <= 50_000
  if (normalizedRange === '50000-100000') {
    return price > 50_000 && price <= 100_000
  }
  return price > 100_000
}

export const hasExtendedProductDetails = (product = {}) =>
  Boolean(
    String(product.descripcion || '').trim() ||
      (Array.isArray(product.attributes) && product.attributes.length) ||
      (Array.isArray(product.imagenes) && product.imagenes.length > 1),
  )
