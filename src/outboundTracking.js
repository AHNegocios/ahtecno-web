const allowedEventTypes = new Set([
  'product_impression',
  'product_view',
  'favorite_add',
  'outbound_click',
  'share',
])
const allowedSources = new Set(['card', 'modal', 'detail'])
const trackedImpressions = new Set()

const normalizeTrafficChannel = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 40)

  if (!normalized) return ''
  if (normalized.includes('instagram')) return 'instagram'
  if (normalized.includes('tiktok')) return 'tiktok'
  if (normalized.includes('youtube')) return 'youtube'
  if (normalized.includes('whatsapp')) return 'whatsapp'
  if (normalized.includes('facebook')) return 'facebook'
  if (normalized.includes('google')) return 'google'
  return normalized
}

const getTrafficChannel = () => {
  if (typeof window === 'undefined') return 'direct'

  const stored = window.sessionStorage.getItem('ah_traffic_channel')
  if (stored) return stored

  const params = new URLSearchParams(window.location.search)
  let channel = normalizeTrafficChannel(params.get('utm_source'))

  if (!channel && document.referrer) {
    try {
      const referrer = new URL(document.referrer)
      channel =
        referrer.origin === window.location.origin
          ? 'direct'
          : normalizeTrafficChannel(referrer.hostname) || 'referral'
    } catch {
      channel = 'referral'
    }
  }

  const resolved = channel || 'direct'
  try {
    window.sessionStorage.setItem('ah_traffic_channel', resolved)
  } catch {
    // La atribución es opcional y nunca debe bloquear la navegación.
  }
  return resolved
}

export const trackProductEvent = (
  productId,
  eventType = 'outbound_click',
  source = 'detail',
) => {
  if (productId === null || productId === undefined || productId === '') return

  const normalizedEventType = allowedEventTypes.has(eventType)
    ? eventType
    : 'outbound_click'
  const normalizedSource = allowedSources.has(source) ? source : 'detail'
  const payload = JSON.stringify({
    product_id: String(productId),
    event_type: normalizedEventType,
    source: normalizedSource,
    channel: getTrafficChannel(),
  })

  fetch('/api/analytics/product-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // La medición nunca debe impedir que el visitante abra o comparta la oferta.
  })
}

export const trackProductImpression = (productId, source = 'card') => {
  const id = String(productId ?? '').trim()
  if (!id) return

  const key = `${id}:${source}`
  if (trackedImpressions.has(key)) return
  trackedImpressions.add(key)
  trackProductEvent(id, 'product_impression', source)
}
