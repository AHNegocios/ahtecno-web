// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import Vidriera from './Vidriera';
import Inicio from './Inicio'; 
import Comunidad from './Comunidad'; 
import OfertasSemana from './OfertasSemana';
import Categorias from './Categorias';
import './index.css'; 


function App() {
  const [menuAjustesAbierto, setMenuAjustesAbierto] = useState(false);
  const [tema, setTema] = useState('oscuro'); // <--- AGREGAMOS ESTE ESTADO

  // Lógica blindada para forzar el cambio de clase en el body HTML
  useEffect(() => {
    if (tema === 'claro') {
      document.body.classList.remove('tema-oscuro');
      document.body.classList.add('tema-claro');
    } else {
      document.body.classList.remove('tema-claro');
      document.body.classList.add('tema-oscuro');
    }
  }, [tema]);

  return (
    <BrowserRouter>
      <header className="navbar-superior" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: 'var(--fondo-tarjeta)', borderBottom: '1px solid var(--borde-tarjeta)' }}>
        {/* LOGO OFICIAL */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/LogoAHTecno.png" alt="A&H Logo" style={{ height: '40px', objectFit: 'contain' }} />
          <span style={{ color: 'var(--color-primario)', fontSize: '1.6rem', fontWeight: '900' }}>A&H <span style={{ color: 'var(--texto-principal)' }}>TECNO</span></span>
        </Link>

        {/* NAVEGACIÓN Y BOTÓN 3 RAYITAS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <NavLink to="/" style={({ isActive }) => ({ color: isActive ? 'var(--color-primario)' : 'var(--texto-principal)', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' })} end>Inicio</NavLink>
            
            {/* MENÚ DESPLEGABLE */}
            <div className="dropdown" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <NavLink to="/categorias" style={({ isActive }) => ({ color: isActive ? 'var(--color-primario)' : 'var(--texto-principal)', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.3s' })}>
                Categorías <span style={{ fontSize: '0.7rem', color: 'inherit', marginTop: '2px' }}>▼</span>
              </NavLink>
              
              {/* Forzamos que este contenedor puente sea transparente para borrar cualquier reborde viejo */}
              <div className="dropdown-content" style={{ position: 'absolute', top: '20px', left: 0, paddingTop: '15px', zIndex: 1000, background: 'transparent', border: 'none', boxShadow: 'none' }}>                <div style={{ backgroundColor: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-tarjeta)', borderRadius: '8px', overflow: 'hidden', minWidth: '220px', boxShadow: '0 8px 24px rgba(0,0,0,0.8)' }}>
                  <Link to="/categorias" style={{ fontWeight: 'bold', color: 'var(--color-primario)', padding: '12px 20px', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>Ver todas las secciones</Link>
                  <div style={{ height: '1px', backgroundColor: 'var(--borde-tarjeta)' }}></div>
                  <Link to="/productos" style={{ color: 'var(--texto-principal)', padding: '10px 20px', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>Periféricos</Link>
                  <Link to="/productos" style={{ color: 'var(--texto-principal)', padding: '10px 20px', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>Componentes</Link>
                  <Link to="/productos" style={{ color: 'var(--texto-principal)', padding: '10px 20px', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>Equipos armados</Link>
                  <Link to="/productos" style={{ color: 'var(--texto-principal)', padding: '10px 20px', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>Energía</Link>
                  <Link to="/productos" style={{ color: 'var(--texto-principal)', padding: '10px 20px', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>Imagen y Video</Link>
                  <Link to="/productos" style={{ color: 'var(--texto-principal)', padding: '10px 20px', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>Audio</Link>
                  <Link to="/productos" style={{ color: 'var(--texto-principal)', padding: '10px 20px', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>Almacenamiento</Link>
                  <Link to="/productos" style={{ color: 'var(--texto-principal)', padding: '10px 20px', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>Redes</Link>
                  <Link to="/productos" style={{ color: 'var(--texto-principal)', padding: '10px 20px', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>Varios</Link>
                </div>
              </div>
            </div>

            <NavLink to="/productos" style={({ isActive }) => ({ color: isActive ? 'var(--color-primario)' : 'var(--texto-principal)', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' })}>Productos</NavLink>
            <NavLink to="/comunidad" style={({ isActive }) => ({ color: isActive ? 'var(--color-primario)' : 'var(--texto-principal)', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' })}>Comunidad</NavLink>
          </nav>

          <button onClick={() => setMenuAjustesAbierto(true)} style={{ background: 'transparent', border: 'none', color: 'var(--color-primario)', fontSize: '2rem', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}>
            ☰
          </button>
        </div>
      </header>

      {/* MENÚ LATERAL DE AJUSTES */}
{/* MENÚ LATERAL DE AJUSTES */}
      {menuAjustesAbierto && (
        <>
          <div 
            onClick={() => setMenuAjustesAbierto(false)} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9998, backdropFilter: 'blur(3px)' }}
          ></div>
          
          <div style={{ position: 'fixed', top: 0, right: 0, width: '350px', height: '100vh', backgroundColor: 'var(--fondo-pagina)', borderLeft: '1px solid var(--borde-tarjeta)', zIndex: 9999, padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px', boxShadow: '-10px 0 30px rgba(0,0,0,0.8)', transition: 'background-color 0.3s ease' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ color: 'var(--texto-principal)', margin: 0, fontSize: '1.6rem', fontWeight: '900', transition: 'color 0.3s ease' }}>Configuración</h2>
              <button onClick={() => setMenuAjustesAbierto(false)} style={{ background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-tarjeta)', color: 'var(--texto-principal)', fontSize: '1.2rem', cursor: 'pointer', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s' }}>✕</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--fondo-tarjeta)', padding: '15px 20px', borderRadius: '10px', border: '1px solid var(--borde-tarjeta)', transition: 'all 0.3s ease' }}>
              <span style={{ color: 'var(--texto-principal)', fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.3s ease' }}>🎨 Tema visual</span>
              <select 
                value={tema} 
                onChange={(e) => setTema(e.target.value)} 
                style={{ backgroundColor: 'var(--fondo-pagina)', color: 'var(--color-primario)', border: '1px solid var(--borde-tarjeta)', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', outline: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                <option value="oscuro">Modo Oscuro</option>
                <option value="claro">Modo Claro</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--fondo-tarjeta)', padding: '15px 20px', borderRadius: '10px', border: '1px solid var(--borde-tarjeta)', transition: 'all 0.3s ease' }}>
              <span style={{ color: 'var(--texto-principal)', fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.3s ease' }}>💵 Moneda base</span>
              <select style={{ backgroundColor: 'var(--fondo-pagina)', color: 'var(--color-primario)', border: '1px solid var(--borde-tarjeta)', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', outline: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                <option value="ars">Pesos (ARS)</option>
                <option value="usd">Dólares (USD)</option>
              </select>
            </div>
            
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--borde-tarjeta)', paddingTop: '20px', transition: 'border-color 0.3s ease' }}>
              <Link to="/comunidad" onClick={() => setMenuAjustesAbierto(false)} style={{ color: 'var(--texto-secundario)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', transition: 'color 0.3s ease' }}>
                <span>Avisos Legales y Privacidad</span>
                <span style={{ color: 'var(--color-primario)' }}>➜</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* RUTAS */}
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