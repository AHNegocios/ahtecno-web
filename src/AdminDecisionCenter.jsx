import { useMemo, useState } from 'react'
import { buildAdminAlerts } from './adminDecisionSupport'
import { getProductCampaignState } from './productCampaigns'

const severityLabels = {
  critical: 'Crítica',
  warning: 'Atención',
  opportunity: 'Oportunidad',
  info: 'Información',
}

const toLocalDateTimeInput = (date) => {
  const value = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  const offsetDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

const formatDate = (value) => {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Fecha inválida'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function AlertCenter({
  products,
  priceHistory,
  onOpenExpired,
  onOpenAnalytics,
}) {
  const alerts = useMemo(
    () => buildAdminAlerts(products, priceHistory),
    [priceHistory, products],
  )
  const counts = alerts.reduce(
    (summary, alert) => {
      summary[alert.severity] += 1
      return summary
    },
    { critical: 0, warning: 0, opportunity: 0, info: 0 },
  )

  return (
    <section className="admin-card admin-alert-center">
      <div className="admin-card__header">
        <div>
          <p className="eyebrow">Control diario</p>
          <h2>Centro de alertas</h2>
          <p>Priorizamos lo que requiere una decisión o puede transformarse en contenido.</p>
        </div>
        <span className={`admin-alert-total ${alerts.length ? 'has-alerts' : ''}`}>
          {alerts.length} alerta(s)
        </span>
      </div>

      <div className="admin-alert-summary" aria-label="Resumen de alertas">
        <span><b>{counts.critical}</b> críticas</span>
        <span><b>{counts.warning}</b> a revisar</span>
        <span><b>{counts.opportunity}</b> oportunidades</span>
      </div>

      {alerts.length ? (
        <div className="admin-alert-list">
          {alerts.map((alert) => (
            <article
              className={`admin-alert admin-alert--${alert.severity}`}
              key={alert.id}
            >
              <span>{severityLabels[alert.severity]}</span>
              <div>
                <strong>{alert.title}</strong>
                <p>{alert.message}</p>
              </div>
              {alert.type === 'expired' || alert.type === 'sync' ? (
                <button type="button" onClick={onOpenExpired}>Ver vencidos</button>
              ) : (
                <button type="button" onClick={onOpenAnalytics}>Ver datos</button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-alert-empty">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Todo bajo control</strong>
            <p>No hay alertas importantes en este momento.</p>
          </div>
        </div>
      )}
    </section>
  )
}

function CampaignPlanner({
  products,
  apiRequest,
  onReload,
  configured,
}) {
  const firstProductId = products[0]?.id ? String(products[0].id) : ''
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const [productId, setProductId] = useState(firstProductId)
  const selectedProductId = productId || firstProductId
  const [campaignName, setCampaignName] = useState('')
  const [startsAt, setStartsAt] = useState(toLocalDateTimeInput(now))
  const [endsAt, setEndsAt] = useState(toLocalDateTimeInput(nextWeek))
  const [priority, setPriority] = useState('5')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const scheduledProducts = products
    .filter((product) => product.campaign_name)
    .sort(
      (first, second) =>
        (Number(second.featured_priority) || 0) -
        (Number(first.featured_priority) || 0),
    )

  const saveCampaign = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFeedback('')
    try {
      await apiRequest('/api/admin/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          product_id: selectedProductId,
          campaign_name: campaignName,
          featured_from: startsAt,
          featured_until: endsAt,
          featured_priority: priority,
        }),
      })
      setCampaignName('')
      setFeedback('Campaña programada')
      await onReload()
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setSaving(false)
    }
  }

  const clearCampaign = async (selectedProductId) => {
    setSaving(true)
    setFeedback('')
    try {
      await apiRequest('/api/admin/campaigns', {
        method: 'DELETE',
        body: JSON.stringify({ product_id: selectedProductId }),
      })
      setFeedback('Campaña retirada')
      await onReload()
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-card admin-campaigns">
      <div className="admin-card__header">
        <div>
          <p className="eyebrow">Planificación editorial</p>
          <h2>Productos destacados y campañas</h2>
          <p>Programá qué producto aparece primero y con qué mensaje.</p>
        </div>
      </div>

      {!configured && (
        <p className="admin-message admin-message--warning">
          Ejecutá la migración del centro de decisiones en Supabase para activar
          esta herramienta.
        </p>
      )}

      <form className="admin-campaign-form" onSubmit={saveCampaign}>
        <label>
          Producto
          <select
            value={selectedProductId}
            onChange={(event) => setProductId(event.target.value)}
            required
          >
            {products.map((product) => (
              <option value={product.id} key={product.id}>{product.titulo}</option>
            ))}
          </select>
        </label>
        <label>
          Nombre visible
          <input
            value={campaignName}
            maxLength="80"
            placeholder="Ejemplo: Oferta de la semana"
            onChange={(event) => setCampaignName(event.target.value)}
            required
          />
        </label>
        <label>
          Inicio
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
          />
        </label>
        <label>
          Finalización
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
          />
        </label>
        <label>
          Prioridad
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="3">Baja</option>
            <option value="5">Media</option>
            <option value="8">Alta</option>
            <option value="10">Máxima</option>
          </select>
        </label>
        <button
          className="button button--primary"
          type="submit"
          disabled={!configured || saving || !products.length}
        >
          {saving ? 'Guardando…' : 'Programar campaña'}
        </button>
      </form>
      {feedback && <p className="admin-campaign-feedback" role="status">{feedback}</p>}

      <div className="admin-campaign-list">
        {scheduledProducts.map((product) => {
          const state = getProductCampaignState(product)
          return (
            <article key={product.id}>
              {product.imagen && <img src={product.imagen} alt="" />}
              <div>
                <span className={`admin-campaign-state admin-campaign-state--${state.key}`}>
                  {state.label}
                </span>
                <strong>{product.campaign_name}</strong>
                <p>{product.titulo}</p>
                <small>
                  {formatDate(product.featured_from)} → {formatDate(product.featured_until)}
                  {' · '}Prioridad {product.featured_priority || 0}
                </small>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => clearCampaign(product.id)}
              >
                Retirar
              </button>
            </article>
          )
        })}
        {!scheduledProducts.length && (
          <p className="admin-muted">Todavía no hay campañas programadas.</p>
        )}
      </div>
    </section>
  )
}

function AdminDecisionCenter(props) {
  return (
    <div className="admin-decision-grid">
      <AlertCenter {...props} />
      <CampaignPlanner {...props} />
    </div>
  )
}

export default AdminDecisionCenter
