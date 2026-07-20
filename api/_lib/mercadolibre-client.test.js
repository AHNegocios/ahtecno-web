import assert from 'node:assert/strict'
import test from 'node:test'
import {
  normalizeCatalogProduct,
  normalizeItemId,
  normalizeManualPrice,
  parseMercadoLibreReference,
} from './mercadolibre-client.js'

test('normaliza IDs de Mercado Libre sin alterar productos de catálogo', () => {
  assert.equal(normalizeItemId(' mla62407115 '), 'MLA62407115')
  assert.equal(normalizeItemId('MLA-1690892165'), 'MLA1690892165')
})

test('valida el precio manual sin aceptar valores vacíos o inválidos', () => {
  assert.equal(normalizeManualPrice(''), null)
  assert.equal(normalizeManualPrice('48449'), 48449)
  assert.equal(normalizeManualPrice('48449.90'), 48449.9)
  assert.throws(() => normalizeManualPrice('48.449,90'), /separadores de miles/)
  assert.throws(() => normalizeManualPrice(0), /mayor que cero/)
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
    offerItem: {
      id: 'MLA1690892165',
      status: 'paused',
      category_id: 'MLA401457',
      condition: 'new',
      available_quantity: 0,
      permalink: 'https://articulo.mercadolibre.com.ar/MLA1690892165',
    },
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
  assert.equal(normalized.ml_status, 'paused')
  assert.equal(normalized.category_id, 'MLA401457')
  assert.equal(normalized.available_quantity, 0)
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

test('usa el precio manual cuando Mercado Libre no informa uno', () => {
  const normalized = normalizeCatalogProduct(
    {
      product: {
        id: 'MLA47264969',
        name: 'Smart Box Android',
        pictures: [{ url: 'https://http2.mlstatic.com/smart-box.jpg' }],
      },
      offerItemId: 'MLA3592728068',
      salePrice: null,
      reviews: null,
    },
    { manualPrice: 48449 },
  )

  assert.equal(normalized.precio, 48449)
  assert.equal(normalized.price_source, 'manual')
  assert.equal(normalized.price_needs_review, true)
  assert.match(normalized.sync_error, /no informó el precio/)
})

test('prioriza el precio oficial aunque se haya escrito un respaldo manual', () => {
  const normalized = normalizeCatalogProduct(
    {
      product: { id: 'MLA47264969', name: 'Smart Box Android' },
      offerItemId: 'MLA3592728068',
      salePrice: { amount: 45999, currency_id: 'ARS' },
      reviews: null,
    },
    { manualPrice: 48449 },
  )

  assert.equal(normalized.precio, 45999)
  assert.equal(normalized.price_source, 'mercadolibre')
  assert.equal(normalized.price_needs_review, false)
  assert.equal(normalized.sync_error, null)
})
