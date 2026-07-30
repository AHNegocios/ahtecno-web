import { requireAdmin } from '../_lib/admin-auth.js'
import {
  buildAdminAnalytics,
  getAnalyticsStartDate,
} from '../_lib/admin-analytics.js'
import { errorResponse, jsonResponse } from '../_lib/http.js'

const ANALYTICS_WINDOW_DAYS = 60
const RAW_EVENT_LIMIT = 5_000
const BASE_PRODUCT_FIELDS =
  'id, titulo, precio, currency_id, imagen, link, ml_id, categoria, is_visible, ml_status, price_source, price_needs_review, last_synced_at, sync_error'
const AVAILABILITY_FIELDS = ', unavailable_since, consecutive_sync_failures'
const CAMPAIGN_FIELDS =
  ', campaign_name, featured_from, featured_until, featured_priority'
const PRICE_REVIEW_FIELDS = ', manual_price_reviewed_at'

const loadAdminProducts = async (supabase) => {
  const runQuery = (fields) =>
    supabase
      .from('Productos')
      .select(fields)
      .order('created_at', { ascending: false })
      .limit(100)

  let availabilityConfigured = true
  let campaignsConfigured = true
  let priceReviewsConfigured = true
  let result

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const fields = [
      BASE_PRODUCT_FIELDS,
      availabilityConfigured ? AVAILABILITY_FIELDS : '',
      campaignsConfigured ? CAMPAIGN_FIELDS : '',
      priceReviewsConfigured ? PRICE_REVIEW_FIELDS : '',
    ].join('')
    result = await runQuery(fields)
    if (!result.error) break

    const message = String(result.error.message || '')
    if (
      priceReviewsConfigured &&
      /manual_price_reviewed_at/i.test(message)
    ) {
      priceReviewsConfigured = false
      continue
    }
    if (
      campaignsConfigured &&
      /campaign_name|featured_from|featured_until|featured_priority/i.test(
        message,
      )
    ) {
      campaignsConfigured = false
      continue
    }
    if (
      availabilityConfigured &&
      /unavailable_since|consecutive_sync_failures/i.test(message)
    ) {
      availabilityConfigured = false
      continue
    }
    break
  }

  if (result.error) throw result.error

  const latestReviews = new Map()
  if (priceReviewsConfigured) {
    const reviewsResult = await supabase
      .from('product_manual_price_reviews')
      .select('product_id, reviewer_email, reviewed_at')
      .order('reviewed_at', { ascending: false })
      .limit(200)

    if (reviewsResult.error) {
      priceReviewsConfigured = false
    } else {
      ;(reviewsResult.data || []).forEach((review) => {
        const productId = String(review.product_id)
        if (!latestReviews.has(productId)) {
          latestReviews.set(productId, review)
        }
      })
    }
  }

  return {
    campaignsConfigured,
    priceReviewsConfigured,
    products: (result.data || []).map((product) => ({
      ...product,
      campaign_name: product.campaign_name || null,
      featured_from: product.featured_from || null,
      featured_until: product.featured_until || null,
      featured_priority: Number(product.featured_priority) || 0,
      manual_price_reviewed_at:
        product.manual_price_reviewed_at || null,
      manual_price_reviewed_by:
        latestReviews.get(String(product.id))?.reviewer_email || null,
    })),
  }
}

const loadPriceHistory = async (supabase) => {
  const result = await supabase
    .from('product_price_history')
    .select(
      'id, product_id, price, currency_id, price_source, change_reason, recorded_at',
    )
    .order('recorded_at', { ascending: false })
    .limit(500)

  if (result.error) {
    return { configured: false, rows: [] }
  }

  return {
    configured: true,
    rows: (result.data || []).map((row) => ({
      ...row,
      price: Number(row.price) || 0,
    })),
  }
}

const loadAnalytics = async (supabase) => {
  const now = new Date()
  const startDate = getAnalyticsStartDate(now, ANALYTICS_WINDOW_DAYS)
  const dailyResult = await supabase
    .from('product_event_daily')
    .select(
      'event_date, product_id, event_type, source, event_count',
    )
    .gte('event_date', startDate)
    .order('event_date', { ascending: true })

  if (!dailyResult.error) {
    return buildAdminAnalytics(dailyResult.data || [], {
      now,
      windowDays: ANALYTICS_WINDOW_DAYS,
    })
  }

  const rawStartDate = new Date(
    now.getTime() -
      (ANALYTICS_WINDOW_DAYS - 1) * 24 * 60 * 60 * 1000,
  ).toISOString()
  const rawResult = await supabase
    .from('product_outbound_clicks')
    .select('created_at, product_id, event_type, source')
    .gte('created_at', rawStartDate)
    .order('created_at', { ascending: true })
    .limit(RAW_EVENT_LIMIT)

  if (rawResult.error) {
    console.error(dailyResult.error, rawResult.error)
    return buildAdminAnalytics([], {
      now,
      windowDays: ANALYTICS_WINDOW_DAYS,
    })
  }

  return buildAdminAnalytics(rawResult.data || [], {
    now,
    windowDays: ANALYTICS_WINDOW_DAYS,
    limited: (rawResult.data || []).length === RAW_EVENT_LIMIT,
  })
}

export async function GET(request) {
  try {
    const { supabase } = await requireAdmin(request)
    const {
      products: productRows,
      campaignsConfigured,
      priceReviewsConfigured,
    } = await loadAdminProducts(supabase)

    let eventsResult = await supabase
      .from('product_event_totals')
      .select('product_id, product_views, outbound_clicks, shares')

    if (eventsResult.error) {
      const clicksResult = await supabase
        .from('product_click_totals')
        .select('product_id, clicks')

      if (clicksResult.error) {
        console.error(eventsResult.error, clicksResult.error)
        eventsResult = { data: [], error: null }
      } else {
        eventsResult = {
          data: (clicksResult.data || []).map((row) => ({
            product_id: row.product_id,
            product_views: 0,
            outbound_clicks: row.clicks,
            shares: 0,
          })),
          error: null,
        }
      }
    }

    const eventTotals = new Map(
      (eventsResult.data || []).map((event) => [
        String(event.product_id),
        {
          product_views: Number(event.product_views) || 0,
          outbound_clicks: Number(event.outbound_clicks) || 0,
          shares: Number(event.shares) || 0,
        },
      ]),
    )
    const products = productRows.map((product) => ({
      ...product,
      product_views:
        eventTotals.get(String(product.id))?.product_views || 0,
      outbound_clicks:
        eventTotals.get(String(product.id))?.outbound_clicks || 0,
      shares: eventTotals.get(String(product.id))?.shares || 0,
    }))

    const priceHistory = await loadPriceHistory(supabase)
    return jsonResponse({
      ok: true,
      products,
      analytics: await loadAnalytics(supabase),
      price_history: priceHistory.rows,
      decision_center: {
        campaigns_configured: campaignsConfigured,
        price_history_configured: priceHistory.configured,
        price_reviews_configured: priceReviewsConfigured,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
