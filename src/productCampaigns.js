export const getProductCampaignState = (
  product = {},
  now = new Date(),
) => {
  const name = String(product.campaign_name || '').trim()
  if (!name) return { key: 'none', label: 'Sin campaña', active: false }

  const from = product.featured_from
    ? new Date(product.featured_from)
    : null
  const until = product.featured_until
    ? new Date(product.featured_until)
    : null
  const currentTime = now.getTime()
  const startsAt = from && !Number.isNaN(from.getTime()) ? from.getTime() : null
  const endsAt = until && !Number.isNaN(until.getTime()) ? until.getTime() : null

  if (startsAt !== null && currentTime < startsAt) {
    return { key: 'scheduled', label: 'Programada', active: false, name }
  }
  if (endsAt !== null && currentTime > endsAt) {
    return { key: 'finished', label: 'Finalizada', active: false, name }
  }

  return { key: 'active', label: 'Activa', active: true, name }
}

export const sortProductsByActiveCampaign = (
  products = [],
  now = new Date(),
) =>
  [...products].sort((first, second) => {
    const firstState = getProductCampaignState(first, now)
    const secondState = getProductCampaignState(second, now)
    if (firstState.active !== secondState.active) {
      return firstState.active ? -1 : 1
    }

    if (firstState.active && secondState.active) {
      return (
        (Number(second.featured_priority) || 0) -
        (Number(first.featured_priority) || 0)
      )
    }

    return 0
  })

export const getActiveCampaignName = (product, now = new Date()) => {
  const campaign = getProductCampaignState(product, now)
  return campaign.active ? campaign.name : ''
}
