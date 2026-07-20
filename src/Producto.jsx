import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, getProductCategory } from './catalogConfig'
import { trackProductEvent } from './outboundTracking'
import {
  formatProductCondition,
  normalizeGalleryImages,
  normalizeProductAttributes,
} from './productDetails'
import { getProductPath } from './productUrls'
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

const copyWithoutClipboardApi = (text) => {
  const input = document.createElement('textarea')
  input.value = text
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  const copied = document.execCommand('copy')
  input.remove()
  return copied
}

export function ProductDetailsContent({ product, context = 'modal', titleId }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [shareFeedback, setShareFeedback] = useState('')
  const {
    id,
    titulo,
    precio,
    link: cleanLink = '',
    imagen,
    imagenes = [],
    descripcion = '',
    attributes = [],
    condition = '',
    categoria = '',
    ml_id = '',
  } = product
  const categorySlug = getProductCategory({ titulo, categoria })
  const category = categories.find(({ slug }) => slug === categorySlug)
  const galleryImages = normalizeGalleryImages(imagen, imagenes)
  const productAttributes = normalizeProductAttributes(attributes)
  const conditionLabel = formatProductCondition(condition)
  const cleanDescription = typeof descripcion === 'string' ? descripcion.trim() : ''
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0] || ''
  const hasExtendedDetails = Boolean(cleanDescription || productAttributes.length)
  const productPath = getProductPath(product)
  const outboundSource = context === 'detail' ? 'detail' : 'modal'
  const ProductTitle = context === 'detail' ? 'h1' : 'h2'

  const shareProduct = async () => {
    const url = new URL(productPath, window.location.origin).toString()
    const shareData = {
      title: `${titulo} | AH Tecno`,
      text: `Mirá este producto seleccionado por AH Tecno: ${titulo}`,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setShareFeedback('Compartido')
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setShareFeedback('Enlace copiado')
      } else if (copyWithoutClipboardApi(url)) {
        setShareFeedback('Enlace copiado')
      } else {
        setShareFeedback('No se pudo copiar')
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareFeedback('No se pudo compartir')
    }
  }

  return (
    <>
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
          <ProductTitle id={titleId}>{titulo}</ProductTitle>
          <p className="product-modal__price">{formatCurrency(precio)}</p>

          <div className="product-modal__meta">
            <span>{category?.label || 'Tecnología'}</span>
            {conditionLabel && <span>{conditionLabel}</span>}
          </div>

          <p className="product-modal__notice">
            Precio, stock, envío y condiciones finales se confirman en Mercado Libre.
          </p>

          {ml_id && <p className="product-modal__reference">Referencia: {ml_id}</p>}

          <div className="product-modal__actions">
            {cleanLink && (
              <a
                className="button button--primary"
                href={cleanLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => trackProductEvent(id, outboundSource)}
              >
                Ver publicación en Mercado Libre <span aria-hidden="true">↗</span>
              </a>
            )}
            <button className="button button--secondary" type="button" onClick={shareProduct}>
              Compartir oferta
            </button>
            {context === 'modal' && (
              <Link className="product-modal__full-link" to={productPath}>
                Abrir ficha completa →
              </Link>
            )}
          </div>
          {shareFeedback && <p className="product-modal__share-feedback" role="status">{shareFeedback}</p>}
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
    </>
  )
}

function Producto({
  id,
  titulo,
  precio,
  linkOferta,
  imagen,
  imagenes = [],
  descripcion = '',
  caracteristicas = [],
  condicion = '',
  categoria = '',
  vista = 'grilla',
  esPrimero = false,
  ml_id = '',
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const closeButtonRef = useRef(null)
  const titleId = useId()
  const cleanLink = linkOferta?.trim() || ''
  const categorySlug = getProductCategory({ titulo, categoria })
  const category = categories.find(({ slug }) => slug === categorySlug)
  const product = {
    id,
    titulo,
    precio,
    link: cleanLink,
    imagen,
    imagenes,
    descripcion,
    attributes: caracteristicas,
    condition: condicion,
    categoria,
    ml_id,
  }

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
              <a
                className="product-action product-action--primary"
                href={cleanLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => trackProductEvent(id, 'card')}
              >
                Ver oferta <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="product-action product-action--disabled">Sin enlace</span>
            )}

            <button
              className="product-action product-action--secondary"
              type="button"
              onClick={() => setModalOpen(true)}
            >
              Detalles
            </button>
          </div>
        </div>
      </article>

      {modalOpen && (
        <div className="product-modal" role="presentation">
          <button
            className="product-modal__backdrop"
            type="button"
            aria-label="Cerrar detalles"
            onClick={() => setModalOpen(false)}
          />

          <section
            className="product-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${titleId}-modal`}
          >
            <button
              ref={closeButtonRef}
              className="product-modal__close"
              type="button"
              aria-label="Cerrar detalles"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>

            <ProductDetailsContent
              product={product}
              context="modal"
              titleId={`${titleId}-modal`}
            />
          </section>
        </div>
      )}
    </>
  )
}

export default Producto
