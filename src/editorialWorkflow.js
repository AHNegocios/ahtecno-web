export const EDITORIAL_STATUSES = ['draft', 'scheduled', 'published']

export const isScheduledPublicationDue = (product = {}, now = new Date()) => {
  if (product.publication_status !== 'scheduled') return false
  if (!product.planned_publish_at) return false

  const plannedAt = new Date(product.planned_publish_at)
  const reference = now instanceof Date ? now : new Date(now)
  return (
    !Number.isNaN(plannedAt.getTime()) &&
    !Number.isNaN(reference.getTime()) &&
    plannedAt <= reference
  )
}

export const isEditoriallyPublished = (product = {}, now = new Date()) => {
  const status = String(product.publication_status || '').trim().toLowerCase()
  if (!status) return true
  if (status === 'published') return true
  return status === 'scheduled' && isScheduledPublicationDue(product, now)
}

export const getEditorialPublicationState = (product = {}, now = new Date()) => {
  const status = String(product.publication_status || '').trim().toLowerCase()

  if (status === 'draft') {
    return { key: 'draft', label: 'Borrador', public: false }
  }

  if (status === 'scheduled' && !isScheduledPublicationDue(product, now)) {
    return { key: 'scheduled', label: 'Programado', public: false }
  }

  if (status === 'scheduled') {
    return { key: 'published', label: 'Publicado automáticamente', public: true }
  }

  return { key: 'published', label: 'Publicado', public: true }
}

