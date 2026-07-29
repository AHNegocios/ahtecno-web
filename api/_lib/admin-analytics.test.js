import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildAdminAnalytics,
  getAnalyticsStartDate,
  getArgentinaDateKey,
} from './admin-analytics.js'

test('agrupa eventos reales por día, producto y origen', () => {
  const now = new Date('2026-07-28T15:00:00.000Z')
  const analytics = buildAdminAnalytics(
    [
      {
        created_at: '2026-07-28T14:00:00.000Z',
        product_id: '10',
        event_type: 'product_view',
        source: 'modal',
      },
      {
        created_at: '2026-07-28T14:10:00.000Z',
        product_id: '10',
        event_type: 'outbound_click',
        source: 'modal',
      },
      {
        event_date: '2026-07-27',
        product_id: '20',
        event_type: 'share',
        source: 'detail',
        event_count: 3,
      },
    ],
    { now, windowDays: 3 },
  )

  assert.equal(analytics.total_events, 5)
  assert.deepEqual(analytics.daily[2], {
    date: '2026-07-28',
    product_views: 1,
    outbound_clicks: 1,
    shares: 0,
  })
  assert.deepEqual(analytics.daily[1], {
    date: '2026-07-27',
    product_views: 0,
    outbound_clicks: 0,
    shares: 3,
  })
  assert.deepEqual(analytics.sources, [
    { source: 'detail', count: 3 },
    { source: 'modal', count: 2 },
  ])
  assert.equal(analytics.product_daily.length, 2)
  assert.equal(analytics.source_daily.length, 2)
})

test('usa la fecha argentina y completa los días sin actividad', () => {
  assert.equal(
    getArgentinaDateKey('2026-07-28T01:30:00.000Z'),
    '2026-07-27',
  )
  assert.equal(
    getAnalyticsStartDate(new Date('2026-07-28T15:00:00.000Z'), 7),
    '2026-07-22',
  )

  const analytics = buildAdminAnalytics([], {
    now: new Date('2026-07-28T15:00:00.000Z'),
    windowDays: 7,
  })
  assert.equal(analytics.daily.length, 7)
  assert.equal(analytics.total_events, 0)
})
