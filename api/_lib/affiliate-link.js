import {
  hasMercadoLibreProductReference,
  isUsableAffiliateLink,
  parseAffiliateLink,
} from '../../src/affiliateLinks.js'

const DEFINITIVE_UNAVAILABLE_STATUSES = new Set([404, 410])

const requestAffiliateLink = async (url, fetchImpl, timeoutMs) => {
  const response = await fetchImpl(url, {
    method: 'GET',
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'AH-Tecno-Link-Checker/1.0',
      Range: 'bytes=0-0',
    },
  })

  await response.body?.cancel().catch(() => {})

  return response
}

export const verifyAffiliateLink = async (
  value,
  { fetchImpl = fetch, timeoutMs = 8_000 } = {},
) => {
  const url = parseAffiliateLink(value)

  if (!url) {
    return {
      ok: false,
      definitive: true,
      reason: 'El enlace de afiliado está vacío, tiene un formato inválido o no pertenece a Mercado Libre.',
    }
  }

  try {
    const response = await requestAffiliateLink(url, fetchImpl, timeoutMs)

    if (DEFINITIVE_UNAVAILABLE_STATUSES.has(response.status)) {
      return {
        ok: false,
        definitive: true,
        reason: 'El enlace de afiliado ya no conduce a una publicación disponible.',
      }
    }

    if (response.ok) {
      const finalUrl = response.url || url.href
      if (!isUsableAffiliateLink(finalUrl)) {
        return {
          ok: false,
          definitive: true,
          reason: 'El enlace de afiliado redirige fuera de Mercado Libre.',
        }
      }

      if (!hasMercadoLibreProductReference(finalUrl)) {
        return {
          ok: false,
          definitive: true,
          reason:
            'El enlace de afiliado ya no conduce a la publicación del producto.',
        }
      }

      return { ok: true, definitive: true, reason: '' }
    }

    return {
      ok: null,
      definitive: false,
      reason: `No pudimos confirmar el enlace en este intento (estado ${response.status}).`,
    }
  } catch {
    return {
      ok: null,
      definitive: false,
      reason: 'No pudimos confirmar el enlace por un error temporal de conexión.',
    }
  }
}
