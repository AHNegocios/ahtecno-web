const INACTIVE_MERCADO_LIBRE_STATUSES = new Set([
  'closed',
  'inactive',
  'paused',
  'under_review',
])

export const hasInactiveMercadoLibreStatus = (status = '') =>
  INACTIVE_MERCADO_LIBRE_STATUSES.has(String(status || '').trim().toLowerCase())

export const isProductPubliclyVisible = (product = {}) =>
  product.is_visible !== false && !hasInactiveMercadoLibreStatus(product.ml_status)

export const getProductPublicationState = (product = {}) => {
  if (product.is_visible === false) {
    return { key: 'manual-hidden', label: 'Oculto manualmente', public: false }
  }

  if (hasInactiveMercadoLibreStatus(product.ml_status)) {
    return { key: 'mercadolibre-inactive', label: 'Oferta inactiva', public: false }
  }

  return { key: 'published', label: 'Publicado', public: true }
}
