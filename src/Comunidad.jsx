// src/Comunidad.jsx
import React from 'react';

function Comunidad() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>
      <h2 style={{ color: '#00e5ff', fontSize: '2.5rem', marginBottom: '20px' }}>Conectá con A&H Tecno</h2>
      <p style={{ fontSize: '1.1rem', marginBottom: '40px', color: '#aaa' }}>
        Enterate de los nuevos ingresos, sorteos y ofertas relámpago en nuestras redes oficiales.
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          <button style={{ backgroundColor: '#E1306C', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Instagram
          </button>
        </a>
        <a href="https://wa.me/" target="_blank" rel="noreferrer">
          <button style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
            WhatsApp
          </button>
        </a>
      </div>
    </div>
  );
}

export default Comunidad;