import { Link } from 'react-router-dom'
import AffiliateDisclosure from './AffiliateDisclosure'
import Producto from './Producto'
import { useFavorites } from './useFavorites'
import { getActiveCampaignName } from './productCampaigns'
import { useProducts } from './useProducts'

const formatPrice = (value, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

function Favoritos() {
  const { favorites, removeFavorite } = useFavorites()
  const { products, loading, error, retry } = useProducts()
  const productMap = new Map(
    products.map((product) => [String(product.id), product]),
  )
  const availableProducts = favorites
    .map((favorite) => productMap.get(favorite.id))
    .filter(Boolean)
  const unavailableFavorites =
    !loading && !error
      ? favorites.filter((favorite) => !productMap.has(favorite.id))
      : []

  return (
    <main className="favorites-page">
      <header className="page-heading">
        <p className="eyebrow">Guardados en este dispositivo</p>
        <h1>Mis favoritos</h1>
        <p>
          Conservá productos para compararlos o volver más tarde. No necesitás
          crear una cuenta.
        </p>
      </header>

      <AffiliateDisclosure compact />

      {!favorites.length && (
        <div className="status-panel favorites-empty">
          <span className="favorites-empty__icon" aria-hidden="true">♡</span>
          <h2>Todavía no guardaste productos</h2>
          <p>Usá el corazón de cualquier producto para encontrarlo acá.</p>
          <Link className="button button--primary" to="/productos">
            Explorar productos
          </Link>
        </div>
      )}

      {!!favorites.length && loading && (
        <div className="status-panel" role="status">
          <div className="loading-dots" aria-hidden="true">
            <span /><span /><span />
          </div>
          <p>Comprobando tus favoritos…</p>
        </div>
      )}

      {!!favorites.length && !loading && error && (
        <div className="status-panel status-panel--error" role="alert">
          <h2>No pudimos comprobar los favoritos</h2>
          <p>{error}</p>
          <button className="button button--secondary" type="button" onClick={retry}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && !!availableProducts.length && (
        <section className="favorites-section" aria-labelledby="favorites-available-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Disponibles ahora</p>
              <h2 id="favorites-available-title">
                {availableProducts.length} guardado(s)
              </h2>
            </div>
          </div>
          <div className="catalog-grid">
            {availableProducts.map((product) => (
              <Producto
                key={product.id}
                id={product.id}
                titulo={product.titulo}
                precio={product.precio}
                linkOferta={product.link}
                imagen={product.imagen}
                imagenes={product.imagenes}
                descripcion={product.descripcion}
                caracteristicas={product.attributes}
                condicion={product.condition}
                categoria={product.categoria}
                ml_id={product.ml_id}
                campania={getActiveCampaignName(product)}
              />
            ))}
          </div>
        </section>
      )}

      {!!unavailableFavorites.length && (
        <section
          className="favorites-section favorites-unavailable"
          aria-labelledby="favorites-unavailable-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Requieren atención</p>
              <h2 id="favorites-unavailable-title">
                Ya no están disponibles
              </h2>
            </div>
          </div>
          <div className="favorites-unavailable__list">
            {unavailableFavorites.map((favorite) => (
              <article key={favorite.id}>
                {favorite.imagen ? (
                  <img src={favorite.imagen} alt="" />
                ) : (
                  <span className="favorites-unavailable__placeholder">♡</span>
                )}
                <div>
                  <strong>{favorite.titulo}</strong>
                  <p>{formatPrice(favorite.precio, favorite.currency_id)}</p>
                  <small>
                    La publicación venció, fue ocultada o dejó de estar
                    disponible.
                  </small>
                </div>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => removeFavorite(favorite.id)}
                >
                  Quitar
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default Favoritos
