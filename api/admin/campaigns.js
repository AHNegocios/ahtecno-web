import { requireAdmin } from '../_lib/admin-auth.js'
import { errorResponse, HttpError, jsonResponse, readJsonBody } from '../_lib/http.js'

const parseDate = (value, fieldName) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `${fieldName} no tiene una fecha válida.`)
  }
  return date
}

const isMissingCampaignColumns = (error) =>
  /campaign_name|featured_from|featured_until|featured_priority/i.test(
    String(error?.message || ''),
  )

export async function POST(request) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = await readJsonBody(request)
    const productId = String(body.product_id || '').trim()
    const campaignName = String(body.campaign_name || '').trim().slice(0, 80)
    const startsAt = parseDate(body.featured_from, 'La fecha de inicio')
    const endsAt = parseDate(body.featured_until, 'La fecha de finalización')
    const priority = Math.max(
      0,
      Math.min(10, Math.round(Number(body.featured_priority) || 0)),
    )

    if (!productId || !campaignName) {
      throw new HttpError(400, 'Elegí un producto y escribí el nombre de la campaña.')
    }
    if (startsAt && endsAt && endsAt <= startsAt) {
      throw new HttpError(
        400,
        'La finalización debe ser posterior al inicio de la campaña.',
      )
    }

    const { data, error } = await supabase
      .from('Productos')
      .update({
        campaign_name: campaignName,
        featured_from: startsAt?.toISOString() || null,
        featured_until: endsAt?.toISOString() || null,
        featured_priority: priority,
      })
      .eq('id', productId)
      .select('*')
      .single()

    if (error && isMissingCampaignColumns(error)) {
      throw new HttpError(
        409,
        'Primero ejecutá la migración del centro de decisiones en Supabase.',
      )
    }
    if (error) throw error

    return jsonResponse({ ok: true, product: data })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = await readJsonBody(request)
    const productId = String(body.product_id || '').trim()
    if (!productId) throw new HttpError(400, 'Falta identificar el producto.')

    const { data, error } = await supabase
      .from('Productos')
      .update({
        campaign_name: null,
        featured_from: null,
        featured_until: null,
        featured_priority: 0,
      })
      .eq('id', productId)
      .select('*')
      .single()

    if (error) throw error
    return jsonResponse({ ok: true, product: data })
  } catch (error) {
    return errorResponse(error)
  }
}
