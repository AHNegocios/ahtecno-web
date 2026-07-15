import { useEffect, useId, useState } from 'react'
import './Producto.css'

const formatCurrency = (amount) => {
  const number = Number(amount)

  if (!Number.isFinite(number) || number <= 0) return 'Consultar precio'

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(number)
}

function Producto({ titulo, precio, linkOferta, imagen, vista = 'grilla', esPrimero = false, ml_id = '' }) {
  const [modalOpen, setModalOpen] = useState(false)
  const titleId = useId()
  const cleanLink = linkOferta?.trim() || ''

  useEffect(() => {
    if (!modalOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setModalOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [modalOpen])

  return (
    <>
      <article className={`product-card ${vista === 'lista' ? 'product-card--list' : ''}`}>
        {esPrimero && <span className="product-card__badge">Último ingresado</span>}

        <div className="product-card__image-wrap">
          {imagen ? (
            <img src={imagen} alt={titulo} loading="lazy" />
          ) : (
            <span className="product-card__image-placeholder">Imagen no disponible</span>
          )}
        </div>

        <div className="product-card__body">
          <div className="product-card__copy">
            <h3 id={titleId}>{titulo}</h3>
            <p className="product-card__price">{formatCurrency(precio)}</p>
          </div>

          <div className="product-card__actions">
            {cleanLink ? (
              <a className="product-action product-action--primary" href={cleanLink} target="_blank" rel="noopener noreferrer sponsored">
                Ver oferta
              </a>
            ) : (
              <span className="product-action product-action--disabled">Sin enlace</span>
            )}

            <button className="product-action product-action--secondary" type="button" onClick={() => setModalOpen(true)}>
              Más info
            </button>
          </div>
        </div>
      </article>

      {modalOpen && (
        <div className="product-modal" role="presentation">
          <button className="product-modal__backdrop" type="button" aria-label="Cerrar detalles" onClick={() => setModalOpen(false)} />

          <section className="product-modal__dialog" role="dialog" aria-modal="true" aria-labelledby={`${titleId}-modal`}>
            <button className="product-modal__close" type="button" aria-label="Cerrar detalles" onClick={() => setModalOpen(false)}>
              ✕
            </button>

            <div className="product-modal__image">
              {imagen ? <img src={imagen} alt="" aria-hidden="true" /> : <span>Sin imagen</span>}
            </div>

            <div className="product-modal__content">
              <p className="eyebrow">Detalle de la oferta</p>
              <h2 id={`${titleId}-modal`}>{titulo}</h2>
              <p className="product-modal__price">{formatCurrency(precio)}</p>
              <p className="product-modal__notice">
                El precio y la disponibilidad definitivos se confirman en Mercado Libre.
              </p>

              {ml_id && <p className="product-modal__reference">Referencia: {ml_id}</p>}

              {cleanLink && (
                <a className="button button--primary" href={cleanLink} target="_blank" rel="noopener noreferrer sponsored">
                  Ir a Mercado Libre
                </a>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default Producto
