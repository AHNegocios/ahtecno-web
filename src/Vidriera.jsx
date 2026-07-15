import { Link } from 'react-router-dom'
import Producto from './Producto'
import { useProducts } from './useProducts'

const trustItems = [
  {
    icon: '⌁',
    title: 'Encontrá más rápido',
    description: 'Ordenamos oportunidades para que compares menos y encuentres antes lo que buscás.',
  },
  {
    icon: '✓',
    title: 'Enlaces revisados',
    description: 'Verificamos los enlaces al publicarlos y te enviamos al sitio donde se concreta la compra.',
  },
  {
    icon: '◇',
    title: 'Selección curada',
    description: 'Priorizamos tecnología útil, buenas propuestas y productos relevantes para la comunidad.',
  },
]

function Vidriera() {
  const { products, loading, error, retry } = useProducts({ limit: 5 })

  return (
    <main className="landing-page">
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">Tu radar de tecnología</p>
          <h1>
            Menos búsqueda.<br />
            <span>Mejores hallazgos.</span>
          </h1>
          <p className="hero__lead">
            Filtramos ofertas y productos tecnológicos para ayudarte a descubrir opciones interesantes sin recorrer publicaciones infinitas.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/productos">Explorar catálogo</Link>
            <Link className="button button--secondary" to="/categorias">Ver categorías</Link>
          </div>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="latest-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recién publicados</p>
            <h2 id="latest-title">Últimos ingresos</h2>
          </div>
          <Link className="section-link" to="/ofertas-semana">Ver todos →</Link>
        </div>

        {loading && (
          <div className="status-panel" role="status">
            <div className="loading-dots" aria-hidden="true"><span /><span /><span /></div>
            <p>Cargando los últimos ingresos...</p>
          </div>
        )}

        {!loading && error && (
          <div className="status-panel status-panel--error" role="alert">
            <p>{error}</p>
            <button className="button button--secondary" type="button" onClick={retry}>Reintentar</button>
          </div>
        )}

        {!loading && !error && (
          <div className="product-carousel">
            {products.map((product) => (
              <Producto
                key={product.id}
                titulo={product.titulo}
                precio={product.precio}
                linkOferta={product.link}
                imagen={product.imagen}
                ml_id={product.ml_id}
              />
            ))}
            <Link className="carousel-more" to="/productos">Ver todo el catálogo →</Link>
          </div>
        )}
      </section>

      <section className="landing-section" aria-labelledby="why-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Por qué AH Tecno</p>
            <h2 id="why-title">Un catálogo pensado para decidir mejor</h2>
          </div>
        </div>
        <div className="trust-grid">
          {trustItems.map((item) => (
            <article className="trust-card" key={item.title}>
              <span className="trust-card__icon" aria-hidden="true">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Vidriera
