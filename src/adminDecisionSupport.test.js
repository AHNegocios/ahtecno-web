import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildAdminAlerts,
  getLatestPriceChanges,
} from './adminDecisionSupport.js'

test('detecta aumentos y descuentos usando los dos últimos precios', () => {
  const changes = getLatestPriceChanges([
    { product_id: '1', price: 800, recorded_at: '2026-07-29T12:00:00Z' },
    { product_id: '1', price: 1000, recorded_at: '2026-07-28T12:00:00Z' },
  ])

  assert.equal(changes.get('1').changePercent, -20)
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
})
