const METRIC_KEYS = ['product_views', 'outbound_clicks', 'shares']

const emptyMetrics = () => ({
  product_views: 0,
  outbound_clicks: 0,
  shares: 0,
})

const sumRows = (rows = []) =>
  rows.reduce((totals, row) => {
    METRIC_KEYS.forEach((key) => {
      totals[key] += Number(row[key]) || 0
    })
    return totals
  }, emptyMetrics())

const percentChange = (current, previous) => {
  if (!previous) return current ? null : 0
  return ((current - previous) / previous) * 100
}

export const getPeriodAnalytics = (analytics = {}, periodDays = 30) => {
  const safePeriod = [7, 30].includes(Number(periodDays))
    ? Number(periodDays)
    : 30
  const daily = analytics.daily || []
  const currentRows = daily.slice(-safePeriod)
  const previousRows = daily.slice(-(safePeriod * 2), -safePeriod)
  const current = sumRows(currentRows)
  const previous = sumRows(previousRows)

  return {
    days: safePeriod,
    currentRows,
    previousRows,
    current,
    previous,
    changes: {
      product_views: percentChange(
        current.product_views,
        previous.product_views,
      ),
      outbound_clicks: percentChange(
        current.outbound_clicks,
        previous.outbound_clicks,
      ),
      shares: percentChange(current.shares, previous.shares),
    },
    currentCtr: current.product_views
      ? (current.outbound_clicks / current.product_views) * 100
      : 0,
    previousCtr: previous.product_views
      ? (previous.outbound_clicks / previous.product_views) * 100
      : 0,
  }
}

export const getProductPeriodPerformance = (
  products = [],
  analytics = {},
  periodDays = 30,
) => {
  const { currentRows } = getPeriodAnalytics(analytics, periodDays)
  const currentDates = new Set(currentRows.map((row) => row.date))
  const previousDates = new Set(
    (analytics.daily || [])
      .slice(-(periodDays * 2), -periodDays)
      .map((row) => row.date),
  )
  const performance = new Map(
    products.map((product) => [
      String(product.id),
      {
        product,
        current: emptyMetrics(),
        previous: emptyMetrics(),
      },
    ]),
  )

  ;(analytics.product_daily || []).forEach((row) => {
    const entry = performance.get(String(row.product_id))
    if (!entry) return

    const target = currentDates.has(row.date)
      ? entry.current
      : previousDates.has(row.date)
        ? entry.previous
        : null
    if (!target) return

    METRIC_KEYS.forEach((key) => {
      target[key] += Number(row[key]) || 0
    })
  })

  return [...performance.values()]
    .map((entry) => ({
      ...entry,
      ctr: entry.current.product_views
        ? (entry.current.outbound_clicks / entry.current.product_views) * 100
        : 0,
      clickChange: percentChange(
        entry.current.outbound_clicks,
        entry.previous.outbound_clicks,
      ),
    }))
    .sort(
      (first, second) =>
        second.current.outbound_clicks - first.current.outbound_clicks ||
        second.current.product_views - first.current.product_views ||
        String(first.product.titulo || '').localeCompare(
          String(second.product.titulo || ''),
          'es',
        ),
    )
}

export const formatAnalyticsChange = (change, current = 0) => {
  if (change === null) {
    return current
      ? { label: 'Nuevo en este período', direction: 'up' }
      : { label: 'Sin actividad', direction: 'neutral' }
  }

  if (Math.abs(change) < 0.05) {
    return { label: 'Sin cambios', direction: 'neutral' }
  }

  return {
    label: `${change > 0 ? '+' : ''}${Math.round(change)}% vs. período anterior`,
    direction: change > 0 ? 'up' : 'down',
  }
}
