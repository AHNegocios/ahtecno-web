import { useMemo, useState } from 'react'

const formatPrice = (value, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const formatDate = (value) =>
  new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value))

function PriceLineChart({ rows }) {
  const width = 860
  const height = 250
  const padding = { top: 24, right: 24, bottom: 38, left: 72 }
  const values = rows.map((row) => Number(row.price) || 0)
  const minPrice = Math.min(...values)
  const maxPrice = Math.max(...values)
  const priceRange = Math.max(1, maxPrice - minPrice)
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const points = rows.map((row, index) => {
    const x =
      padding.left +
      (rows.length <= 1 ? chartWidth / 2 : (index / (rows.length - 1)) * chartWidth)
    const y =
      padding.top +
      chartHeight -
      ((Number(row.price) - minPrice) / priceRange) * chartHeight
    return { x, y, row }
  })

  return (
    <div className="admin-price-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolución del precio">
        {[0, 0.5, 1].map((ratio) => {
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
                {formatPrice(minPrice + priceRange * ratio)}
              </text>
            </g>
          )
        })}
        <polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
          fill="none"
          stroke="#16d5e8"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map(({ x, y, row }) => (
          <g key={row.id}>
            <circle cx={x} cy={y} r="5" fill="#16d5e8" />
            <title>{formatPrice(row.price, row.currency_id)} · {formatDate(row.recorded_at)}</title>
          </g>
        ))}
        {points.length > 0 && (
          <>
            <text x={padding.left} y={height - 10} className="admin-chart__date">
              {formatDate(points[0].row.recorded_at)}
            </text>
            <text
              x={width - padding.right}
              y={height - 10}
              textAnchor="end"
              className="admin-chart__date"
            >
              {formatDate(points.at(-1).row.recorded_at)}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

function AdminPriceHistory({ products, history, configured }) {
  const productsWithHistory = useMemo(() => {
    const ids = new Set(history.map((entry) => String(entry.product_id)))
    return products.filter((product) => ids.has(String(product.id)))
  }, [history, products])
  const [productId, setProductId] = useState('')
  const selectedProductId = productsWithHistory.some(
    (product) => String(product.id) === productId,
  )
    ? productId
    : String(productsWithHistory[0]?.id || '')

  const selectedProduct =
    products.find((product) => String(product.id) === selectedProductId) || null
  const selectedHistory = history
    .filter((entry) => String(entry.product_id) === selectedProductId)
    .sort(
      (first, second) =>
        new Date(first.recorded_at).getTime() -
        new Date(second.recorded_at).getTime(),
    )
  const latest = selectedHistory.at(-1)
  const previous = selectedHistory.at(-2)
  const priceChange =
    latest && previous
      ? ((Number(latest.price) - Number(previous.price)) /
          Number(previous.price)) *
        100
      : 0

  return (
    <section className="admin-card admin-price-history">
      <div className="admin-section-heading">
        <div>
          <p className="eyebrow">Evolución comercial</p>
          <h3>Historial de precios</h3>
        </div>
        {!!productsWithHistory.length && (
          <label>
            Producto
            <select
              value={selectedProductId}
              onChange={(event) => setProductId(event.target.value)}
            >
              {productsWithHistory.map((product) => (
                <option value={product.id} key={product.id}>{product.titulo}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {!configured && (
        <p className="admin-message admin-message--warning">
          Ejecutá la migración del centro de decisiones para comenzar a registrar
          variaciones de precios.
        </p>
      )}

      {selectedProduct && latest ? (
        <>
          <div className="admin-price-history__summary">
            {selectedProduct.imagen && <img src={selectedProduct.imagen} alt="" />}
            <div>
              <span>Precio más reciente</span>
              <strong>{formatPrice(latest.price, latest.currency_id)}</strong>
              <small>{selectedProduct.titulo}</small>
            </div>
            <em
              className={
                priceChange < 0
                  ? 'is-discount'
                  : priceChange > 0
                    ? 'is-increase'
                    : 'is-neutral'
              }
            >
              {previous
                ? `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(1)}%`
                : 'Primer registro'}
            </em>
          </div>
          <PriceLineChart rows={selectedHistory} />
          <div className="admin-price-history__events">
            {[...selectedHistory].reverse().slice(0, 8).map((entry) => (
              <article key={entry.id}>
                <span>{formatDate(entry.recorded_at)}</span>
                <strong>{formatPrice(entry.price, entry.currency_id)}</strong>
                <small>{entry.price_source === 'mercadolibre' ? 'Automático' : 'Manual'}</small>
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="admin-muted">
          El primer punto aparecerá al ejecutar la migración o actualizar un producto.
        </p>
      )}
    </section>
  )
}

export default AdminPriceHistory
