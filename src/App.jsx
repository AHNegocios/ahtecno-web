// src/App.jsx
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import Vidriera from './Vidriera';
import Inicio from './Inicio';       // Este es tu Catálogo
import Comunidad from './Comunidad'; // Esta es tu página de redes
import './index.css'; 
import OfertasSemana from './OfertasSemana';
import Categorias from './Categorias';

function App() {
  const estiloPestaña = ({ isActive }) => ({
    color: isActive ? '#00e5ff' : '#ffffff',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.3s'
  });

  return (
    <BrowserRouter>
      <header className="navbar-superior">
        {/* LOGO OFICIAL */}
        <Link to="/" className="logo-contenedor" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/LogoAHTecno.png" alt="A&H Logo" style={{ height: '40px', objectFit: 'contain' }} />
          <span className="logo-texto-cyan">A&H <span className="logo-texto-blanco">TECNO</span></span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" style={estiloPestaña} end>Inicio</NavLink>
          
          <div className="dropdown">
            <span className="dropdown-titulo">Categorías ▾</span>
            <div className="dropdown-content">
              <Link to="/productos">Periféricos</Link>
              <Link to="/productos">Componentes</Link>
              <Link to="/productos">Equipos armados</Link>
              <Link to="/productos">Energía</Link>
              <Link to="/productos">Imagen y Video</Link>
              <Link to="/productos">Audio</Link>
              <Link to="/productos">Almacenamiento</Link>
              <Link to="/productos">Redes</Link>
              <Link to="/productos">Varios</Link>
            </div>
          </div>

          {/* Cambiamos la ruta a "productos" */}
          <NavLink to="/productos" style={estiloPestaña}>Productos</NavLink>
          <NavLink to="/comunidad" style={estiloPestaña}>Comunidad</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Vidriera />} />
        <Route path="/productos" element={<Inicio />} /> 
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/ofertas-semana" element={<OfertasSemana />} />
        <Route path="/categorias" element={<Categorias />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;