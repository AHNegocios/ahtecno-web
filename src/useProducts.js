import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { isProductPubliclyVisible } from './productVisibility'

const sanitizeProduct = (product) => ({
  ...product,
  titulo: product.titulo?.trim() || 'Producto sin título',
  imagen: product.imagen?.trim() || '',
  link: product.link?.trim() || '',
  ml_id: product.ml_id?.trim() || '',
})

export function useProducts({ order = 'mas_nuevos', limit = null } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let active = true

    async function fetchProducts() {
      setLoading(true)
      setError('')

      const buildQuery = (withPublicationFilters) => {
        let query = supabase.from('Productos').select('*')

        if (withPublicationFilters) {
          query = query
            .eq('is_visible', true)
            .or('ml_status.is.null,ml_status.eq.active')
        }

        if (order === 'menor_precio') {
          query = query.order('precio', { ascending: true })
        } else if (order === 'mayor_precio') {
          query = query.order('precio', { ascending: false })
        } else {
          query = query.order('created_at', { ascending: false })
        }

        return limit ? query.limit(limit) : query
      }

      let result = await buildQuery(true)
      if (result.error && String(result.error.message).includes('is_visible')) {
        result = await buildQuery(false)
      }
      const { data, error: requestError } = result

      if (!active) return

      if (requestError) {
        setProducts([])
        setError('No pudimos cargar las ofertas. Probá nuevamente en unos segundos.')
      } else {
        setProducts(
          (data || [])
            .map(sanitizeProduct)
            .filter(isProductPubliclyVisible),
        )
      }

      setLoading(false)
    }

    fetchProducts()

    return () => {
      active = false
    }
  }, [limit, order, revision])

  return {
    products,
    loading,
    error,
    retry: () => setRevision((current) => current + 1),
  }
}
