// Compatibilidad con versiones anteriores del sitio que todavía envían clics
// a esta ruta mientras una vista previa o una pestaña antigua sigue abierta.
import { POST as recordProductEvent } from './product-event.js'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const normalizedRequest = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({
      ...body,
      event_type: 'outbound_click',
    }),
  })

  return recordProductEvent(normalizedRequest)
}
