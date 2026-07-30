import assert from 'node:assert/strict'
import test from 'node:test'
import {
  formatAnalyticsChange,
  getPeriodAnalytics,
  getProductPeriodPerformance,
} from './adminDashboardAnalytics.js'

const daily = Array.from({ length: 14 }, (_, index) => ({
  date: `2026-07-${String(index + 1).padStart(2, '0')}`,
  product_impressions: index < 7 ? 2 : 4,
  product_views: index < 7 ? 1 : 2,
  favorites_added: index < 7 ? 0 : 1,
  outbound_clicks: index < 7 ? 0 : 1,
  shares: 0,
}))

test('compara el período elegido contra el período anterior', () => {
  const result = getPeriodAnalytics({ daily }, 7)

  assert.equal(result.current.product_views, 14)
  assert.equal(result.current.product_impressions, 28)
  assert.equal(result.current.favorites_added, 7)
  assert.equal(result.previous.product_views, 7)
  assert.equal(result.current.outbound_clicks, 7)
  assert.equal(result.changes.product_views, 100)
  assert.equal(result.currentCtr, 50)
  assert.equal(result.currentDetailRate, 50)
  assert.equal(result.currentFavoriteRate, 50)
})

test('ordena productos por clics dentro del período', () => {
  const products = [
    { id: 1, titulo: 'Uno' },
    { id: 2, titulo: 'Dos' },
  ]
  const result = getProductPeriodPerformance(
    products,
    {
      daily,
      product_daily: [
        {
          date: '2026-07-14',
          product_id: '2',
          product_impressions: 6,
          product_views: 3,
          favorites_added: 1,
          outbound_clicks: 2,
          shares: 1,
        },
        {
          date: '2026-07-14',
          product_id: '1',
          product_impressions: 10,
          product_views: 5,
          favorites_added: 2,
          outbound_clicks: 1,
          shares: 0,
        },
      ],
    },
    7,
  )

  assert.equal(result[0].product.id, 2)
  assert.ok(Math.abs(result[0].ctr - 200 / 3) < 0.000001)
  assert.equal(result[0].detailRate, 50)
})

test('describe crecimientos nuevos sin dividir por cero', () => {
  assert.deepEqual(formatAnalyticsChange(null, 3), {
    label: 'Nuevo en este período',
    direction: 'up',
  })
  assert.deepEqual(formatAnalyticsChange(0, 0), {
    label: 'Sin cambios',
    direction: 'neutral',
  })
})
