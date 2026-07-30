import { useMemo, useState } from 'react'
import {
  formatAnalyticsChange,
  getPeriodAnalytics,
  getProductPeriodPerformance,
} from './adminDashboardAnalytics'
import AdminPriceHistory from './AdminPriceHistory'
import { siteConfig } from './siteConfig'

const SERIES = [
  { key: 'product_impressions', label: 'Apariciones', color: '#8b5cf6' },
  { key: 'product_views', label: 'Vistas', color: '#16d5e8' },
  { key: 'favorites_added', label: 'Favoritos', color: '#fb7185' },
  { key: 'outbound_clicks', label: 'Clics', color: '#22c55e' },
  { key: 'shares', label: 'Compartidos', color: '#f59e0b' },
]

const sourceLabels = {
  card: 'Tarjetas del catálogo',
  modal: 'Ventana de detalle',
  detail: 'Página del producto',
  sin_origen: 'Sin origen informado',
}

const channelLabels = {
  direct: 'Acceso directo',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  google: 'Google',
  referral: 'Otro sitio',
}

const campaignLinks = [
  { id: 'tiktok', label: 'TikTok', source: 'tiktok' },
  { id: 'instagram', label: 'Instagram', source: 'instagram' },
  { id: 'youtube', label: 'YouTube', source: 'youtube' },
].map((entry) => ({
  ...entry,
  url: `${siteConfig.siteUrl}/ultimos?utm_source=${entry.source}&utm_medium=social&utm_campaign=link_bio`,
}))

const formatCompactDate = (value) => {
  const [, month, day] = String(value || '').split('-')
  return month && day ? `${day}/${month}` : value
}

const formatPercent = (value) =>
  `${new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 1,
  }).format(Number(value) || 0)}%`

function KpiCard({
  label,
  value,
  previousValue,
  helper,
  formatter = (number) => number,
}) {
  const change =
    previousValue === 0
      ? value
        ? null
        : 0
      : ((value - previousValue) / previousValue) * 100
  const trend = formatAnalyticsChange(change, value)

  return (
    <article className="admin-kpi">
      <span>{label}</span>
      <strong>{formatter(value)}</strong>
      <small>{helper}</small>
      <em className={`admin-kpi__trend admin-kpi__trend--${trend.direction}`}>
        {trend.label}
      </em>
    </article>
  )
}

function ActivityLineChart({ rows }) {
  const width = 860
  const height = 300
  const padding = { top: 24, right: 22, bottom: 42, left: 42 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(
    1,
    ...rows.flatMap((row) =>
      SERIES.map((series) => Number(row[series.key]) || 0),
    ),
  )
  const pointFor = (row, index, key) => {
    const x =
      padding.left +
      (rows.length <= 1 ? chartWidth / 2 : (index / (rows.length - 1)) * chartWidth)
    const y =
      padding.top +
      chartHeight -
      ((Number(row[key]) || 0) / maxValue) * chartHeight
    return `${x},${y}`
  }
  const labelIndexes = [...new Set([
    0,
    Math.floor((rows.length - 1) / 2),
    Math.max(0, rows.length - 1),
  ])]

  return (
    <div className="admin-chart">
      <div className="admin-chart__legend" aria-label="Referencias del gráfico">
        {SERIES.map((series) => (
          <span key={series.key}>
            <i style={{ background: series.color }} />
            {series.label}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Evolución diaria de vistas, clics y compartidos"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartHeight - ratio * chartHeight
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                className="admin-chart__grid"
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end">
                {Math.round(maxValue * ratio)}
              </text>
            </g>
          )
        })}
        {SERIES.map((series) => (
          <polyline
            key={series.key}
            points={rows
              .map((row, index) => pointFor(row, index, series.key))
              .join(' ')}
            fill="none"
            stroke={series.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {labelIndexes.map((index) => {
          const row = rows[index]
          const x =
            padding.left +
            (rows.length <= 1
              ? chartWidth / 2
              : (index / (rows.length - 1)) * chartWidth)
          return (
            <text
              className="admin-chart__date"
              key={`${row?.date}-${index}`}
              x={x}
              y={height - 12}
              textAnchor={index === 0 ? 'start' : index === rows.length - 1 ? 'end' : 'middle'}
            >
              {formatCompactDate(row?.date)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

function ChangeCell({ change, current }) {
  const trend = formatAnalyticsChange(change, current)
  return (
    <span className={`admin-table-trend admin-table-trend--${trend.direction}`}>
      {trend.label}
    </span>
  )
}

function DistributionList({
  rows,
  total,
  labels,
  emptyMessage = 'Todavía no hay actividad registrada.',
}) {
  return (
    <div className="admin-source-list">
      {rows.map((row) => {
        const key = row.source || row.channel
        const percentage = total ? (Number(row.count) / total) * 100 : 0
        return (
          <article key={key}>
            <div>
              <strong>{labels[key] || key}</strong>
              <span>{row.count} eventos</span>
            </div>
            <div className="admin-source-bar" aria-hidden="true">
              <i style={{ width: `${percentage}%` }} />
            </div>
          </article>
        )
      })}
      {!rows.length && <p className="admin-muted">{emptyMessage}</p>}
    </div>
  )
}

function FunnelStep({ label, value, rate, helper }) {
  return (
    <article className="admin-funnel__step">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{formatPercent(rate)}</em>
      <small>{helper}</small>
    </article>
  )
}

function AdminAnalytics({
  analytics,
  catalogSummary,
  products,
  priceHistory,
  priceHistoryConfigured,
}) {
  const [periodDays, setPeriodDays] = useState(30)
  const [copiedLink, setCopiedLink] = useState('')
  const period = useMemo(
    () => getPeriodAnalytics(analytics, periodDays),
    [analytics, periodDays],
  )
  const productPerformance = useMemo(
    () => getProductPeriodPerformance(products, analytics, periodDays),
    [analytics, periodDays, products],
  )
  const currentDates = useMemo(
    () => new Set(period.currentRows.map((row) => row.date)),
    [period.currentRows],
  )
  const selectedSources = useMemo(() => {
    const totals = new Map()
    ;(analytics.source_daily || []).forEach((row) => {
      if (!currentDates.has(row.date)) return
      totals.set(
        row.source,
        (totals.get(row.source) || 0) + (Number(row.count) || 0),
      )
    })
    return [...totals.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((first, second) => second.count - first.count)
  }, [analytics.source_daily, currentDates])
  const sourceTotal = selectedSources.reduce(
    (total, source) => total + (Number(source.count) || 0),
    0,
  )
  const selectedChannels = useMemo(() => {
    const totals = new Map()
    ;(analytics.channel_daily || []).forEach((row) => {
      if (!currentDates.has(row.date)) return
      totals.set(
        row.channel,
        (totals.get(row.channel) || 0) + (Number(row.count) || 0),
      )
    })
    return [...totals.entries()]
      .map(([channel, count]) => ({ channel, count }))
      .sort((first, second) => second.count - first.count)
  }, [analytics.channel_daily, currentDates])
  const channelTotal = selectedChannels.reduce(
    (total, channel) => total + (Number(channel.count) || 0),
    0,
  )

  const copyCampaignLink = async (entry) => {
    try {
      await navigator.clipboard.writeText(entry.url)
      setCopiedLink(entry.id)
      window.setTimeout(() => setCopiedLink(''), 1800)
    } catch {
      setCopiedLink('error')
    }
  }

  return (
    <div className="admin-statistics">
      <section className="admin-card admin-statistics__intro">
        <div>
          <p className="eyebrow">Rendimiento real</p>
          <h2>Estadísticas del catálogo</h2>
          <p>
            Comparamos la actividad actual con los {periodDays} días anteriores.
          </p>
        </div>
        <div className="admin-period-selector" aria-label="Período de estadísticas">
          {[7, 30].map((days) => (
            <button
              className={periodDays === days ? 'is-active' : ''}
              type="button"
              key={days}
              onClick={() => setPeriodDays(days)}
            >
              {days} días
            </button>
          ))}
        </div>
      </section>

      <section className="admin-health-strip" aria-label="Estado general del catálogo">
        <article>
          <span>Publicados</span>
          <strong>{catalogSummary.published}</strong>
          <small>Productos visibles</small>
        </article>
        <article>
          <span>Vencidos</span>
          <strong>{catalogSummary.expired}</strong>
          <small>Ocultos automáticamente</small>
        </article>
        <article>
          <span>Precios a revisar</span>
          <strong>{catalogSummary.needsReview}</strong>
          <small>Valores manuales o pendientes</small>
        </article>
      </section>

      <section className="admin-kpi-grid" aria-label="Indicadores principales">
        <KpiCard
          label="Apariciones"
          value={period.current.product_impressions}
          previousValue={period.previous.product_impressions}
          helper="Productos mostrados durante una sesión"
        />
        <KpiCard
          label="Vistas de producto"
          value={period.current.product_views}
          previousValue={period.previous.product_views}
          helper="Aperturas de ficha o detalle"
        />
        <KpiCard
          label="Nuevos favoritos"
          value={period.current.favorites_added}
          previousValue={period.previous.favorites_added}
          helper="Productos guardados en este dispositivo"
        />
        <KpiCard
          label="Clics a Mercado Libre"
          value={period.current.outbound_clicks}
          previousValue={period.previous.outbound_clicks}
          helper="Intención de visitar la oferta"
        />
        <KpiCard
          label="Compartidos"
          value={period.current.shares}
          previousValue={period.previous.shares}
          helper="Enlaces compartidos o copiados"
        />
        <KpiCard
          label="Conversión a clic"
          value={period.currentCtr}
          previousValue={period.previousCtr}
          helper="Clics divididos por vistas"
          formatter={formatPercent}
        />
      </section>

      <section className="admin-card admin-funnel">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Embudo de decisión</p>
            <h3>Del catálogo hacia Mercado Libre</h3>
          </div>
          <span>Últimos {periodDays} días</span>
        </div>
        <div className="admin-funnel__steps">
          <FunnelStep
            label="1. Producto mostrado"
            value={period.current.product_impressions}
            rate={period.current.product_impressions ? 100 : 0}
            helper="Base del recorrido medido"
          />
          <FunnelStep
            label="2. Abrió el detalle"
            value={period.current.product_views}
            rate={period.currentDetailRate}
            helper="Sobre productos mostrados"
          />
          <FunnelStep
            label="3. Fue a Mercado Libre"
            value={period.current.outbound_clicks}
            rate={period.currentCtr}
            helper="Sobre vistas de detalle"
          />
        </div>
        <p className="admin-funnel__note">
          Además, se guardaron {period.current.favorites_added} favorito(s) y se
          compartieron {period.current.shares} oferta(s). Estas son señales de interés,
          pero no confirman una compra.
        </p>
      </section>

      <section className="admin-card admin-chart-card">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Tendencia diaria</p>
            <h3>Actividad durante los últimos {periodDays} días</h3>
          </div>
          <span>Compará picos y caídas</span>
        </div>
        <ActivityLineChart rows={period.currentRows} />
      </section>

      <AdminPriceHistory
        products={products}
        history={priceHistory}
        configured={priceHistoryConfigured}
      />

      <div className="admin-statistics-grid">
        <section className="admin-card">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">Origen</p>
              <h3>Desde dónde llegaron</h3>
            </div>
          </div>
          <DistributionList
            rows={selectedChannels}
            total={channelTotal}
            labels={channelLabels}
          />
        </section>

        <section className="admin-card">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">Superficie</p>
              <h3>Dónde interactuaron</h3>
            </div>
          </div>
          <DistributionList
            rows={selectedSources}
            total={sourceTotal}
            labels={sourceLabels}
          />
        </section>
      </div>

      <section className="admin-card admin-campaign-links">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Enlaces medibles</p>
            <h3>Link en bio por red social</h3>
          </div>
          <span>Permiten identificar el origen real</span>
        </div>
        <div className="admin-campaign-links__grid">
          {campaignLinks.map((entry) => (
            <article key={entry.id}>
              <div>
                <strong>{entry.label}</strong>
                <small>Abre “Últimos subidos” y registra {entry.label} como origen.</small>
              </div>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => copyCampaignLink(entry)}
              >
                {copiedLink === entry.id ? 'Copiado' : 'Copiar enlace'}
              </button>
            </article>
          ))}
        </div>
        {copiedLink === 'error' && (
          <p className="admin-message admin-message--error" role="status">
            No pudimos copiar el enlace. Podés seleccionarlo desde el navegador.
          </p>
        )}
      </section>

      <section className="admin-card admin-statistics__explanation">
        <p className="eyebrow">Cómo leerlo</p>
        <h3>Qué representa cada dato</h3>
        <ul>
          <li><strong>Aparición:</strong> una tarjeta se mostró durante la sesión.</li>
          <li><strong>Vista:</strong> alguien abrió la ficha completa o el detalle.</li>
          <li><strong>Favorito:</strong> alguien guardó el producto en este dispositivo.</li>
          <li><strong>Clic:</strong> alguien intentó ir a Mercado Libre.</li>
          <li><strong>Compartido:</strong> el enlace se copió o compartió correctamente.</li>
          <li><strong>Conversión:</strong> qué porcentaje de las vistas terminó en un clic.</li>
        </ul>
      </section>

      <section className="admin-card admin-product-comparison">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Comparativa</p>
            <h3>Rendimiento por producto</h3>
          </div>
          <span>Últimos {periodDays} días</span>
        </div>
        <div className="admin-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Apariciones</th>
                <th>Vistas</th>
                <th>Favoritos</th>
                <th>Clics</th>
                <th>Compartidos</th>
                <th>Apertura</th>
                <th>Conversión</th>
                <th>Comparación de clics</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((entry) => (
                <tr key={entry.product.id}>
                  <td>
                    <div className="admin-table-product">
                      {entry.product.imagen && (
                        <img src={entry.product.imagen} alt="" />
                      )}
                      <span>{entry.product.titulo}</span>
                    </div>
                  </td>
                  <td>{entry.current.product_impressions}</td>
                  <td>{entry.current.product_views}</td>
                  <td>{entry.current.favorites_added}</td>
                  <td>{entry.current.outbound_clicks}</td>
                  <td>{entry.current.shares}</td>
                  <td>{formatPercent(entry.detailRate)}</td>
                  <td>{formatPercent(entry.ctr)}</td>
                  <td>
                    <ChangeCell
                      change={entry.clickChange}
                      current={entry.current.outbound_clicks}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {analytics.limited && (
        <p className="admin-message admin-message--warning">
          El historial superó el límite de lectura. Ejecutá la migración de resumen
          diario incluida en el proyecto para recuperar la serie completa.
        </p>
      )}
      <p className="admin-analytics__note">
        Estos datos provienen de acciones registradas dentro de AH Tecno. Las visitas
        generales y usuarios únicos de toda la web continúan disponibles en Analytics
        de Vercel.
      </p>
    </div>
  )
}

export default AdminAnalytics
