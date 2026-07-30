import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { RecentProductsContext } from './recentProductsContextValue'
import {
  parseStoredRecentProducts,
  prependRecentProduct,
  RECENT_PRODUCTS_STORAGE_KEY,
} from './recentProductsStorage'

const loadRecentProducts = () => {
  if (typeof window === 'undefined') return []
  return parseStoredRecentProducts(
    window.localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY),
  )
}

export function RecentProductsProvider({ children }) {
  const [recentProducts, setRecentProducts] = useState(loadRecentProducts)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        RECENT_PRODUCTS_STORAGE_KEY,
        JSON.stringify(recentProducts),
      )
    } catch {
      // La navegación sigue funcionando aunque el navegador bloquee el guardado.
    }
  }, [recentProducts])

  useEffect(() => {
    const syncOtherTabs = (event) => {
      if (event.key === RECENT_PRODUCTS_STORAGE_KEY) {
        setRecentProducts(parseStoredRecentProducts(event.newValue))
      }
    }

    window.addEventListener('storage', syncOtherTabs)
    return () => window.removeEventListener('storage', syncOtherTabs)
  }, [])

  const addRecentProduct = useCallback((product) => {
    setRecentProducts((current) => prependRecentProduct(current, product))
  }, [])

  const clearRecentProducts = useCallback(() => {
    setRecentProducts([])
  }, [])

  const value = useMemo(
    () => ({
      recentProducts,
      addRecentProduct,
      clearRecentProducts,
    }),
    [addRecentProduct, clearRecentProducts, recentProducts],
  )

  return (
    <RecentProductsContext.Provider value={value}>
      {children}
    </RecentProductsContext.Provider>
  )
}
