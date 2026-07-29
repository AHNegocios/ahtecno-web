import assert from 'node:assert/strict'
import test from 'node:test'
import { hasPriceChanged, recordPriceHistory } from './price-history.js'

test('solo detecta variaciones válidas de precio', () => {
  assert.equal(hasPriceChanged(1000, 1000), false)
  assert.equal(hasPriceChanged(1000, 900), true)
  assert.equal(hasPriceChanged(null, 900), true)
  assert.equal(hasPriceChanged(1000, null), false)
})

test('registra una variación sin interrumpir si la tabla aún no existe', async () => {
  const inserted = []
  const supabase = {
    from: () => ({
      insert: async (payload) => {
        inserted.push(payload)
        return { error: null }
      },
    }),
  }

  const result = await recordPriceHistory(
    supabase,
    { precio: 1000 },
    {
      id: 7,
      precio: 850,
      currency_id: 'ARS',
      price_source: 'mercadolibre',
    },
    'sync',
  )

  assert.equal(result.recorded, true)
  assert.equal(inserted[0].price, 850)
  assert.equal(inserted[0].product_id, '7')
})
