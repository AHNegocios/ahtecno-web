// src/Categorias.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Categorias() {
  // Estilo reutilizable para los bloques
  const estiloBloque = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#1e1e24',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '30px',
    textDecoration: 'none',
    transition: 'all 0.3s',
    cursor: 'pointer'
  };

  return (
    <div style={{ padding: '60px 20px', minHeight: '100vh', backgroundColor: '#0d0d12' }}>
      <h1 style={{ color: '#ffffff', textAlign: 'center', fontSize: '2.5rem', marginBottom: '10px' }}>
        Nuestras <span style={{ color: '#00e5ff' }}>Categorías</span>
      </h1>
      <p style={{ color: '#aaaaaa', textAlign: 'center', marginBottom: '50px', fontSize: '1.1rem' }}>
        Navegá por nuestras secciones y encontrá exactamente lo que tu setup necesita.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* BLOQUE 1 */}
        <Link to="/productos" style={estiloBloque} className="bloque-categoria">
          <div style={{ fontSize: '4rem', marginRight: '30px' }}>⌨️</div>
          <div>
            <h2 style={{ color: '#00e5ff', margin: '0 0 10px 0', fontSize: '1.8rem' }}>Periféricos</h2>
            <p style={{ color: '#aaaaaa', margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>Teclados mecánicos, mouses de precisión, auriculares y alfombrillas para dominar cada partida.</p>
          </div>
        </Link>

        {/* BLOQUE 2 */}
        <Link to="/productos" style={estiloBloque} className="bloque-categoria">
          <div style={{ fontSize: '4rem', marginRight: '30px' }}>🔋</div>
          <div>
            <h2 style={{ color: '#00e5ff', margin: '0 0 10px 0', fontSize: '1.8rem' }}>Energía</h2>
            <p style={{ color: '#aaaaaa', margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>Power banks de carga rápida, adaptadores y cables reforzados para no quedarte nunca sin batería.</p>
          </div>
        </Link>

        {/* BLOQUE 3 */}
        <Link to="/productos" style={estiloBloque} className="bloque-categoria">
          <div style={{ fontSize: '4rem', marginRight: '30px' }}>🎥</div>
          <div>
            <h2 style={{ color: '#00e5ff', margin: '0 0 10px 0', fontSize: '1.8rem' }}>Imagen y Video</h2>
            <p style={{ color: '#aaaaaa', margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>Proyectores 4K, monitores, cámaras web y accesorios de streaming para la mejor calidad visual.</p>
          </div>
        </Link>

      </div>
    </div>
  );
}

export default Categorias;