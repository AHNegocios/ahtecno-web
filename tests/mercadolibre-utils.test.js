import assert from 'node:assert/strict'
import test from 'node:test'
import {
  normalizeItemId,
  normalizeProduct,
} from '../api/_lib/mercadolibre-client.js'
import { createPkcePair, safeEqual } from '../api/_lib/oauth-state.js'
import { decryptToken, encryptToken } from '../api/_lib/token-crypto.js'

test('normaliza IDs argentinos de Mercado Libre', () => {
  assert.equal(normalizeItemId(' mla123456 '), 'MLA123456')
  assert.throws(() => normalizeItemId('MLB123456'), /formato MLA/)
  assert.throws(() => normalizeItemId('123456'), /formato MLA/)
})

test('genera un par PKCE y compara estados sin aceptar valores distintos', () => {
  const { verifier, challenge } = createPkcePair()
  assert.ok(verifier.length >= 43)
  assert.ok(challenge.length >= 43)
  assert.equal(safeEqual('estado-seguro', 'estado-seguro'), true)
  assert.equal(safeEqual('estado-seguro', 'estado-falso'), false)
})

test('cifra y descifra tokens sin guardarlos en texto plano', () => {
  const key = Buffer.alloc(32, 7).toString('base64')
  const token = 'APP_USR-token-de-prueba'
  const encrypted = encryptToken(token, key)

  assert.notEqual(encrypted, token)
  assert.equal(decryptToken(encrypted, key), token)
})

test('normaliza la información que se guarda sin incluir el enlace de afiliado', () => {
  const normalized = normalizeProduct({
    item: {
      id: 'MLA123456',
      title: 'Producto de prueba',
      price: 15999,
      currency_id: 'ARS',
      pictures: [{ secure_url: 'https://http2.mlstatic.com/producto.jpg' }],
      attributes: [{ id: 'BRAND', name: 'Marca', value_name: 'AH' }],
      permalink: 'https://articulo.mercadolibre.com.ar/MLA-123456',
      status: 'active',
      available_quantity: 8,
      sold_quantity: 12,
    },
    description: { plain_text: 'Descripción de prueba' },
    reviews: {
      rating_average: 4.7,
      paging: { total: 35 },
      reviews: [{ id: 10, title: 'Muy bueno', content: 'Cumple', rate: 5 }],
    },
  })

  assert.equal(normalized.ml_id, 'MLA123456')
  assert.equal(normalized.precio, 15999)
  assert.equal(normalized.reviews_count, 35)
  assert.equal(normalized.descripcion, 'Descripción de prueba')
  assert.equal(normalized.attributes[0].value, 'AH')
  assert.equal(normalized.opiniones[0].rate, 5)
  assert.equal('link' in normalized, false)
})
