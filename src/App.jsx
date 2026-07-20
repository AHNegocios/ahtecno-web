import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Admin from './Admin'
import Categorias from './Categorias'
import Comunidad from './Comunidad'
import Footer from './Footer'
import Inicio from './Inicio'
import Legal from './Legal'
import Navbar from './Navbar'
import NotFound from './NotFound'
import OfertasSemana from './OfertasSemana'
import ProductoDetalle from './ProductoDetalle'
import Vidriera from './Vidriera'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Vidriera />} />
        <Route path="/productos" element={<Inicio />} />
        <Route path="/producto/:productKey/:slug?" element={<ProductoDetalle />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/ultimos" element={<OfertasSemana />} />
        <Route path="/ofertas-semana" element={<OfertasSemana />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}

export default App
