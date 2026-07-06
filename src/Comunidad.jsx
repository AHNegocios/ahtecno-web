// src/Comunidad.jsx
import React from 'react';

function Comunidad() {
  return (
      <div style={{ padding: '60px 20px', minHeight: '100vh', backgroundColor: 'var(--fondo-pagina)', color: 'var(--texto-principal)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>      <h1 style={{ color: 'var(--color-primario)', textAlign: 'center', fontSize: '2.5rem', marginBottom: '20px' }}>
        Comunidad A&H
      </h1>
      <p style={{ color: 'var(--texto-secundario)', textAlign: 'center', maxWidth: '600px', margin: '0 auto', transition: 'color 0.3s ease' }}>
        Próximamente vas a poder interactuar con otros apasionados por el hardware, compartir tu setup y enterarte de sorteos exclusivos.
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