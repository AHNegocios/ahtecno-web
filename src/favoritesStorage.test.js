import assert from 'node:assert/strict'
import test from 'node:test'
import {
  normalizeFavoriteSnapshot,
  parseStoredFavorites,
} from './favoritesStorage.js'

test('guarda sólo una referencia pública y estable del favorito', () => {
  assert.deepEqual(
    normalizeFavoriteSnapshot(
      {
        id: 42,
        titulo: '  Teclado ',
        imagen: ' https://ejemplo.com/teclado.png ',
        precio: '19999',
        currency_id: 'ars',
        categoria: 'perifericos',
        ml_id: 'MLA123',
        reviewer_email: 'privado@ejemplo.com',
      },
      '2026-07-30T12:00:00.000Z',
    ),
    {
      id: '42',
      titulo: 'Teclado',
      imagen: 'https://ejemplo.com/teclado.png',
      precio: 19999,
      currency_id: 'ARS',
      categoria: 'perifericos',
      ml_id: 'MLA123',
      saved_at: '2026-07-30T12:00:00.000Z',
    },
  )
})

test('descarta favoritos dañados y evita duplicados', () => {
  assert.equal(parseStoredFavorites('no-es-json').length, 0)
  assert.equal(
    parseStoredFavorites([
      { id: 1, titulo: 'Primero' },
      { id: '1', titulo: 'Duplicado' },
      { titulo: 'Sin id' },
    ]).length,
    1,
  )
})
