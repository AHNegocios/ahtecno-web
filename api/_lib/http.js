export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export const jsonResponse = (payload, status = 200, headers = {}) =>
  Response.json(payload, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
  })

export const errorResponse = (error) => {
  const status = Number.isInteger(error?.status) ? error.status : 500
  const message =
    status >= 500
      ? 'No pudimos completar la operación en este momento.'
      : error.message

  if (status >= 500) console.error(error)
  return jsonResponse({ ok: false, error: message }, status)
}

export const parseCookies = (request) => {
  const cookieHeader = request.headers.get('cookie') || ''
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf('=')
        const key = separator >= 0 ? part.slice(0, separator) : part
        const value = separator >= 0 ? part.slice(separator + 1) : ''
        return [key, decodeURIComponent(value)]
      }),
  )
}

export const serializeCookie = (name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`]

  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`)
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)

  return parts.join('; ')
}

export const readJsonBody = async (request) => {
  try {
    return await request.json()
  } catch {
    throw new HttpError(400, 'El cuerpo de la solicitud no es JSON válido.')
  }
}
