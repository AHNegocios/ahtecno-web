import { requireAdmin } from '../_lib/admin-auth.js'
import { getCronSecret } from '../_lib/config.js'
import { errorResponse, HttpError, jsonResponse } from '../_lib/http.js'
import { safeEqual } from '../_lib/oauth-state.js'
import { syncAllProducts } from '../_lib/product-sync.js'
import { createSupabaseAdmin } from '../_lib/supabase-admin.js'

const requireCron = (request) => {
  const authorization = request.headers.get('authorization') || ''
  const expected = `Bearer ${getCronSecret()}`

  if (!safeEqual(authorization, expected)) {
    throw new HttpError(401, 'La solicitud automática no está autorizada.')
  }
}

const runSync = async (supabase) => {
  const result = await syncAllProducts(supabase)
  return jsonResponse({ ok: true, ...result })
}

export async function POST(request) {
  try {
    const { supabase } = await requireAdmin(request)
    return await runSync(supabase)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function GET(request) {
  try {
    requireCron(request)
    return await runSync(createSupabaseAdmin())
  } catch (error) {
    return errorResponse(error)
  }
}
