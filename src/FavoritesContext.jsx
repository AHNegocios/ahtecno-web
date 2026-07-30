import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FavoritesContext } from './favoritesContextValue'
import {
  FAVORITES_STORAGE_KEY,
  normalizeFavoriteSnapshot,
  parseStoredFavorites,
} from './favoritesStorage'

const loadFavorites = () => {
  if (typeof window === 'undefined') return []
  return parseStoredFavorites(window.localStorage.getItem(FAVORITES_STORAGE_KEY))
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favorites),
      )
    } catch {
      // Si el navegador bloquea el almacenamiento, la sesión actual sigue funcionando.
    }
  }, [favorites])

  useEffect(() => {
    const syncOtherTabs = (event) => {
      if (event.key === FAVORITES_STORAGE_KEY) {
        setFavorites(parseStoredFavorites(event.newValue))
      }
    }

    window.addEventListener('storage', syncOtherTabs)
    return () => window.removeEventListener('storage', syncOtherTabs)
  }, [])

  const isFavorite = useCallback(
    (productId) =>
      favorites.some(
        (favorite) => favorite.id === String(productId ?? '').trim(),
      ),
    [favorites],
  )

  const addFavorite = useCallback((product) => {
    const snapshot = normalizeFavoriteSnapshot(product)
    if (!snapshot) return

    setFavorites((current) => [
      snapshot,
      ...current.filter((favorite) => favorite.id !== snapshot.id),
    ])
  }, [])

  const removeFavorite = useCallback((productId) => {
    const id = String(productId ?? '').trim()
    setFavorites((current) =>
      current.filter((favorite) => favorite.id !== id),
    )
  }, [])

  const toggleFavorite = useCallback((product) => {
    const id = String(product?.id ?? '').trim()
    if (!id) return

    setFavorites((current) => {
      const exists = current.some((favorite) => favorite.id === id)
      if (exists) {
        return current.filter((favorite) => favorite.id !== id)
      }

      const snapshot = normalizeFavoriteSnapshot(product)
      return snapshot ? [snapshot, ...current] : current
    })
  }, [])

  const value = useMemo(
    () => ({
      favorites,
      count: favorites.length,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
    }),
    [
      addFavorite,
      favorites,
      isFavorite,
      removeFavorite,
      toggleFavorite,
    ],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}
