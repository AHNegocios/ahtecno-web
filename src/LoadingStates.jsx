export function CatalogSkeleton({ count = 6, layout = 'grid' }) {
  return (
    <div
      className={`catalog-skeleton catalog-skeleton--${layout}`}
      role="status"
      aria-label="Cargando productos"
    >
      {Array.from({ length: count }, (_, index) => (
        <article className="catalog-skeleton__card" aria-hidden="true" key={index}>
          <span className="catalog-skeleton__image" />
          <div className="catalog-skeleton__body">
            <span className="catalog-skeleton__line catalog-skeleton__line--short" />
            <span className="catalog-skeleton__line" />
            <span className="catalog-skeleton__line catalog-skeleton__line--medium" />
            <span className="catalog-skeleton__price" />
            <span className="catalog-skeleton__actions" />
          </div>
        </article>
      ))}
      <span className="sr-only">Cargando productos seleccionados…</span>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div
      className="product-detail-skeleton"
      role="status"
      aria-label="Cargando ficha del producto"
    >
      <span className="product-detail-skeleton__image" aria-hidden="true" />
      <div className="product-detail-skeleton__copy" aria-hidden="true">
        <span className="catalog-skeleton__line catalog-skeleton__line--short" />
        <span className="product-detail-skeleton__title" />
        <span className="product-detail-skeleton__title product-detail-skeleton__title--short" />
        <span className="catalog-skeleton__price" />
        <span className="product-detail-skeleton__notice" />
        <span className="product-detail-skeleton__button" />
      </div>
      <span className="sr-only">Cargando la ficha del producto…</span>
    </div>
  )
}
