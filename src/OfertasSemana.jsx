import { Link } from 'react-router-dom'
import Producto from './Producto'
import { useProducts } from './useProducts'

function OfertasSemana() {
  const { products, loading, error, retry } = useProducts()

  return (
    <main className="offers-page">
      <header className="offers-intro">
        <img src="/LogoAHTecno.png" alt="Logo de A&H Tecno" />
        <p className="eyebrow">Selección reciente</p>
        <h1>Últimos publicados</h1>
        <p>Los productos incorporados más recientemente a nuestro catálogo.</p>
      </header>

      {loading && (
        <div className="status-panel" role="status">
          <div className="loading-dots" aria-hidden="true"><span /><span /><span /></div>
          <p>Cargando publicaciones...</p>
        </div>
      )}

      {!loading && error && (
        <div className="status-panel status-panel--error" role="alert">
          <p>{error}</p>
          <button className="button button--secondary" type="button" onClick={retry}>Reintentar</button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="status-panel">
          <h2>Todavía no hay publicaciones</h2>
          <p>Volvé pronto para conocer las próximas oportunidades.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="catalog-grid">
            {products.map((product, index) => (
              <Producto
                key={product.id}
                titulo={product.titulo}
                precio={product.precio}
                linkOferta={product.link}
                imagen={product.imagen}
                ml_id={product.ml_id}
                esPrimero={index === 0}
              />
            ))}
          </div>

          <div className="hero__actions">
            <Link className="button button--secondary" to="/productos">Abrir catálogo completo</Link>
          </div>
        </>
      )}
    </main>
  )
}

export default OfertasSemana
