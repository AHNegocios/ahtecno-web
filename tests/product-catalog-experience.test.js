import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getProductPath,
  normalizeProductIdentifier,
  slugifyProductTitle,
} from '../src/productUrls.js'
import {
  getProductPublicationState,
  isProductPubliclyVisible,
} from '../src/productVisibility.js'

test('crea una dirección legible y estable usando el ID de Mercado Libre', () => {
  assert.equal(
    getProductPath({ ml_id: 'MLA62407115', titulo: 'Aspiradora Manual Swiftvac 2 en 1' }),
    '/producto/MLA62407115/aspiradora-manual-swiftvac-2-en-1',
  )
  assert.equal(slugifyProductTitle('Cámara Wi‑Fi 4K'), 'camara-wi-fi-4k')
})

test('solo admite identificadores públicos controlados', () => {
  assert.deepEqual(normalizeProductIdentifier('MLA-62407115'), {
    field: 'ml_id',
    value: 'MLA62407115',
  })
  assert.deepEqual(normalizeProductIdentifier('42'), { field: 'id', value: 42 })
  assert.equal(normalizeProductIdentifier('algo-invalido'), null)
})

test('oculta productos pausados, cerrados o desactivados manualmente', () => {
  assert.equal(isProductPubliclyVisible({ ml_status: 'active', is_visible: true }), true)
  assert.equal(isProductPubliclyVisible({ ml_status: 'paused', is_visible: true }), false)
  assert.equal(isProductPubliclyVisible({ ml_status: '', is_visible: false }), false)
  assert.deepEqual(getProductPublicationState({ ml_status: 'closed' }), {
    key: 'mercadolibre-inactive',
    label: 'Oferta inactiva',
    public: false,
  })
})
