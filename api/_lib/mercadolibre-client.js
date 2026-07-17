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

const isMissingResource = (error) =>
  [400, 403, 404].includes(error?.status)

export const normalizeItemId = (value) => {
  const itemId = String(value || '')
    .trim()
    .toUpperCase()

  if (!/^MLA\d+$/.test(itemId)) {
    throw new HttpError(400, 'El ID debe tener el formato MLA seguido de números.')
  }

  return itemId
}

const normalizePictures = (pictures = []) =>
  pictures
    .map((picture) => picture.secure_url || picture.url)
    .filter(Boolean)

const normalizeAttributes = (attributes = []) =>
  attributes
    .filter((attribute) => attribute?.name && attribute?.value_name)
    .map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      value: attribute.value_name,
    }))

const normalizeReviews = (reviews) => {
  const ratingLevels = reviews?.rating_levels || {}
  const reviewsCount =
    reviews?.paging?.total ??
    Object.values(ratingLevels).reduce(
      (total, value) => total + (Number(value) || 0),
      0,
    )

  return {
    ratingAverage: reviews?.rating_average ?? null,
    reviewsCount: reviewsCount || 0,
    samples: (reviews?.reviews || []).slice(0, 5).map((review) => ({
      id: review.id,
      title: review.title || '',
      content: review.content || '',
      rate: review.rate ?? null,
      date_created: review.date_created || null,
    })),
  }
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
  const pictures = normalizePictures(item.pictures)
  const attributes = normalizeAttributes(item.attributes)
  const reviewSummary = normalizeReviews(reviews)

  return {
    ml_id: item.id,
    titulo: item.title,
    precio: item.price,
    original_price: item.original_price ?? null,
    imagen: pictures[0] || item.secure_thumbnail || item.thumbnail,
    imagenes: pictures,
    descripcion: description?.plain_text || '',
    currency_id: item.currency_id || 'ARS',
    category_id: item.category_id || '',
    condition: item.condition || '',
    attributes,
    ml_permalink: item.permalink || '',
    ml_status: item.status || '',
    available_quantity: item.available_quantity ?? null,
    sold_quantity: item.sold_quantity ?? null,
    rating_average: reviewSummary.ratingAverage,
    reviews_count: reviewSummary.reviewsCount,
    opiniones: reviewSummary.samples,
    last_synced_at: new Date().toISOString(),
    sync_error: null,
  }
}

const fetchCatalogProductBundle = async (productId, accessToken) => {
  const product = await authorizedGet(
    `/products/${encodeURIComponent(productId)}`,
    accessToken,
  )
  const winnerItemId = product.buy_box_winner?.item_id

  const reviewsResult = winnerItemId
    ? await Promise.allSettled([
        authorizedGet(
          `/reviews/item/${encodeURIComponent(winnerItemId)}?catalog_product_id=${encodeURIComponent(productId)}`,
          accessToken,
        ),
      ])
    : []

  return {
    product,
    reviews:
      reviewsResult[0]?.status === 'fulfilled' ? reviewsResult[0].value : null,
  }
}

export const normalizeCatalogProduct = ({ product, reviews }) => {
  const winner = product.buy_box_winner
  const fallbackPrice = product.buy_box_winner_price_range?.min
  const price = winner?.price ?? fallbackPrice?.price

  if (price === null || price === undefined) {
    throw new HttpError(
      409,
      'Este producto de catálogo no tiene una oferta activa en este momento.',
    )
  }

  const pictures = normalizePictures(product.pictures)
  const attributes = normalizeAttributes(product.attributes)
  const reviewSummary = normalizeReviews(reviews)

  return {
    ml_id: product.id,
    titulo: product.name || product.family_name || 'Producto de Mercado Libre',
    precio: price,
    original_price: winner?.original_price ?? null,
    imagen: pictures[0] || '',
    imagenes: pictures,
    descripcion: product.short_description?.content || '',
    currency_id: winner?.currency_id || fallbackPrice?.currency_id || 'ARS',
    category_id: winner?.category_id || product.domain_id || '',
    condition: winner?.condition || '',
    attributes,
    ml_permalink: product.permalink || '',
    ml_status: product.status || '',
    available_quantity: winner?.available_quantity ?? null,
    sold_quantity: product.sold_quantity ?? null,
    rating_average: reviewSummary.ratingAverage,
    reviews_count: reviewSummary.reviewsCount,
    opiniones: reviewSummary.samples,
    last_synced_at: new Date().toISOString(),
    sync_error: null,
  }
}

export const fetchNormalizedProduct = async (mercadoLibreId, accessToken) => {
  try {
    return normalizeCatalogProduct(
      await fetchCatalogProductBundle(mercadoLibreId, accessToken),
    )
  } catch (catalogError) {
    if (!isMissingResource(catalogError)) throw catalogError
  }

  return normalizeProduct(
    await fetchProductBundle(mercadoLibreId, accessToken),
  )
}
