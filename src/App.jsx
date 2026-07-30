import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FavoritesProvider } from './FavoritesContext'
import Footer from './Footer'
import { CatalogSkeleton } from './LoadingStates'
import Navbar from './Navbar'
import { RecentProductsProvider } from './RecentProductsContext'
import SeoManager from './SeoManager'
import './App.css'

const Admin = lazy(() => import('./Admin'))
const Categorias = lazy(() => import('./Categorias'))
const Comunidad = lazy(() => import('./Comunidad'))
const Favoritos = lazy(() => import('./Favoritos'))
const Inicio = lazy(() => import('./Inicio'))
const Legal = lazy(() => import('./Legal'))
const NotFound = lazy(() => import('./NotFound'))
const OfertasSemana = lazy(() => import('./OfertasSemana'))
const ProductoDetalle = lazy(() => import('./ProductoDetalle'))
const Vidriera = lazy(() => import('./Vidriera'))

function RouteLoading() {
  return (
    <main className="route-loading">
      <CatalogSkeleton count={4} />
    </main>
  )
}

function App() {
  return (
    <RecentProductsProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <SeoManager />
          <Navbar />

          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Vidriera />} />
              <Route path="/productos" element={<Inicio />} />
              <Route path="/producto/:productKey/:slug?" element={<ProductoDetalle />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/comunidad" element={<Comunidad />} />
              <Route path="/ultimos" element={<OfertasSemana />} />
              <Route path="/ofertas-semana" element={<OfertasSemana />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>

          <Footer />
        </BrowserRouter>
      </FavoritesProvider>
    </RecentProductsProvider>
  )
}

export default App
