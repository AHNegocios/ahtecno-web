import test from 'node:test'
import assert from 'node:assert/strict'
import {
  prependRecentProduct,
  RECENT_PRODUCTS_LIMIT,
} from './recentProductsStorage.js'

test('mueve al frente el producto visto y evita duplicados', () => {
  const current = [
    { id: '1', titulo: 'Primero', seen_at: '2026-07-29T10:00:00Z' },
    { id: '2', titulo: 'Segundo', seen_at: '2026-07-29T09:00:00Z' },
  ]

  const next = prependRecentProduct(
    current,
    { id: 2, titulo: 'Segundo actualizado', precio: 20 },
    '2026-07-30T10:00:00Z',
  )

  assert.equal(next.length, 2)
  assert.equal(next[0].id, '2')
  assert.equal(next[0].titulo, 'Segundo actualizado')
  assert.equal(next[0].seen_at, '2026-07-30T10:00:00Z')
})

test('conserva como máximo seis productos recientes', () => {
  let products = []

  for (let index = 0; index < RECENT_PRODUCTS_LIMIT + 3; index += 1) {
    products = prependRecentProduct(products, {
      id: index,
      titulo: `Producto ${index}`,
    })
  }

  assert.equal(products.length, RECENT_PRODUCTS_LIMIT)
  assert.equal(products[0].id, String(RECENT_PRODUCTS_LIMIT + 2))
})
