import { useEffect, useId, useRef, useState } from 'react'
import { categories, getProductCategory } from './catalogConfig'
import {
  formatProductCondition,
  normalizeGalleryImages,
  normalizeProductAttributes,
} from './productDetails'
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

function Producto({
  titulo,
  precio,
  linkOferta,
  imagen,
  imagenes = [],
  descripcion = '',
  caracteristicas = [],
  condicion = '',
  vista = 'grilla',
  esPrimero = false,
  ml_id = '',
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const closeButtonRef = useRef(null)
  const titleId = useId()
  const cleanLink = linkOferta?.trim() || ''
  const categorySlug = getProductCategory({ titulo })
  const category = categories.find(({ slug }) => slug === categorySlug)
  const galleryImages = normalizeGalleryImages(imagen, imagenes)
  const productAttributes = normalizeProductAttributes(caracteristicas)
  const conditionLabel = formatProductCondition(condicion)
  const cleanDescription = typeof descripcion === 'string' ? descripcion.trim() : ''
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0] || ''
  const hasExtendedDetails = Boolean(cleanDescription || productAttributes.length)

  useEffect(() => {
    if (!modalOpen) return undefined

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setModalOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [modalOpen])

  const openDetails = () => {
    setActiveImageIndex(0)
    setModalOpen(true)
  }

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
            <div className="product-card__meta">
              <span>{category?.label || 'Tecnología'}</span>
              <span>Mercado Libre</span>
            </div>
            <h3 id={titleId}>{titulo}</h3>
            <span className="product-card__price-label">Precio publicado</span>
            <p className="product-card__price">{formatCurrency(precio)}</p>
          </div>

          <div className="product-card__actions">
            {cleanLink ? (
              <a className="product-action product-action--primary" href={cleanLink} target="_blank" rel="noopener noreferrer sponsored">
                Ver oferta <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="product-action product-action--disabled">Sin enlace</span>
            )}

            <button className="product-action product-action--secondary" type="button" onClick={openDetails}>
              Detalles
            </button>
          </div>
        </div>
      </article>

      {modalOpen && (
        <div className="product-modal" role="presentation">
          <button className="product-modal__backdrop" type="button" aria-label="Cerrar detalles" onClick={() => setModalOpen(false)} />

          <section className="product-modal__dialog" role="dialog" aria-modal="true" aria-labelledby={`${titleId}-modal`}>
            <button ref={closeButtonRef} className="product-modal__close" type="button" aria-label="Cerrar detalles" onClick={() => setModalOpen(false)}>
              ✕
            </button>

            <div className="product-modal__hero">
              <div className="product-modal__gallery">
                <div className="product-modal__image">
                  {activeImage ? <img src={activeImage} alt={titulo} /> : <span>Sin imagen</span>}
                </div>

                {galleryImages.length > 1 && (
                  <div className="product-modal__thumbnails" aria-label="Imágenes del producto">
                    {galleryImages.map((imageUrl, index) => (
                      <button
                        className={index === activeImageIndex ? 'is-active' : ''}
                        type="button"
                        aria-label={`Ver imagen ${index + 1}`}
                        aria-pressed={index === activeImageIndex}
                        onClick={() => setActiveImageIndex(index)}
                        key={imageUrl}
                      >
                        <img src={imageUrl} alt="" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="product-modal__content">
                <p className="eyebrow">Detalle de la oferta</p>
                <h2 id={`${titleId}-modal`}>{titulo}</h2>
                <p className="product-modal__price">{formatCurrency(precio)}</p>

                <div className="product-modal__meta">
                  <span>{category?.label || 'Tecnología'}</span>
                  {conditionLabel && <span>{conditionLabel}</span>}
                </div>

                <p className="product-modal__notice">
                  Precio, stock, envío y condiciones finales se confirman en Mercado Libre.
                </p>

                {ml_id && <p className="product-modal__reference">Referencia: {ml_id}</p>}

                {cleanLink && (
                  <a className="button button--primary" href={cleanLink} target="_blank" rel="noopener noreferrer sponsored">
                    Ver publicación en Mercado Libre <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>

            <div className="product-modal__details">
              {cleanDescription && (
                <section className="product-modal__section" aria-labelledby={`${titleId}-description`}>
                  <p className="eyebrow">Información del producto</p>
                  <h3 id={`${titleId}-description`}>Descripción</h3>
                  <p className="product-modal__description">{cleanDescription}</p>
                </section>
              )}

              {!!productAttributes.length && (
                <section className="product-modal__section" aria-labelledby={`${titleId}-attributes`}>
                  <div className="product-modal__section-heading">
                    <div>
                      <p className="eyebrow">Ficha técnica</p>
                      <h3 id={`${titleId}-attributes`}>Características</h3>
                    </div>
                    <span>{productAttributes.length} datos</span>
                  </div>
                  <dl className="product-modal__attributes">
                    {productAttributes.map((attribute, index) => (
                      <div key={attribute.id || `${attribute.name}-${index}`}>
                        <dt>{attribute.name}</dt>
                        <dd>{attribute.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {!hasExtendedDetails && (
                <p className="product-modal__empty">
                  Este producto todavía no tiene detalles técnicos sincronizados.
                </p>
              )}

              <p className="product-modal__footer-note">
                ¿Buscás más información? Revisá la publicación original para conocer todos los detalles del vendedor.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default Producto
