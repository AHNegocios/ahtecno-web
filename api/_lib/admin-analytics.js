const DAY_IN_MS = 24 * 60 * 60 * 1000
const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires'
const EVENT_KEYS = {
  product_view: 'product_views',
  outbound_click: 'outbound_clicks',
  share: 'shares',
}

const emptyMetrics = () => ({
  product_views: 0,
  outbound_clicks: 0,
  shares: 0,
})

export const getArgentinaDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ARGENTINA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [
      part.type,
      part.value,
    ]),
  )

  return `${values.year}-${values.month}-${values.day}`
}

export const getAnalyticsStartDate = (
  now = new Date(),
  windowDays = 60,
) => {
  const safeWindowDays = Math.max(1, Number(windowDays) || 60)
  return getArgentinaDateKey(
    new Date(now.getTime() - (safeWindowDays - 1) * DAY_IN_MS),
  )
}

const normalizeEventDate = (value) => {
  const text = String(value || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  return getArgentinaDateKey(value)
}

export const buildAdminAnalytics = (
  rows = [],
  { now = new Date(), windowDays = 60, limited = false } = {},
) => {
  const safeWindowDays = Math.max(1, Number(windowDays) || 60)
  const dateKeys = Array.from({ length: safeWindowDays }, (_, index) =>
    getArgentinaDateKey(
      new Date(
        now.getTime() -
          (safeWindowDays - index - 1) * DAY_IN_MS,
      ),
    ),
  )
  const allowedDates = new Set(dateKeys)
  const daily = new Map(
    dateKeys.map((date) => [date, { date, ...emptyMetrics() }]),
  )
  const productDaily = new Map()
  const sourceDaily = new Map()
  const sources = new Map()
  let totalEvents = 0

  rows.forEach((row) => {
    const metricKey = EVENT_KEYS[String(row.event_type || '').trim()]
    const date = normalizeEventDate(row.event_date || row.created_at)
    if (!metricKey || !allowedDates.has(date)) return

    const count = Math.max(0, Number(row.event_count) || 1)
    const dailyEntry = daily.get(date)
    dailyEntry[metricKey] += count
    totalEvents += count

    const productId = String(row.product_id || '').trim()
    if (productId) {
      const productKey = `${date}:${productId}`
      const productEntry = productDaily.get(productKey) || {
        date,
        product_id: productId,
        ...emptyMetrics(),
      }
      productEntry[metricKey] += count
      productDaily.set(productKey, productEntry)
    }

    const source = String(row.source || 'sin_origen').trim() || 'sin_origen'
    sources.set(source, (sources.get(source) || 0) + count)
    const sourceKey = `${date}:${source}`
    const sourceEntry = sourceDaily.get(sourceKey) || {
      date,
      source,
      count: 0,
    }
    sourceEntry.count += count
    sourceDaily.set(sourceKey, sourceEntry)
  })

  return {
    generated_at: now.toISOString(),
    window_days: safeWindowDays,
    total_events: totalEvents,
    limited,
    daily: [...daily.values()],
    product_daily: [...productDaily.values()],
    source_daily: [...sourceDaily.values()],
    sources: [...sources.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((first, second) => second.count - first.count),
  }
}
