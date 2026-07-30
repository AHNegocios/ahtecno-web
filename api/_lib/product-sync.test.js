import assert from 'node:assert/strict'
import test from 'node:test'
import { HttpError } from './http.js'
import {
  isDefinitivelyUnavailableError,
  summarizeSyncResults,
} from './product-sync.js'

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

test('distingue actualizados, vencidos, omitidos y errores reales', () => {
  const summary = summarizeSyncResults([
    {
      ok: true,
      product: {
        ml_status: 'active',
        price_needs_review: false,
      },
    },
    {
      ok: true,
      skipped: true,
      product: {
        ml_status: 'active',
        price_needs_review: false,
      },
    },
    {
      ok: true,
      product: {
        ml_status: 'not_found',
        price_needs_review: false,
      },
    },
    {
      ok: false,
      productId: 4,
      title: 'Producto con error',
      error: 'Mercado Libre no respondió.',
    },
  ])

  assert.deepEqual(summary, {
    total: 4,
    updated: 2,
    failed: 1,
    skipped: 1,
    needsReview: 0,
    hidden: 1,
    expired: 1,
    failures: [
      {
        ok: false,
        productId: 4,
        title: 'Producto con error',
        error: 'Mercado Libre no respondió.',
      },
    ],
  })
})
