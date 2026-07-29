import { useMemo, useState } from 'react'
import {
  formatAnalyticsChange,
  getPeriodAnalytics,
  getProductPeriodPerformance,
} from './adminDashboardAnalytics'
import AdminPriceHistory from './AdminPriceHistory'

const SERIES = [
  { key: 'product_views', label: 'Vistas', color: '#16d5e8' },
  { key: 'outbound_clicks', label: 'Clics', color: '#22c55e' },
  { key: 'shares', label: 'Compartidos', color: '#f59e0b' },
]

const sourceLabels = {
  card: 'Tarjetas del catálogo',
  modal: 'Ventana de detalle',
  detail: 'Página del producto',
  sin_origen: 'Sin origen informado',
}

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

function AdminAnalytics({
  analytics,
  catalogSummary,
  products,
  priceHistory,
  priceHistoryConfigured,
}) {
  const [periodDays, setPeriodDays] = useState(30)
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
          label="Vistas de producto"
          value={period.current.product_views}
          previousValue={period.previous.product_views}
          helper="Aperturas de ficha o detalle"
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
              <h3>Dónde interactúan</h3>
            </div>
          </div>
          <div className="admin-source-list">
            {selectedSources.map((source) => {
              const percentage = sourceTotal
                ? (Number(source.count) / sourceTotal) * 100
                : 0
              return (
                <article key={source.source}>
                  <div>
                    <strong>{sourceLabels[source.source] || source.source}</strong>
                    <span>{source.count} eventos</span>
                  </div>
                  <div className="admin-source-bar" aria-hidden="true">
                    <i style={{ width: `${percentage}%` }} />
                  </div>
                </article>
              )
            })}
            {!selectedSources.length && (
              <p className="admin-muted">Todavía no hay actividad registrada.</p>
            )}
          </div>
        </section>

        <section className="admin-card admin-statistics__explanation">
          <p className="eyebrow">Cómo leerlo</p>
          <h3>Qué representa cada dato</h3>
          <ul>
            <li><strong>Vista:</strong> alguien abrió la ficha completa.</li>
            <li><strong>Clic:</strong> alguien intentó ir a Mercado Libre.</li>
            <li><strong>Compartido:</strong> el enlace se copió o compartió correctamente.</li>
            <li><strong>Conversión:</strong> qué porcentaje de las vistas terminó en un clic.</li>
          </ul>
        </section>
      </div>

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
                <th>Vistas</th>
                <th>Clics</th>
                <th>Compartidos</th>
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
                  <td>{entry.current.product_views}</td>
                  <td>{entry.current.outbound_clicks}</td>
                  <td>{entry.current.shares}</td>
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
