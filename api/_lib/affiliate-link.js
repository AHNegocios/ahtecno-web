import {
  hasMercadoLibreProductReference,
  isUsableAffiliateLink,
  parseAffiliateLink,
} from '../../src/affiliateLinks.js'

const DEFINITIVE_UNAVAILABLE_STATUSES = new Set([404, 410])
const MAX_RESPONSE_SAMPLE_BYTES = 96_000

const normalizePageText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export const looksLikeUnavailableProductPage = (value = '') => {
  const pageText = normalizePageText(value)

  return [
    /no encontramos (?:este|el) producto/,
    /producto (?:no encontrado|no disponible)/,
    /publicacion (?:ya )?no (?:esta )?disponible/,
    /esta publicacion (?:finalizo|no existe)/,
  ].some((pattern) => pattern.test(pageText))
}

const readResponseSample = async (response) => {
  const reader = response.body?.getReader?.()
  if (!reader) return ''

  const decoder = new TextDecoder()
  let received = 0
  let sample = ''

  try {
    while (received < MAX_RESPONSE_SAMPLE_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      sample += decoder.decode(value, { stream: true })
    }
    sample += decoder.decode()
  } finally {
    await reader.cancel().catch(() => {})
  }

  return sample.slice(0, MAX_RESPONSE_SAMPLE_BYTES)
}

const requestAffiliateLink = async (url, fetchImpl, timeoutMs) => {
  const response = await fetchImpl(url, {
    method: 'GET',
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'AH-Tecno-Link-Checker/1.0',
      Range: `bytes=0-${MAX_RESPONSE_SAMPLE_BYTES - 1}`,
    },
  })

  return {
    response,
    sample: await readResponseSample(response),
  }
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
    const { response, sample } = await requestAffiliateLink(
      url,
      fetchImpl,
      timeoutMs,
    )

    if (DEFINITIVE_UNAVAILABLE_STATUSES.has(response.status)) {
      return {
        ok: false,
        definitive: true,
        reason: 'El enlace de afiliado ya no conduce a una publicación disponible.',
      }
    }

    if (response.ok && looksLikeUnavailableProductPage(sample)) {
      return {
        ok: false,
        definitive: true,
        reason:
          'Mercado Libre muestra que el producto o la publicación ya no está disponible.',
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
