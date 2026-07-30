import { useContext } from 'react'
import { RecentProductsContext } from './recentProductsContextValue'

export const useRecentProducts = () => {
  const context = useContext(RecentProductsContext)
  if (!context) {
    throw new Error(
      'useRecentProducts debe usarse dentro de RecentProductsProvider.',
    )
  }
  return context
}
