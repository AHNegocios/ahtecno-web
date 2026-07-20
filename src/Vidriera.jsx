import { Link } from 'react-router-dom'
import { categories } from './catalogConfig'
import Producto from './Producto'
import { useProducts } from './useProducts'

const trustItems = [
  {
    icon: '01',
    title: 'Selección humana',
    description: 'Revisamos cada publicación antes de sumarla para evitarte búsquedas y opciones irrelevantes.',
  },
  {
    icon: '02',
    title: 'Compra en Mercado Libre',
    description: 'Te llevamos a la publicación original para que confirmes precio, envío y reputación del vendedor.',
  },
  {
    icon: '03',
    title: 'Afiliación transparente',
    description: 'Podemos recibir una comisión si comprás desde nuestros enlaces, sin costo adicional para vos.',
  },
]

const radarSteps = [
  'Exploramos publicaciones y tendencias',
  'Filtramos opciones que aportan valor',
  'Vos comparás y decidís en el sitio oficial',
]

function Vidriera() {
  const { products, loading, error, retry } = useProducts({ limit: 5 })

  return (
    <main className="landing-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__layout">
          <div className="hero__content">
            <p className="eyebrow hero__eyebrow"><span aria-hidden="true" /> Selección tecnológica independiente</p>
            <h1 id="hero-title">
              Tecnología útil,
              <span>sin perder horas buscando.</span>
            </h1>
            <p className="hero__lead">
              Encontramos y ordenamos productos tecnológicos publicados en Mercado Libre para que llegues más rápido a una opción que valga la pena comparar.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" to="/productos">Explorar productos <span aria-hidden="true">→</span></Link>
              <Link className="button button--secondary" to="/categorias">Buscar por categoría</Link>
            </div>
            <ul className="hero__proofs" aria-label="Características del servicio">
              <li><span aria-hidden="true">✓</span> Catálogo curado</li>
              <li><span aria-hidden="true">✓</span> Enlaces directos</li>
              <li><span aria-hidden="true">✓</span> Sin costo para vos</li>
            </ul>
          </div>

          <aside className="hero-radar" aria-label="Cómo selecciona productos AH Tecno">
            <div className="hero-radar__header">
              <div>
                <span className="hero-radar__signal" aria-hidden="true" />
                <strong>AH Radar</strong>
              </div>
              <span className="hero-radar__status">Selección activa</span>
            </div>

            <p className="hero-radar__label">Cómo funciona</p>
            <ol className="hero-radar__steps">
              {radarSteps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>

            <div className="hero-radar__footer">
              <strong>{loading ? '...' : products.length}</strong>
              <span>{products.length === 1 ? 'hallazgo reciente' : 'hallazgos recientes'} en la vidriera</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="category-shortcuts" aria-labelledby="shortcut-title">
        <div className="category-shortcuts__intro">
          <p className="eyebrow">Acceso rápido</p>
          <h2 id="shortcut-title">¿Qué estás buscando?</h2>
        </div>
        <div className="category-shortcuts__list">
          {categories.slice(0, 6).map((category) => (
            <Link to={`/productos?categoria=${category.slug}`} key={category.slug}>
              <span aria-hidden="true">{category.icon}</span>
              {category.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-section" aria-labelledby="latest-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Vidriera actual</p>
            <h2 id="latest-title">Productos para mirar hoy</h2>
          </div>
          <Link className="section-link" to="/ultimos">Ver últimos subidos →</Link>
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
              />
            ))}
            <Link className="carousel-more" to="/ultimos">Ver últimos subidos →</Link>
          </div>
        )}
      </section>

      <section className="landing-section" aria-labelledby="why-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Nuestra forma de trabajar</p>
            <h2 id="why-title">Menos ruido. Más claridad para decidir.</h2>
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
