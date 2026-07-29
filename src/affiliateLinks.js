const MERCADO_LIBRE_HOSTS = [
  'mercadolibre.com',
  'mercadolibre.com.ar',
  'meli.la',
]

const isAllowedHost = (hostname = '') => {
  const normalizedHostname = String(hostname).trim().toLowerCase()

  return MERCADO_LIBRE_HOSTS.some(
    (allowedHost) =>
      normalizedHostname === allowedHost ||
      normalizedHostname.endsWith(`.${allowedHost}`),
  )
}

export const parseAffiliateLink = (value) => {
  const normalizedValue = String(value || '').trim()
  if (!normalizedValue) return null

  try {
    const url = new URL(normalizedValue)
    if (url.protocol !== 'https:' || !isAllowedHost(url.hostname)) return null
    return url
  } catch {
    return null
  }
}

export const isUsableAffiliateLink = (value) => Boolean(parseAffiliateLink(value))

export const hasMercadoLibreProductReference = (value) => {
  const url = parseAffiliateLink(value)
  if (!url) return false

  return /(?:^|[^a-z0-9])MLA-?\d{6,}(?:[^0-9]|$)/i.test(
    `${url.pathname}${url.search}`,
  )
}
