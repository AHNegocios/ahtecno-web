import assert from 'node:assert/strict'
import test from 'node:test'
import {
  formatProductCondition,
  normalizeGalleryImages,
  normalizeProductAttributes,
} from '../src/productDetails.js'

test('arma una galería sin imágenes vacías ni repetidas', () => {
  assert.deepEqual(
    normalizeGalleryImages(' portada.jpg ', ['portada.jpg', '', 'segunda.jpg']),
    ['portada.jpg', 'segunda.jpg'],
  )
})

test('descarta características incompletas y admite el formato original de Mercado Libre', () => {
  assert.deepEqual(
    normalizeProductAttributes([
      { id: 'BRAND', name: ' Marca ', value: ' Liliana ' },
      { id: 'POWER', name: 'Potencia', value_name: '600 W' },
      { id: 'EMPTY', name: 'Dato vacío', value: '' },
    ]),
    [
      { id: 'BRAND', name: 'Marca', value: 'Liliana' },
      { id: 'POWER', name: 'Potencia', value: '600 W' },
    ],
  )
})

test('traduce las condiciones conocidas sin ocultar valores nuevos', () => {
  assert.equal(formatProductCondition('new'), 'Nuevo')
  assert.equal(formatProductCondition('used'), 'Usado')
  assert.equal(formatProductCondition('refurbished'), 'Reacondicionado')
  assert.equal(formatProductCondition('custom'), 'custom')
})
