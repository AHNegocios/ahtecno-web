import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, getCategoryLabel, getProductCategory } from './catalogConfig'
import Producto from './Producto'
import { useProducts } from './useProducts'

const orderOptions = [
  { value: 'mas_nuevos', label: 'Más nuevos', icon: '✦' },
  { value: 'menor_precio', label: 'Menor precio', icon: '↓' },
  { value: 'mayor_precio', label: 'Mayor precio', icon: '↑' },
]

function Inicio() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [panelOpen, setPanelOpen] = useState(false)
  const [view, setView] = useState('grilla')

  const query = searchParams.get('q') || ''
  const selectedCategory = searchParams.get('categoria') || 'todas'
  const selectedOrder = searchParams.get('orden') || 'mas_nuevos'
  const { products, loading, error, retry } = useProducts({ order: selectedOrder })

  const updateParam = (key, value, defaultValue = '') => {
    const nextParams = new URLSearchParams(searchParams)

    if (!value || value === defaultValue) {
      nextParams.delete(key)
    } else {
      nextParams.set(key, value)
    }

    setSearchParams(nextParams, { replace: true })
  }

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch = !normalizedQuery || product.titulo.toLowerCase().includes(normalizedQuery)
      const matchesCategory =
        selectedCategory === 'todas' || getProductCategory(product) === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, query, selectedCategory])

  const selectCategory = (slug) => {
    updateParam('categoria', slug, 'todas')
    setPanelOpen(false)
  }

  return (
    <main className="catalog-page">
      <header className="page-heading">
        <p className="eyebrow">Selección curada</p>
        <h1>Catálogo de productos</h1>
        <p>Buscá, ordená y filtrá las oportunidades que seleccionamos para vos.</p>
      </header>

      <div className="catalog-layout">
        {panelOpen && (
          <button className="catalog-overlay" type="button" aria-label="Cerrar filtros" onClick={() => setPanelOpen(false)} />
        )}

        <aside className={`catalog-sidebar ${panelOpen ? 'catalog-sidebar--open' : ''}`} aria-label="Filtros del catálogo">
          <div className="catalog-sidebar__header">
            <h2>Filtros</h2>
            <button className="catalog-sidebar__close" type="button" onClick={() => setPanelOpen(false)}>
              Cerrar
            </button>
          </div>

          <div className="filter-group">
            <h3>Ordenar por</h3>
            <div className="filter-list">
              {orderOptions.map((option) => (
                <button
                  className="filter-button"
                  type="button"
                  key={option.value}
                  aria-pressed={selectedOrder === option.value}
                  onClick={() => updateParam('orden', option.value, 'mas_nuevos')}
                >
                  <span>{option.label}</span>
                  <span aria-hidden="true">{option.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Categorías</h3>
            <div className="filter-list">
              <button
                className="filter-button"
                type="button"
                aria-pressed={selectedCategory === 'todas'}
                onClick={() => selectCategory('todas')}
              >
                <span>Todas</span>
                <span aria-hidden="true">◇</span>
              </button>

              {categories.map((category) => (
                <button
                  className="filter-button"
                  type="button"
                  key={category.slug}
                  aria-pressed={selectedCategory === category.slug}
                  onClick={() => selectCategory(category.slug)}
                >
                  <span>{category.label}</span>
                  <span aria-hidden="true">{category.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="catalog-main" aria-live="polite">
          <div className="catalog-toolbar">
            <button className="mobile-filter-button" type="button" onClick={() => setPanelOpen(true)}>
              Filtros
              <span aria-hidden="true">☷</span>
            </button>

            <label className="catalog-search">
              <span className="sr-only">Buscar oferta</span>
              <input
                type="search"
                placeholder="Buscar oferta..."
                value={query}
                onChange={(event) => updateParam('q', event.target.value)}
              />
            </label>

            <div className="view-switch" aria-label="Vista del catálogo">
              <button type="button" aria-label="Vista en grilla" aria-pressed={view === 'grilla'} onClick={() => setView('grilla')}>
                ⊞
              </button>
              <button type="button" aria-label="Vista en lista" aria-pressed={view === 'lista'} onClick={() => setView('lista')}>
                ☷
              </button>
            </div>
          </div>

          {!loading && !error && (
            <p className="results-summary">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
              {selectedCategory !== 'todas' ? ` en ${getCategoryLabel(selectedCategory)}` : ''}
            </p>
          )}

          {loading && (
            <div className="status-panel" role="status">
              <div className="loading-dots" aria-hidden="true"><span /><span /><span /></div>
              <p>Cargando las ofertas seleccionadas...</p>
            </div>
          )}

          {!loading && error && (
            <div className="status-panel status-panel--error" role="alert">
              <h2>No pudimos cargar el catálogo</h2>
              <p>{error}</p>
              <button className="button button--secondary" type="button" onClick={retry}>Reintentar</button>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="status-panel">
              <h2>No encontramos coincidencias</h2>
              <p>Probá con otra búsqueda o elegí una categoría diferente.</p>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className={`catalog-grid ${view === 'lista' ? 'catalog-grid--list' : ''}`}>
              {filteredProducts.map((product) => (
                <Producto
                  key={product.id}
                  titulo={product.titulo}
                  precio={product.precio}
                  linkOferta={product.link}
                  imagen={product.imagen}
                  vista={view}
                  ml_id={product.ml_id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Inicio
