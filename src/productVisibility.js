const INACTIVE_MERCADO_LIBRE_STATUSES = new Set([
  'closed',
  'inactive',
  'paused',
  'under_review',
])

const EXPIRED_MERCADO_LIBRE_STATUSES = new Set([
  'not_found',
  'deleted',
  'expired',
])

export const hasInactiveMercadoLibreStatus = (status = '') => {
  const normalizedStatus = String(status || '').trim().toLowerCase()
  return (
    INACTIVE_MERCADO_LIBRE_STATUSES.has(normalizedStatus) ||
    EXPIRED_MERCADO_LIBRE_STATUSES.has(normalizedStatus)
  )
}

export const hasExpiredMercadoLibreStatus = (status = '') =>
  EXPIRED_MERCADO_LIBRE_STATUSES.has(
    String(status || '').trim().toLowerCase(),
  )

export const isProductPubliclyVisible = (product = {}) =>
  product.is_visible !== false && !hasInactiveMercadoLibreStatus(product.ml_status)

export const getProductPublicationState = (product = {}) => {
  if (hasExpiredMercadoLibreStatus(product.ml_status)) {
    return { key: 'expired', label: 'Producto vencido', public: false }
  }

  if (product.is_visible === false) {
    return { key: 'manual-hidden', label: 'Oculto manualmente', public: false }
  }

  if (hasInactiveMercadoLibreStatus(product.ml_status)) {
    return { key: 'mercadolibre-inactive', label: 'Oferta inactiva', public: false }
  }

  return { key: 'published', label: 'Publicado', public: true }
}
