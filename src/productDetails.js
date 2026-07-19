const cleanText = (value) =>
  typeof value === 'string' ? value.trim() : ''

export const normalizeGalleryImages = (coverImage, images) =>
  [...new Set([
    cleanText(coverImage),
    ...(Array.isArray(images) ? images.map(cleanText) : []),
  ].filter(Boolean))]

export const normalizeProductAttributes = (attributes) =>
  (Array.isArray(attributes) ? attributes : [])
    .map((attribute) => ({
      id: cleanText(attribute?.id),
      name: cleanText(attribute?.name),
      value: cleanText(attribute?.value || attribute?.value_name),
    }))
    .filter(({ name, value }) => name && value)

export const formatProductCondition = (condition) => {
  const normalized = cleanText(condition).toLowerCase()

  if (normalized === 'new') return 'Nuevo'
  if (normalized === 'used') return 'Usado'
  if (normalized === 'refurbished') return 'Reacondicionado'

  return cleanText(condition)
}
