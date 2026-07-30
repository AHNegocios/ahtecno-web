import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getProductCampaignState,
  sortProductsByActiveCampaign,
} from './productCampaigns.js'

const now = new Date('2026-07-29T12:00:00.000Z')

test('distingue campañas programadas, activas y finalizadas', () => {
  assert.equal(
    getProductCampaignState({
      campaign_name: 'Activa',
      featured_from: '2026-07-28T12:00:00.000Z',
      featured_until: '2026-07-30T12:00:00.000Z',
    }, now).key,
    'active',
  )
  assert.equal(
    getProductCampaignState({
      campaign_name: 'Mañana',
      featured_from: '2026-07-30T12:00:00.000Z',
    }, now).key,
    'scheduled',
  )
  assert.equal(
    getProductCampaignState({
      campaign_name: 'Anterior',
      featured_until: '2026-07-28T12:00:00.000Z',
    }, now).key,
    'finished',
  )
})

test('prioriza campañas activas sin alterar el resto del catálogo', () => {
  const products = [
    { id: 1, campaign_name: '' },
    {
      id: 2,
      campaign_name: 'Prioridad baja',
      featured_priority: 1,
    },
    {
      id: 3,
      campaign_name: 'Prioridad alta',
      featured_priority: 8,
    },
  ]

  assert.deepEqual(
    sortProductsByActiveCampaign(products, now).map(({ id }) => id),
    [3, 2, 1],
  )
})
