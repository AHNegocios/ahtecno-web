import { getMercadoLibreOAuthConfig } from '../_lib/config.js'
import {
  errorResponse,
  HttpError,
  parseCookies,
  serializeCookie,
} from '../_lib/http.js'
import { exchangeAuthorizationCode } from '../_lib/mercadolibre-client.js'
import { safeEqual } from '../_lib/oauth-state.js'
import { createSupabaseAdmin } from '../_lib/supabase-admin.js'
import { saveOAuthTokens } from '../_lib/token-store.js'

const clearOAuthCookie = (name) =>
  serializeCookie(name, '', {
    maxAge: 0,
    path: '/api/mercadolibre',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  })

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const providerError = url.searchParams.get('error')
    if (providerError) {
      throw new HttpError(400, 'La autorización de Mercado Libre fue cancelada.')
    }

    const code = url.searchParams.get('code')
    const returnedState = url.searchParams.get('state')
    const cookies = parseCookies(request)

    if (!code || !safeEqual(returnedState, cookies.meli_oauth_state)) {
      throw new HttpError(400, 'La respuesta de autorización no es válida.')
    }
    if (!cookies.meli_oauth_verifier) {
      throw new HttpError(400, 'La autorización venció. Iniciá nuevamente.')
    }

    const tokenPayload = await exchangeAuthorizationCode(
      getMercadoLibreOAuthConfig(),
      code,
      cookies.meli_oauth_verifier,
    )
    await saveOAuthTokens(createSupabaseAdmin(), tokenPayload)

    const destination = new URL('/admin', request.url)
    destination.searchParams.set('mercadolibre', 'connected')
    const headers = new Headers({
      Location: destination.toString(),
      'Cache-Control': 'no-store',
    })
    headers.append('Set-Cookie', clearOAuthCookie('meli_oauth_state'))
    headers.append('Set-Cookie', clearOAuthCookie('meli_oauth_verifier'))

    return new Response(null, { status: 303, headers })
  } catch (error) {
    return errorResponse(error)
  }
}
