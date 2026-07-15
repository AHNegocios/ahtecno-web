import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Categorias from './Categorias'
import Comunidad from './Comunidad'
import Footer from './Footer'
import Inicio from './Inicio'
import Legal from './Legal'
import Navbar from './Navbar'
import NotFound from './NotFound'
import OfertasSemana from './OfertasSemana'
import Vidriera from './Vidriera'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Vidriera />} />
        <Route path="/productos" element={<Inicio />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/ofertas-semana" element={<OfertasSemana />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}

export default App
