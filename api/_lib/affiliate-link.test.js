import assert from 'node:assert/strict'
import test from 'node:test'
import { isUsableAffiliateLink } from '../../src/affiliateLinks.js'
import { verifyAffiliateLink } from './affiliate-link.js'

test('solo acepta enlaces HTTPS de Mercado Libre', () => {
  assert.equal(isUsableAffiliateLink('https://meli.la/2abc123'), true)
  assert.equal(
    isUsableAffiliateLink('https://www.mercadolibre.com.ar/producto'),
    true,
  )
  assert.equal(isUsableAffiliateLink('http://meli.la/2abc123'), false)
  assert.equal(isUsableAffiliateLink('https://mercadolibre.com.ar.ejemplo.com'), false)
  assert.equal(isUsableAffiliateLink('javascript:alert(1)'), false)
})

test('marca como definitivo un enlace inválido o eliminado', async () => {
  let requests = 0
  const invalidResult = await verifyAffiliateLink('https://ejemplo.com/oferta', {
    fetchImpl: async () => {
      requests += 1
      return new Response('', { status: 200 })
    },
  })

  assert.equal(invalidResult.ok, false)
  assert.equal(invalidResult.definitive, true)
  assert.equal(requests, 0)

  const deletedResult = await verifyAffiliateLink('https://meli.la/vencido', {
    fetchImpl: async () => new Response('', { status: 404 }),
  })

  assert.equal(deletedResult.ok, false)
  assert.equal(deletedResult.definitive, true)

  const redirectedToProfile = await verifyAffiliateLink(
    'https://meli.la/vencido',
    {
      fetchImpl: async () => ({
        status: 200,
        ok: true,
        url: 'https://www.mercadolibre.com.ar/social/ahtecno/lists',
        body: null,
      }),
    },
  )

  assert.equal(redirectedToProfile.ok, false)
  assert.equal(redirectedToProfile.definitive, true)
})

test('no oculta por errores temporales y admite enlaces disponibles', async () => {
  const temporaryResult = await verifyAffiliateLink('https://meli.la/temporal', {
    fetchImpl: async () => new Response('', { status: 503 }),
  })

  assert.equal(temporaryResult.ok, null)
  assert.equal(temporaryResult.definitive, false)

  const availableResult = await verifyAffiliateLink('https://meli.la/disponible', {
    fetchImpl: async () => ({
      status: 200,
      ok: true,
      url: 'https://www.mercadolibre.com.ar/aspiradora/p/MLA62407115',
      body: null,
    }),
  })

  assert.equal(availableResult.ok, true)
  assert.equal(availableResult.definitive, true)
})
