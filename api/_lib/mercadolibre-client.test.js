import assert from 'node:assert/strict'
import test from 'node:test'
import {
  normalizeCatalogProduct,
  normalizeItemId,
  parseMercadoLibreReference,
} from './mercadolibre-client.js'

test('normaliza IDs de Mercado Libre sin alterar productos de catálogo', () => {
  assert.equal(normalizeItemId(' mla62407115 '), 'MLA62407115')
  assert.equal(normalizeItemId('MLA-1690892165'), 'MLA1690892165')
})

test('extrae producto y oferta desde un enlace de catálogo', () => {
  const reference = parseMercadoLibreReference(
    'https://www.mercadolibre.com.ar/aspiradora/p/MLA62407115?filter=deal#position=2&wid=MLA1690892165&sid=offers',
  )

  assert.deepEqual(reference, {
    productId: 'MLA62407115',
    offerItemId: 'MLA1690892165',
  })
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
    offerItemId: 'MLA1690892165',
    salePrice: {
      amount: 43999,
      regular_amount: 52999,
      currency_id: 'ARS',
    },
    reviews: {
      rating_average: 4.8,
      paging: { total: 25 },
      reviews: [{ id: 1, rate: 5, content: 'Muy buena.' }],
    },
  })

  assert.equal(normalized.ml_id, 'MLA62407115')
  assert.equal(normalized.ml_item_id, 'MLA1690892165')
  assert.equal(normalized.precio, 43999)
  assert.equal(normalized.original_price, 52999)
  assert.equal(normalized.rating_average, 4.8)
  assert.equal(normalized.reviews_count, 25)
  assert.equal(normalized.attributes[0].value, 'Liliana')
})

test('pide el enlace completo cuando el catálogo no informa ganador', () => {
  assert.throws(
    () =>
      normalizeCatalogProduct({
        product: { id: 'MLA62407115', name: 'Producto sin oferta' },
        reviews: null,
      }),
    /Pegá el enlace común completo/,
  )
})
