// src/OfertasSemana.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function OfertasSemana() {
  return (
    <div style={{ backgroundColor: '#0d0d12', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px' }}>

      {/* FOTO DE PERFIL Y BIO */}
      <img 
        src="/LogoAHTecno.png" 
        alt="A&H Tecno" 
        style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '15px', border: '2px solid #00e5ff', objectFit: 'contain', backgroundColor: '#1e1e24' }} 
      />
      <h1 style={{ fontSize: '1.8rem', margin: '0 0 5px 0', color: '#00e5ff', fontWeight: '900' }}>
        A&H Tecno
      </h1>
      <p style={{ color: '#aaaaaa', marginBottom: '40px', textAlign: 'center', maxWidth: '300px' }}>
        ⚡ Seleccionamos las mejores ofertas de la semana para tu setup.
      </p>

      {/* BOTONES ESTILO LINKTREE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '400px' }}>

        {/* Botón Principal: Lleva a tu catálogo general */}
        <Link to="/productos" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#00e5ff', color: '#000', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', transition: 'transform 0.2s' }}>
            🔥 Explorar Catálogo Completo
          </div>
        </Link>

        {/* Botón Específico 1: Link directo a una oferta bomba de Mercado Libre */}
        <a href="https://www.mercadolibre.com.ar/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#1e1e24', color: '#00e5ff', border: '1px solid #00e5ff', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
            ⌨️ Teclado Redragon Eisa Pro (En stock)
          </div>
        </a>

        {/* Botón Específico 2 */}
        <a href="https://www.mercadolibre.com.ar/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#1e1e24', color: '#00e5ff', border: '1px solid #00e5ff', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
            🔋 Oferta Power Banks
          </div>
        </a>

        {/* Botón de Comunidad */}
        <Link to="/comunidad" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'transparent', color: '#aaaaaa', border: '1px dashed #4d4d5e', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>
            Sumate a nuestra Comunidad
          </div>
        </Link>

      </div>
    </div>
  );
}

export default OfertasSemana;