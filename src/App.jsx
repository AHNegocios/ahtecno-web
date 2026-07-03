// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import Vidriera from './Vidriera';
import Inicio from './Inicio'; 
import Comunidad from './Comunidad'; 
import OfertasSemana from './OfertasSemana';
import Categorias from './Categorias';
import './index.css'; 

function App() {
  // Estado para controlar el menú lateral de ajustes
  const [menuAjustesAbierto, setMenuAjustesAbierto] = useState(false);

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

        {/* NAVEGACIÓN Y BOTÓN 3 RAYITAS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <nav className="nav-links">
            <NavLink to="/" style={estiloPestaña} end>Inicio</NavLink>
            
            <div className="dropdown">
              <Link to="/categorias" style={{ textDecoration: 'none' }}>
                <span className="dropdown-titulo">Categorías ▾</span>
              </Link>
              <div className="dropdown-content">
                <Link to="/productos">Periféricos</Link>
                <Link to="/productos">Componentes</Link>
                <Link to="/productos">Energía</Link>
                <Link to="/productos">Imagen y Video</Link>
                <Link to="/productos">Audio</Link>
              </div>
            </div>

            <NavLink to="/productos" style={estiloPestaña}>Productos</NavLink>
            <NavLink to="/comunidad" style={estiloPestaña}>Comunidad</NavLink>
          </nav>

          {/* BOTÓN DE AJUSTES (3 RAYITAS) */}
          <button 
            onClick={() => setMenuAjustesAbierto(true)}
            style={{ background: 'transparent', border: 'none', color: '#00e5ff', fontSize: '1.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            ☰
          </button>
        </div>
      </header>

      {/* PANEL LATERAL DE AJUSTES (Off-Canvas) */}
      {menuAjustesAbierto && (
        <>
          {/* Fondo oscuro que tapa todo */}
          <div 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9998 }} 
            onClick={() => setMenuAjustesAbierto(false)}
          ></div>
          
          {/* Menú deslizable */}
          <div className="menu-ajustes-lateral">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: '#00e5ff', margin: 0, fontSize: '1.5rem' }}>Ajustes</h2>
              <button onClick={() => setMenuAjustesAbierto(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* OPCIÓN 1: TEMA */}
            <div className="ajuste-item">
              <span style={{ color: '#fff', fontWeight: 'bold' }}>🎨 Tema Visual</span>
              <select style={{ background: '#1e1e24', color: '#00e5ff', border: '1px solid #333', padding: '8px', borderRadius: '6px' }}>
                <option value="oscuro">Oscuro (Neón)</option>
                <option value="claro">Claro (Celeste)</option>
              </select>
            </div>

            {/* OPCIÓN 2: MONEDA */}
            <div className="ajuste-item">
              <span style={{ color: '#fff', fontWeight: 'bold' }}>💵 Moneda</span>
              <select style={{ background: '#1e1e24', color: '#00e5ff', border: '1px solid #333', padding: '8px', borderRadius: '6px' }}>
                <option value="ars">Pesos (ARS)</option>
                <option value="usd">Dólares (USD)</option>
              </select>
            </div>

            {/* OPCIÓN 3: LEGALES */}
            <div className="ajuste-item" style={{ marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '20px' }}>
              <Link to="/comunidad" onClick={() => setMenuAjustesAbierto(false)} style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9rem' }}>Avisos Legales y Privacidad ➜</Link>
            </div>
          </div>
        </>
      )}

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