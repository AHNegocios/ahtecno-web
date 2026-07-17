import { Link } from 'react-router-dom'
import { categories } from './catalogConfig'

function Categorias() {
  return (
    <main className="categories-page">
      <header className="page-heading">
        <p className="eyebrow">Explorá por rubro</p>
        <h1>Categorías</h1>
        <p>Elegí una sección y te mostramos los productos relacionados disponibles en el catálogo.</p>
      </header>

      <div className="categories-grid">
        {categories.map((category) => (
          <Link
            className="category-card"
            data-category={category.slug}
            to={`/productos?categoria=${category.slug}`}
            key={category.slug}
          >
            <span className="category-card__icon" aria-hidden="true">{category.icon}</span>
            <div>
              <h2>{category.label}</h2>
              <p>{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default Categorias
