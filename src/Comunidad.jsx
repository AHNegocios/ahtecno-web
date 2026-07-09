// src/Comunidad.jsx
import React from 'react';

function Comunidad() {
  return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '30px auto' }}>
        {/* TIKTOK */}
        <a href="https://tiktok.com/@TuUsuarioTikTok" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#000000', border: '1px solid #333', padding: '15px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', transition: 'transform 0.2s', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <span style={{ fontSize: '2rem' }}>🎵</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#ffffff', fontWeight: '900', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sumate a TikTok</span>
              <span style={{ color: '#aaaaaa', fontSize: '0.85rem' }}>Reviews, unboxings y setups virales</span>
            </div>
          </div>
        </a>

        {/* INSTAGRAM */}
        <a href="https://instagram.com/TecnoOne_A&H" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', padding: '15px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', transition: 'transform 0.2s', cursor: 'pointer', boxShadow: '0 4px 15px rgba(220, 39, 67, 0.3)' }}>
            <span style={{ fontSize: '2rem' }}>📸</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#ffffff', fontWeight: '900', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Seguinos en Instagram</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>Sorteos, ofertas relámpago y el detrás de escena</span>
            </div>
          </div>
        </a>

        {/* YOUTUBE */}
        <a href="https://youtube.com/@TuCanalYouTube" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#FF0000', padding: '15px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', transition: 'transform 0.2s', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 0, 0, 0.2)' }}>
            <span style={{ fontSize: '2rem' }}>▶️</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#ffffff', fontWeight: '900', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Suscribite a YouTube</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>Análisis a fondo y guías de compra</span>
            </div>
          </div>
        </a>
      </div>
  );
}

export default Comunidad;