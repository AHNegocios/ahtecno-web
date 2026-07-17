import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeItemId } from '../api/_lib/mercadolibre-client.js'
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
