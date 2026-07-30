import { requireAdmin } from '../_lib/admin-auth.js'
import { errorResponse, HttpError, jsonResponse, readJsonBody } from '../_lib/http.js'
import { recordPriceHistory } from '../_lib/price-history.js'

const normalizeManualPrice = (value) => {
  const price = Number(value)
  return Number.isFinite(price) && price > 0
    ? Math.round(price * 100) / 100
    : null
}

const isMissingReviewSchema = (error) =>
  ['42883', 'PGRST202', 'PGRST204'].includes(String(error?.code || '')) ||
  /confirm_manual_product_price|manual_price_reviewed_at|product_manual_price_reviews/i.test(
    String(error?.message || ''),
  )

export async function POST(request) {
  try {
    const { user, supabase } = await requireAdmin(request)
    const body = await readJsonBody(request)
    const productId = String(body.product_id || '').trim()
    const requestedPrice = normalizeManualPrice(body.manual_price)

    if (!productId || requestedPrice === null) {
      throw new HttpError(
        400,
        'Elegí un producto e ingresá un precio manual válido.',
      )
    }

    const { data: currentProduct, error: currentError } = await supabase
      .from('Productos')
      .select(
        'id, titulo, precio, currency_id, price_source, price_needs_review, manual_price_reviewed_at',
      )
      .eq('id', productId)
      .maybeSingle()

    if (currentError && isMissingReviewSchema(currentError)) {
      throw new HttpError(
        409,
        'Primero ejecutá la migración de revisiones manuales en Supabase.',
      )
    }
    if (currentError) throw currentError
    if (!currentProduct) {
      throw new HttpError(404, 'No encontramos el producto solicitado.')
    }
    if (currentProduct.price_source === 'mercadolibre') {
      throw new HttpError(
        400,
        'Este precio ya proviene de Mercado Libre y no requiere confirmación manual.',
      )
    }

    const { data: updatedProduct, error: reviewError } = await supabase.rpc(
      'confirm_manual_product_price',
      {
        p_product_id: productId,
        p_price: requestedPrice,
        p_reviewer_user_id: user.id,
        p_reviewer_email: user.email,
      },
    )

    if (reviewError && isMissingReviewSchema(reviewError)) {
      throw new HttpError(
        409,
        'Primero ejecutá la migración de revisiones manuales en Supabase.',
      )
    }
    if (reviewError) throw reviewError

    await recordPriceHistory(
      supabase,
      currentProduct,
      updatedProduct,
      'manual-review',
    )

    return jsonResponse({
      ok: true,
      product: {
        ...updatedProduct,
        manual_price_reviewed_by: user.email,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
