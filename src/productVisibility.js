import { isUsableAffiliateLink } from './affiliateLinks.js'
import {
  getEditorialPublicationState,
  isEditoriallyPublished,
} from './editorialWorkflow.js'

const INACTIVE_MERCADO_LIBRE_STATUSES = new Set([
  'closed',
  'inactive',
  'paused',
  'under_review',
])

const EXPIRED_MERCADO_LIBRE_STATUSES = new Set([
  'closed',
  'inactive',
  'not_found',
  'deleted',
  'expired',
  'link_invalid',
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
  product.is_visible !== false &&
  isEditoriallyPublished(product) &&
  isUsableAffiliateLink(product.link) &&
  !hasInactiveMercadoLibreStatus(product.ml_status)

export const getProductPublicationState = (product = {}) => {
  if (!isUsableAffiliateLink(product.link)) {
    return {
      key: 'expired',
      label: 'VENCIDO',
      reason: 'El enlace de afiliado está ausente o no es válido.',
      public: false,
    }
  }

  if (hasExpiredMercadoLibreStatus(product.ml_status)) {
    return {
      key: 'expired',
      label: 'VENCIDO',
      reason:
        product.ml_status === 'link_invalid'
          ? 'El enlace dejó de conducir a una publicación disponible.'
          : 'Mercado Libre informó que la publicación ya no está disponible.',
      public: false,
    }
  }

  const editorialState = getEditorialPublicationState(product)
  if (!editorialState.public) return editorialState

  if (product.is_visible === false) {
    return { key: 'manual-hidden', label: 'Oculto manualmente', public: false }
  }

  if (hasInactiveMercadoLibreStatus(product.ml_status)) {
    return { key: 'mercadolibre-inactive', label: 'Oferta inactiva', public: false }
  }

  return { key: 'published', label: 'Publicado', public: true }
}
