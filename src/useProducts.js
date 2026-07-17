import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

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

      let query = supabase.from('Productos').select('*')

      if (order === 'menor_precio') {
        query = query.order('precio', { ascending: true })
      } else if (order === 'mayor_precio') {
        query = query.order('precio', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      if (limit) query = query.limit(limit)

      const { data, error: requestError } = await query

      if (!active) return

      if (requestError) {
        setProducts([])
        setError('No pudimos cargar las ofertas. Probá nuevamente en unos segundos.')
      } else {
        setProducts((data || []).map(sanitizeProduct))
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
