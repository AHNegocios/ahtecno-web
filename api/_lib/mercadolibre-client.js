import { HttpError } from './http.js'

const API_BASE_URL = 'https://api.mercadolibre.com'

const parseApiError = (status, payload) => {
  const message = payload?.message || payload?.error || 'Error de Mercado Libre.'
  return new HttpError(status, `Mercado Libre respondió: ${message}`)
}

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15_000),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw parseApiError(response.status, payload)
  return payload
}

const tokenRequest = (body) =>
  requestJson(`${API_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body),
  })

export const exchangeAuthorizationCode = (config, code, codeVerifier) =>
  tokenRequest({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
  })

export const refreshAccessToken = (config, refreshToken) =>
  tokenRequest({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
  })

const authorizedGet = (path, accessToken) =>
  requestJson(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

export const normalizeItemId = (value) => {
  const itemId = String(value || '')
    .trim()
    .toUpperCase()

  if (!/^MLA\d+$/.test(itemId)) {
    throw new HttpError(400, 'El ID debe tener el formato MLA seguido de números.')
  }

  return itemId
}

export const fetchProductBundle = async (itemId, accessToken) => {
  const item = await authorizedGet(
    `/items/${encodeURIComponent(itemId)}?include_attributes=all`,
    accessToken,
  )

  const [descriptionResult, reviewsResult] = await Promise.allSettled([
    authorizedGet(`/items/${encodeURIComponent(itemId)}/description`, accessToken),
    authorizedGet(`/reviews/item/${encodeURIComponent(itemId)}`, accessToken),
  ])

  return {
    item,
    description:
      descriptionResult.status === 'fulfilled' ? descriptionResult.value : null,
    reviews: reviewsResult.status === 'fulfilled' ? reviewsResult.value : null,
  }
}

export const normalizeProduct = ({ item, description, reviews }) => {
  const ratingLevels = reviews?.rating_levels || {}
  const reviewsCount =
    reviews?.paging?.total ??
    Object.values(ratingLevels).reduce(
      (total, value) => total + (Number(value) || 0),
      0,
    )

  return {
    ml_id: item.id,
    titulo: item.title,
    precio: item.price,
    imagen: item.pictures?.[0]?.secure_url || item.secure_thumbnail || item.thumbnail,
    descripcion: description?.plain_text || '',
    currency_id: item.currency_id || 'ARS',
    ml_permalink: item.permalink || '',
    ml_status: item.status || '',
    available_quantity: item.available_quantity ?? null,
    sold_quantity: item.sold_quantity ?? null,
    rating_average: reviews?.rating_average ?? null,
    reviews_count: reviewsCount || 0,
    last_synced_at: new Date().toISOString(),
    sync_error: null,
  }
}
