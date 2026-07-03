// src/Producto.jsx
import { useState } from 'react';
import './Producto.css';

function Producto({ titulo, precio, linkOferta, imagen, vista, esPrimero }) {
  const claseTarjeta = vista === 'lista' ? 'tarjeta modo-lista' : 'tarjeta';
  const [modalAbierto, setModalAbierto] = useState(false);

  const formatearMoneda = (monto) => {
    const numero = Number(monto);
    if (isNaN(numero) || numero === 0) return 'Consultar precio'; 
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(numero);
  };

  return (
    <>
      <div className={claseTarjeta} style={{ backgroundColor: 'var(--fondo-tarjeta)', border: esPrimero ? '2px solid #00e5ff' : '1px solid var(--borde-tarjeta)', position: 'relative', display: 'flex', flexDirection: vista === 'lista' ? 'row' : 'column', padding: '20px', borderRadius: '12px', justifyContent: 'space-between', width: vista === 'lista' ? '100%' : '240px', minHeight: vista === 'lista' ? 'auto' : '400px' }}>
        
        {esPrimero && (
          <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#00e5ff', color: '#000', padding: '5px 14px', borderRadius: '20px', fontWeight: '900', fontSize: '0.8rem', whiteSpace: 'nowrap', zIndex: 10 }}>
            🔥 ÚLTIMO INGRESADO
          </div>
        )}

{/* IMAGEN: GIGANTE EN MODO FILA (200px), NORMAL EN GRILLA (160px) */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '10px', height: vista === 'lista' ? '200px' : '160px', width: vista === 'lista' ? '200px' : '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
          <img src={imagen} alt={titulo} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
        </div>
        
        <div className="info-producto" style={{ flexGrow: 1, display: 'flex', flexDirection: vista === 'lista' ? 'row' : 'column', justifyContent: 'space-between', alignItems: vista === 'lista' ? 'center' : 'stretch', marginTop: vista === 'lista' ? '0' : '15px', width: '100%', paddingLeft: vista === 'lista' ? '20px' : '0' }}>
          <h3 style={{ color: 'var(--texto-principal)', fontSize: '1rem', margin: '0', textAlign: vista === 'lista' ? 'left' : 'center', flex: vista === 'lista' ? '2' : 'none' }}>{titulo}</h3>
          <p style={{ color: '#00e5ff', fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center', margin: vista === 'lista' ? '0 20px' : '10px 0 15px 0', flex: vista === 'lista' ? '1' : 'none' }}>{formatearMoneda(precio)}</p>
          
          <div className="botones-dobles" style={{ display: 'flex', gap: '8px', width: vista === 'lista' ? '220px' : '100%', flexShrink: 0, height: '40px' }}>
            <a href={linkOferta} target="_blank" rel="noopener noreferrer" style={{ flex: 2, textDecoration: 'none', height: '100%' }}>
              <button style={{ width: '100%', height: '100%', backgroundColor: '#00e5ff', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                OFERTA
              </button>
            </a>
            <button 
              onClick={() => setModalAbierto(true)} 
              style={{ flex: 1, height: '100%', backgroundColor: 'var(--fondo-pagina)', color: '#00e5ff', border: '1px solid #00e5ff', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.85rem' }}
            >
              + INFO
            </button>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }} onClick={() => setModalAbierto(false)}>
          <div style={{ backgroundColor: 'var(--fondo-tarjeta)', border: '2px solid #00e5ff', borderRadius: '12px', width: '90%', maxWidth: '450px', padding: '30px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '15px' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModalAbierto(false)} style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#00e5ff', color: '#000', border: 'none', width: '35px', height: '35px', borderRadius: '50%', fontWeight: '900', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✕</button>
            
            {/* CONTENEDOR ANCLADO PARA QUE NADA SE DESALINEE */}
            <div style={{ height: '160px', backgroundColor: '#fff', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src={imagen} alt={titulo} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            
            <h3 style={{ color: 'var(--texto-principal)', fontSize: '1.25rem', margin: '10px 0 0 0', lineHeight: '1.4' }}>{titulo}</h3>
            <p style={{ color: '#00e5ff', fontSize: '1.8rem', fontWeight: 'bold', margin: '0' }}>{formatearMoneda(precio)}</p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ background: 'var(--fondo-pagina)', color: 'var(--texto-secundario)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--borde-tarjeta)', fontSize: '0.85rem' }}>✅ Verificado</span>
            </div>

            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0' }}>Monitoreamos este producto constantemente para asegurar que la publicación oficial mantenga stock real.</p>

            <a href={linkOferta} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', marginTop: '5px' }}>
              <button style={{ backgroundColor: '#00e5ff', color: '#000', width: '100%', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }}>Ir a publicación oficial ➜</button>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default Producto;