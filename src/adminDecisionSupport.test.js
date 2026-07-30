import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildAdminAlerts,
  doesPriceNeedReview,
  getCampaignRecommendation,
  getLatestPriceChanges,
} from './adminDecisionSupport.js'

test('detecta aumentos y descuentos usando los dos últimos precios', () => {
  const changes = getLatestPriceChanges([
    { product_id: '1', price: 800, recorded_at: '2026-07-29T12:00:00Z' },
    { product_id: '1', price: 1000, recorded_at: '2026-07-28T12:00:00Z' },
  ])

  assert.equal(changes.get('1').changePercent, -20)
})

test('todo precio manual requiere revisión y uno automático no', () => {
  assert.equal(
    doesPriceNeedReview({
      price_source: 'manual',
      price_needs_review: false,
    }),
    true,
  )
  assert.equal(
    doesPriceNeedReview({
      price_source: 'mercadolibre',
      price_needs_review: false,
    }),
    false,
  )
})

test('prioriza vencidos y fallas antes que oportunidades', () => {
  const alerts = buildAdminAlerts(
    [
      {
        id: 1,
        titulo: 'Vencido',
        link: 'https://meli.la/2abc123',
        ml_status: 'not_found',
        consecutive_sync_failures: 2,
      },
      {
        id: 2,
        titulo: 'Descuento',
        link: 'https://meli.la/2abc456',
        ml_status: 'active',
      },
    ],
    [
      { product_id: '2', price: 800, recorded_at: '2026-07-29T12:00:00Z' },
      { product_id: '2', price: 1000, recorded_at: '2026-07-28T12:00:00Z' },
    ],
    new Date('2026-07-29T15:00:00Z'),
  )

  assert.equal(alerts[0].severity, 'critical')
  assert.equal(alerts.at(-1).severity, 'opportunity')
  assert.equal(
    alerts.filter((alert) => String(alert.productId) === '1').length,
    1,
  )
  assert.equal(alerts.some((alert) => alert.id === 'price-2'), true)
})

test('recomienda automáticamente una oferta pública con mejores señales', () => {
  const recommendation = getCampaignRecommendation(
    [
      {
        id: 1,
        titulo: 'Producto vencido',
        precio: 1000,
        link: 'https://meli.la/2abc123',
        ml_status: 'not_found',
        price_source: 'mercadolibre',
      },
      {
        id: 2,
        titulo: 'Producto con descuento',
        precio: 800,
        link: 'https://meli.la/2abc456',
        ml_status: 'active',
        price_source: 'mercadolibre',
        outbound_clicks: 2,
      },
      {
        id: 3,
        titulo: 'Producto con vistas',
        precio: 1200,
        link: 'https://meli.la/2abc789',
        ml_status: 'active',
        price_source: 'manual',
        product_views: 3,
      },
    ],
    [
      { product_id: '2', price: 800, recorded_at: '2026-07-29T12:00:00Z' },
      { product_id: '2', price: 1000, recorded_at: '2026-07-28T12:00:00Z' },
    ],
  )

  assert.equal(recommendation.product.id, 2)
  assert.match(recommendation.reason, /bajó 20\.0%/)
})
