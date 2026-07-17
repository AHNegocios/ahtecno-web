import { requireAdmin } from '../_lib/admin-auth.js'
import { getMercadoLibreOAuthConfig } from '../_lib/config.js'
import { errorResponse, jsonResponse, serializeCookie } from '../_lib/http.js'
import { createOAuthState, createPkcePair } from '../_lib/oauth-state.js'

const COOKIE_OPTIONS = {
  maxAge: 10 * 60,
  path: '/api/mercadolibre',
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
}

export async function POST(request) {
  try {
    await requireAdmin(request)
    const config = getMercadoLibreOAuthConfig()
    const state = createOAuthState()
    const { verifier, challenge } = createPkcePair()
    const authorizationUrl = new URL(
      'https://auth.mercadolibre.com.ar/authorization',
    )

    authorizationUrl.search = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    }).toString()

    const response = jsonResponse({
      ok: true,
      authorizationUrl: authorizationUrl.toString(),
    })
    response.headers.append(
      'Set-Cookie',
      serializeCookie('meli_oauth_state', state, COOKIE_OPTIONS),
    )
    response.headers.append(
      'Set-Cookie',
      serializeCookie('meli_oauth_verifier', verifier, COOKIE_OPTIONS),
    )

    return response
  } catch (error) {
    return errorResponse(error)
  }
}
