import test from 'node:test'
import assert from 'node:assert/strict'
import {
  hasExtendedProductDetails,
  matchesPriceRange,
  normalizePriceRange,
} from './catalogFilters.js'

test('separa los productos en rangos de precio sin superponer límites', () => {
  assert.equal(matchesPriceRange({ precio: 50_000 }, 'hasta-50000'), true)
  assert.equal(matchesPriceRange({ precio: 50_000 }, '50000-100000'), false)
  assert.equal(matchesPriceRange({ precio: 50_001 }, '50000-100000'), true)
  assert.equal(matchesPriceRange({ precio: 100_000 }, '50000-100000'), true)
  assert.equal(matchesPriceRange({ precio: 100_001 }, 'mas-100000'), true)
})

test('un rango desconocido no oculta productos', () => {
  assert.equal(normalizePriceRange('inventado'), 'todos')
  assert.equal(matchesPriceRange({ precio: 20_000 }, 'inventado'), true)
})

test('reconoce productos con información ampliada', () => {
  assert.equal(hasExtendedProductDetails({ descripcion: 'Detalle' }), true)
  assert.equal(
    hasExtendedProductDetails({ attributes: [{ name: 'Marca', value: 'AH' }] }),
    true,
  )
  assert.equal(hasExtendedProductDetails({ imagenes: ['1', '2'] }), true)
  assert.equal(hasExtendedProductDetails({ imagenes: ['1'] }), false)
})
