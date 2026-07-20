import { createSupabaseAdmin } from '../_lib/supabase-admin.js'
import { errorResponse, HttpError, jsonResponse, readJsonBody } from '../_lib/http.js'

const allowedSources = new Set(['card', 'modal', 'detail'])

const assertSameOrigin = (request) => {
  const origin = request.headers.get('origin')
  if (!origin) return

  try {
    if (new URL(origin).host !== new URL(request.url).host) {
      throw new HttpError(403, 'Origen no permitido.')
    }
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(403, 'Origen no permitido.')
  }
}

export async function POST(request) {
  try {
    assertSameOrigin(request)
    const body = await readJsonBody(request)
    const productId = String(body.product_id || '').trim()
    const source = String(body.source || '').trim()

    if (!productId || productId.length > 80 || !allowedSources.has(source)) {
      throw new HttpError(400, 'Evento de producto inválido.')
    }

    const supabase = createSupabaseAdmin()
    const { data: product, error: productError } = await supabase
      .from('Productos')
      .select('id')
      .eq('id', productId)
      .maybeSingle()

    if (productError) throw productError
    if (!product) throw new HttpError(404, 'Producto no encontrado.')

    const { error } = await supabase.from('product_outbound_clicks').insert({
      product_id: productId,
      source,
    })

    if (error) throw error
    return jsonResponse({ ok: true }, 202)
  } catch (error) {
    return errorResponse(error)
  }
}
