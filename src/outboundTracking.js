const allowedEventTypes = new Set(['outbound_click', 'product_view', 'share'])
const allowedSources = new Set(['card', 'modal', 'detail'])

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
