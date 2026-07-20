const allowedSources = new Set(['card', 'modal', 'detail', 'share'])

export const trackProductEvent = (productId, source) => {
  if (productId === null || productId === undefined || productId === '') return

  const normalizedSource = allowedSources.has(source) ? source : 'detail'
  const payload = JSON.stringify({
    product_id: String(productId),
    source: normalizedSource,
  })

  fetch('/api/analytics/outbound-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // La medición nunca debe impedir que el visitante abra o comparta la oferta.
  })
}
