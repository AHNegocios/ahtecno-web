import assert from 'node:assert/strict'
import test from 'node:test'
import {
  normalizeCatalogProduct,
  normalizeItemId,
} from './mercadolibre-client.js'

test('normaliza IDs de Mercado Libre sin alterar productos de catálogo', () => {
  assert.equal(normalizeItemId(' mla62407115 '), 'MLA62407115')
})

test('normaliza un producto de catálogo usando la oferta ganadora', () => {
  const normalized = normalizeCatalogProduct({
    product: {
      id: 'MLA62407115',
      status: 'active',
      name: 'Aspiradora Swiftvac',
      permalink: 'https://www.mercadolibre.com.ar/p/MLA62407115',
      pictures: [{ url: 'https://http2.mlstatic.com/product.jpg' }],
      attributes: [
        { id: 'BRAND', name: 'Marca', value_name: 'Liliana' },
      ],
      short_description: { content: 'Aspiradora manual 2 en 1.' },
      buy_box_winner: {
        item_id: 'MLA1690892165',
        price: 45999,
        original_price: 52999,
        currency_id: 'ARS',
        category_id: 'MLA4337',
        condition: 'new',
        available_quantity: 12,
      },
    },
    reviews: {
      rating_average: 4.8,
      paging: { total: 25 },
      reviews: [{ id: 1, rate: 5, content: 'Muy buena.' }],
    },
  })

  assert.equal(normalized.ml_id, 'MLA62407115')
  assert.equal(normalized.precio, 45999)
  assert.equal(normalized.original_price, 52999)
  assert.equal(normalized.rating_average, 4.8)
  assert.equal(normalized.reviews_count, 25)
  assert.equal(normalized.attributes[0].value, 'Liliana')
})

test('rechaza productos de catálogo sin una oferta activa', () => {
  assert.throws(
    () =>
      normalizeCatalogProduct({
        product: { id: 'MLA62407115', name: 'Producto sin oferta' },
        reviews: null,
      }),
    /no tiene una oferta activa/,
  )
})
