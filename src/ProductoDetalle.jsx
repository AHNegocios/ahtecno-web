import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductDetailSkeleton } from './LoadingStates'
import { ProductDetailsContent } from './Producto'
import { getProductPath, normalizeProductIdentifier } from './productUrls'
import { isProductPubliclyVisible } from './productVisibility'
import { siteConfig } from './siteConfig'
import { supabase } from './supabaseClient'

const setMetaContent = (selector, content) => {
  const element = document.head.querySelector(selector)
  if (element) element.setAttribute('content', content)
}

function ProductoDetalle() {
  const { productKey } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadProduct = async () => {
      setLoading(true)
      setError('')
      const identifier = normalizeProductIdentifier(productKey)

      if (!identifier) {
        setError('No encontramos ese producto.')
        setLoading(false)
        return
      }

      const requestProduct = (withPublicationFilters) => {
        let query = supabase
          .from('Productos')
          .select('*')
          .eq(identifier.field, identifier.value)

        if (withPublicationFilters) {
          query = query
            .eq('is_visible', true)
            .or('ml_status.is.null,ml_status.eq.active')
        }

        return query.maybeSingle()
      }

      let result = await requestProduct(true)
      if (result.error && String(result.error.message).includes('is_visible')) {
        result = await requestProduct(false)
      }
      const { data, error: requestError } = result

      if (!active) return

      if (requestError || !data || !isProductPubliclyVisible(data)) {
        setError('La oferta no está disponible o dejó de estar activa.')
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    loadProduct()
    return () => {
      active = false
    }
  }, [productKey])

  useEffect(() => {
    if (!product?.titulo) return undefined

    const title = `${product.titulo} | AH Tecno`
    const description = String(
      product.descripcion ||
        `Consultá imágenes, características y datos disponibles de ${product.titulo} antes de continuar en Mercado Libre.`,
    )
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160)
    const canonicalUrl = `${siteConfig.siteUrl}${getProductPath(product)}`
    const image = product.imagen || `${siteConfig.siteUrl}/og.png`
    const canonical = document.head.querySelector('link[rel="canonical"]')
    const structuredData = document.createElement('script')
    structuredData.id = 'ah-product-structured-data'
    structuredData.type = 'application/ld+json'
    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.titulo,
      image: Array.isArray(product.imagenes) && product.imagenes.length
        ? product.imagenes
        : [image],
      description,
      sku: product.ml_id || String(product.id),
      category: product.categoria || 'Tecnología',
      offers: Number(product.precio) > 0
        ? {
            '@type': 'Offer',
            url: product.link || canonicalUrl,
            priceCurrency: product.currency_id || 'ARS',
            price: Number(product.precio),
            availability: 'https://schema.org/InStock',
            itemCondition:
              String(product.condition || '').toLowerCase() === 'used'
                ? 'https://schema.org/UsedCondition'
                : 'https://schema.org/NewCondition',
          }
        : undefined,
    })

    document.title = title
    setMetaContent('meta[name="description"]', description)
    setMetaContent('meta[property="og:type"]', 'product')
    setMetaContent('meta[property="og:title"]', title)
    setMetaContent('meta[property="og:description"]', description)
    setMetaContent('meta[property="og:url"]', canonicalUrl)
    setMetaContent('meta[property="og:image"]', image)
    setMetaContent('meta[name="twitter:title"]', title)
    setMetaContent('meta[name="twitter:description"]', description)
    setMetaContent('meta[name="twitter:image"]', image)
    canonical?.setAttribute('href', canonicalUrl)
    document.getElementById(structuredData.id)?.remove()
    document.head.appendChild(structuredData)

    return () => {
      structuredData.remove()
      setMetaContent('meta[property="og:type"]', 'website')
      setMetaContent(
        'meta[property="og:image"]',
        `${siteConfig.siteUrl}/og.png`,
      )
      setMetaContent(
        'meta[name="twitter:image"]',
        `${siteConfig.siteUrl}/og.png`,
      )
    }
  }, [product])

  return (
    <main className="product-page">
      <Link className="product-page__back" to="/productos">← Volver al catálogo</Link>

      {loading && (
        <ProductDetailSkeleton />
      )}

      {!loading && error && (
        <div className="status-panel status-panel--error" role="alert">
          <span className="status-panel__icon" aria-hidden="true">!</span>
          <h1>Producto no disponible</h1>
          <p>{error}</p>
          <p className="status-panel__hint">
            Lo ocultamos del catálogo para que nadie termine en un enlace vencido.
          </p>
          <Link className="button button--secondary" to="/productos">Ver otros productos</Link>
        </div>
      )}

      {!loading && product && (
        <article className="product-page__panel">
          <ProductDetailsContent
            product={product}
            context="detail"
            titleId="product-detail-title"
          />
        </article>
      )}
    </main>
  )
}

export default ProductoDetalle
