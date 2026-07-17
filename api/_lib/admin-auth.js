import { getAdminEmails } from './config.js'
import { HttpError } from './http.js'
import { createSupabaseAdmin } from './supabase-admin.js'

export const requireAdmin = async (request) => {
  const authorization = request.headers.get('authorization') || ''
  const [scheme, token] = authorization.split(' ')

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new HttpError(401, 'Necesitás iniciar sesión para administrar productos.')
  }

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user?.email) {
    throw new HttpError(401, 'La sesión de administración no es válida.')
  }

  const email = data.user.email.toLowerCase()
  if (!getAdminEmails().has(email)) {
    throw new HttpError(403, 'Esta cuenta no tiene permiso de administración.')
  }

  return { user: data.user, supabase }
}
