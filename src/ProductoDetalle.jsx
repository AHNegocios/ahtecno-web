import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductDetailsContent } from './Producto'
import { normalizeProductIdentifier } from './productUrls'
import { isProductPubliclyVisible } from './productVisibility'
import { supabase } from './supabaseClient'

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
    const previousTitle = document.title
    document.title = `${product.titulo} | AH Tecno`
    return () => {
      document.title = previousTitle
    }
  }, [product])

  return (
    <main className="product-page">
      <Link className="product-page__back" to="/productos">← Volver al catálogo</Link>

      {loading && (
        <div className="status-panel" role="status">
          <div className="loading-dots" aria-hidden="true"><span /><span /><span /></div>
          <p>Cargando la ficha del producto…</p>
        </div>
      )}

      {!loading && error && (
        <div className="status-panel status-panel--error" role="alert">
          <h1>Producto no disponible</h1>
          <p>{error}</p>
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
