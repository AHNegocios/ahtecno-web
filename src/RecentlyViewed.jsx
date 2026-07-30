import { Link } from 'react-router-dom'
import { getProductPath } from './productUrls'
import { useRecentProducts } from './useRecentProducts'

const formatPrice = (value, currency = 'ARS') => {
  const normalizedCurrency = String(currency || 'ARS').trim().toUpperCase()
  const safeCurrency = /^[A-Z]{3}$/.test(normalizedCurrency)
    ? normalizedCurrency
    : 'ARS'

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function RecentlyViewed({ products = [] }) {
  const { recentProducts, clearRecentProducts } = useRecentProducts()
  const productMap = new Map(
    products.map((product) => [String(product.id), product]),
  )
  const visibleRecentProducts = recentProducts
    .map((recent) => productMap.get(recent.id))
    .filter(Boolean)
    .slice(0, 6)

  if (!visibleRecentProducts.length) return null

  return (
    <section className="recent-products" aria-labelledby="recent-products-title">
      <div className="recent-products__heading">
        <div>
          <p className="eyebrow">Tu recorrido</p>
          <h2 id="recent-products-title">Vistos recientemente</h2>
        </div>
        <button type="button" onClick={clearRecentProducts}>
          Borrar historial
        </button>
      </div>

      <div className="recent-products__list">
        {visibleRecentProducts.map((product) => (
          <Link to={getProductPath(product)} key={product.id}>
            <span className="recent-products__image">
              {product.imagen ? (
                <img src={product.imagen} alt="" />
              ) : (
                <span aria-hidden="true">◇</span>
              )}
            </span>
            <span className="recent-products__copy">
              <strong>{product.titulo}</strong>
              <small>{formatPrice(product.precio, product.currency_id)}</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default RecentlyViewed
