import assert from 'node:assert/strict'
import test from 'node:test'
import { getProductCategory } from '../src/catalogConfig.js'

test('clasifica Smart Box y Chromecast dentro de Imagen y video', () => {
  assert.equal(
    getProductCategory({ titulo: 'Smart Box TV Box Android 13 Pro 4K Chromecast' }),
    'imagen-video',
  )
})

test('clasifica aspiradoras dentro de Tecnología para el hogar', () => {
  assert.equal(
    getProductCategory({ titulo: 'Aspiradora Manual Swiftvac 2 En 1' }),
    'hogar-tecnologia',
  )
})
