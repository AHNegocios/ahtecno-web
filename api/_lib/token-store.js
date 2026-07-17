import { getMercadoLibreOAuthConfig, getTokenEncryptionKey } from './config.js'
import { HttpError } from './http.js'
import { refreshAccessToken } from './mercadolibre-client.js'
import { decryptToken, encryptToken } from './token-crypto.js'

const TABLE_NAME = 'mercadolibre_credentials'

const expiresAtFrom = (tokenPayload) =>
  new Date(Date.now() + Number(tokenPayload.expires_in || 0) * 1000).toISOString()

export const saveOAuthTokens = async (
  supabase,
  tokenPayload,
  previousRefreshToken = null,
) => {
  const encryptionKey = getTokenEncryptionKey()
  const refreshToken = tokenPayload.refresh_token || previousRefreshToken

  if (!tokenPayload.access_token || !refreshToken) {
    throw new HttpError(502, 'Mercado Libre no devolvió las credenciales esperadas.')
  }

  const record = {
    id: 1,
    access_token_encrypted: encryptToken(tokenPayload.access_token, encryptionKey),
    refresh_token_encrypted: encryptToken(refreshToken, encryptionKey),
    token_type: tokenPayload.token_type || 'bearer',
    scope: tokenPayload.scope || '',
    mercado_libre_user_id: tokenPayload.user_id || null,
    expires_at: expiresAtFrom(tokenPayload),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(record, { onConflict: 'id' })

  if (error) {
    console.error(error)
    throw new HttpError(500, 'No se pudieron guardar las credenciales protegidas.')
  }
}

export const loadOAuthTokens = async (supabase) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    console.error(error)
    throw new HttpError(500, 'No se pudo consultar la conexión con Mercado Libre.')
  }

  if (!data) throw new HttpError(409, 'Mercado Libre todavía no está conectado.')

  const encryptionKey = getTokenEncryptionKey()
  return {
    ...data,
    accessToken: decryptToken(data.access_token_encrypted, encryptionKey),
    refreshToken: decryptToken(data.refresh_token_encrypted, encryptionKey),
  }
}

export const getValidAccessToken = async (supabase) => {
  const stored = await loadOAuthTokens(supabase)
  const expiresAt = new Date(stored.expires_at).getTime()
  const refreshThreshold = Date.now() + 5 * 60 * 1000

  if (Number.isFinite(expiresAt) && expiresAt > refreshThreshold) {
    return stored.accessToken
  }

  const refreshed = await refreshAccessToken(
    getMercadoLibreOAuthConfig(),
    stored.refreshToken,
  )
  await saveOAuthTokens(supabase, refreshed, stored.refreshToken)
  return refreshed.access_token
}
