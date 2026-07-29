import { getProductCampaignState } from './productCampaigns.js'
import { getProductPublicationState } from './productVisibility.js'

const severityWeight = {
  critical: 4,
  warning: 3,
  opportunity: 2,
  info: 1,
}

export const getLatestPriceChanges = (history = []) => {
  const grouped = new Map()
  ;[...history]
    .sort(
      (first, second) =>
        new Date(second.recorded_at).getTime() -
        new Date(first.recorded_at).getTime(),
    )
    .forEach((entry) => {
      const productId = String(entry.product_id)
      const values = grouped.get(productId) || []
      if (values.length < 2) values.push(entry)
      grouped.set(productId, values)
    })

  return new Map(
    [...grouped.entries()].map(([productId, entries]) => {
      const latest = Number(entries[0]?.price) || 0
      const previous = Number(entries[1]?.price) || 0
      const changePercent = previous
        ? ((latest - previous) / previous) * 100
        : 0
      return [
        productId,
        {
          latest,
          previous,
          changePercent,
          recordedAt: entries[0]?.recorded_at || null,
        },
      ]
    }),
  )
}

export const buildAdminAlerts = (
  products = [],
  priceHistory = [],
  now = new Date(),
) => {
  const alerts = []
  const priceChanges = getLatestPriceChanges(priceHistory)
  const nowTime = now.getTime()
  const threeDays = 3 * 24 * 60 * 60 * 1000

  products.forEach((product) => {
    const publication = getProductPublicationState(product)
    const productName = product.titulo || 'Producto sin título'

    if (publication.key === 'expired') {
      alerts.push({
        id: `expired-${product.id}`,
        productId: product.id,
        severity: 'critical',
        type: 'expired',
        title: 'Producto vencido',
        message: `${productName} está oculto del catálogo público.`,
      })
    }

    const failures = Number(product.consecutive_sync_failures) || 0
    if (failures >= 2) {
      alerts.push({
        id: `sync-${product.id}`,
        productId: product.id,
        severity: 'critical',
        type: 'sync',
        title: 'Sincronización fallida',
        message: `${productName} acumula ${failures} intentos fallidos.`,
      })
    }

    if (product.price_needs_review) {
      alerts.push({
        id: `price-${product.id}`,
        productId: product.id,
        severity: 'warning',
        type: 'price',
        title: 'Precio pendiente de revisión',
        message: `${productName} conserva un valor manual o anterior.`,
      })
    }

    const priceChange = priceChanges.get(String(product.id))
    if (priceChange?.previous && priceChange.changePercent <= -5) {
      alerts.push({
        id: `discount-${product.id}`,
        productId: product.id,
        severity: 'opportunity',
        type: 'discount',
        title: 'Oportunidad de descuento',
        message: `${productName} bajó ${Math.abs(priceChange.changePercent).toFixed(1)}%.`,
      })
    } else if (priceChange?.previous && priceChange.changePercent >= 10) {
      alerts.push({
        id: `increase-${product.id}`,
        productId: product.id,
        severity: 'warning',
        type: 'increase',
        title: 'Aumento importante',
        message: `${productName} subió ${priceChange.changePercent.toFixed(1)}%.`,
      })
    }

    const campaign = getProductCampaignState(product, now)
    const campaignEnd = product.featured_until
      ? new Date(product.featured_until).getTime()
      : null
    if (
      campaign.active &&
      campaignEnd &&
      campaignEnd > nowTime &&
      campaignEnd - nowTime <= threeDays
    ) {
      alerts.push({
        id: `campaign-${product.id}`,
        productId: product.id,
        severity: 'info',
        type: 'campaign',
        title: 'Campaña por finalizar',
        message: `${campaign.name} termina dentro de los próximos 3 días.`,
      })
    }
  })

  return alerts.sort(
    (first, second) =>
      severityWeight[second.severity] - severityWeight[first.severity],
  )
}
