import assert from 'node:assert/strict'
import test from 'node:test'
import { HttpError } from './http.js'
import { isDefinitivelyUnavailableError } from './product-sync.js'

test('solo considera vencida una respuesta definitiva de Mercado Libre', () => {
  assert.equal(
    isDefinitivelyUnavailableError(
      new HttpError(404, 'Mercado Libre respondió: item not found'),
    ),
    true,
  )
  assert.equal(
    isDefinitivelyUnavailableError(
      new HttpError(
        410,
        'La publicación vinculada ya no existe o fue eliminada de Mercado Libre.',
      ),
    ),
    true,
  )
  assert.equal(
    isDefinitivelyUnavailableError({
      name: 'PostgrestError',
      status: 404,
      message: 'No se encontró una tabla',
    }),
    false,
  )
  assert.equal(
    isDefinitivelyUnavailableError(
      new HttpError(503, 'Mercado Libre no respondió temporalmente'),
    ),
    false,
  )
})
