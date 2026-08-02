import { requireAdmin } from '../_lib/admin-auth.js'
import { errorResponse, HttpError, jsonResponse, readJsonBody } from '../_lib/http.js'
import { hasInactiveMercadoLibreStatus } from '../../src/productVisibility.js'

const EDITORIAL_ACTIONS = new Set(['save', 'draft', 'schedule', 'publish'])

const parseOptionalDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, 'La fecha prevista no es válida.')
  }
  return date
}

const parseOptionalUrl = (value) => {
  const normalized = String(value || '').trim()
  if (!normalized) return null

  try {
    const url = new URL(normalized)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    return url.toString()
  } catch {
    throw new HttpError(400, 'El enlace del contenido debe ser una dirección válida.')
  }
}

const isMissingEditorialColumns = (error) =>
  /publication_status|planned_publish_at|published_at|content_url|editorial_notes/i.test(
    String(error?.message || ''),
  )

export async function PATCH(request) {
  try {
    const { supabase } = await requireAdmin(request)
    const body = await readJsonBody(request)
    const productId = String(body.product_id || '').trim()
    const action = String(body.action || 'save').trim().toLowerCase()

    if (!productId || !EDITORIAL_ACTIONS.has(action)) {
      throw new HttpError(400, 'La acción editorial solicitada no es válida.')
    }

    const plannedAt = parseOptionalDate(body.planned_publish_at)
    const contentUrl = parseOptionalUrl(body.content_url)
    const editorialNotes = String(body.editorial_notes || '').trim().slice(0, 1000) || null

    const existingResult = await supabase
      .from('Productos')
      .select('id, ml_status, publication_status, planned_publish_at')
      .eq('id', productId)
      .maybeSingle()

    if (existingResult.error && isMissingEditorialColumns(existingResult.error)) {
      throw new HttpError(
        409,
        'Primero ejecutá la migración de Base de datos editorial en Supabase.',
      )
    }
    if (existingResult.error) throw existingResult.error
    if (!existingResult.data) throw new HttpError(404, 'No encontramos el producto.')

    const product = existingResult.data
    const fields = {
      planned_publish_at: plannedAt?.toISOString() || null,
      content_url: contentUrl,
      editorial_notes: editorialNotes,
    }

    if (action === 'draft') {
      Object.assign(fields, {
        publication_status: 'draft',
        is_visible: false,
        published_at: null,
      })
    }

    if (action === 'schedule') {
      if (!plannedAt) {
        throw new HttpError(400, 'Elegí la fecha prevista antes de programar.')
      }
      if (plannedAt <= new Date()) {
        throw new HttpError(400, 'La fecha programada debe estar en el futuro.')
      }
      Object.assign(fields, {
        publication_status: 'scheduled',
        is_visible: true,
        published_at: plannedAt.toISOString(),
      })
    }

    if (action === 'publish') {
      if (hasInactiveMercadoLibreStatus(product.ml_status)) {
        throw new HttpError(
          409,
          'Este producto está vencido o inactivo en Mercado Libre y no se puede publicar.',
        )
      }
      Object.assign(fields, {
        publication_status: 'published',
        is_visible: true,
        published_at: new Date().toISOString(),
      })
    }

    if (action === 'save' && product.publication_status === 'scheduled') {
      if (!plannedAt) {
        throw new HttpError(400, 'Un producto programado debe conservar una fecha prevista.')
      }
      fields.published_at = plannedAt.toISOString()
    }

    const { data, error } = await supabase
      .from('Productos')
      .update(fields)
      .eq('id', productId)
      .select('*')
      .single()

    if (error && isMissingEditorialColumns(error)) {
      throw new HttpError(
        409,
        'Primero ejecutá la migración de Base de datos editorial en Supabase.',
      )
    }
    if (error) throw error

    return jsonResponse({ ok: true, product: data })
  } catch (error) {
    return errorResponse(error)
  }
}

