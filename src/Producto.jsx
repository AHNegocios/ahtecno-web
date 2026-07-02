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
      {/* TARJETA DEL PRODUCTO */}
      <div className={claseTarjeta} style={{ border: esPrimero ? '2px solid #00e5ff' : '1px solid #4d4d5e', position: 'relative' }}>
        
        {/* ETIQUETA FLOTANTE DE MARKETING NEÓN (Solo si es el primero en la Bio) */}
        {esPrimero && (
          <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#00e5ff', color: '#000', padding: '5px 14px', borderRadius: '20px', fontWeight: '900', fontSize: '0.8rem', whiteSpace: 'nowrap', boxShadow: '0 0 12px rgba(0, 229, 255, 0.6)', zIndex: 2 }}>
            🔥 ÚLTIMO INGRESADO
          </div>
        )}

        <div className="contenedor-imagen">
          <img src={imagen} alt={titulo} />
        </div>
        
        <div className="info-producto">
          <h3>{titulo}</h3>
          <p className="precio">{formatearMoneda(precio)}</p>
          
          {/* DOBLE BOTÓN COMPACTO INTELIGENTE */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: 'auto' }}>
            {/* Botón 1: Redirección directa a Mercado Libre (Prioridad del negocio) */}
            <a href={linkOferta} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: 3 }}>
              <button style={{ width: '100%', padding: '10px', fontSize: '0.85rem', backgroundColor: '#00e5ff', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                OFERTA
              </button>
            </a>
            {/* Botón 2: Abre el modal de detalles de forma minimalista */}
            <button 
              onClick={() => setModalAbierto(true)} 
              style={{ flex: 1.2, padding: '10px', fontSize: '0.85rem', backgroundColor: '#1e1e24', color: '#00e5ff', border: '1px solid #00e5ff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + INFO
            </button>
          </div>
        </div>
      </div>

      {/* MODAL OPTIMIZADA CON ALTA VISIBILIDAD */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()} style={{ border: '2px solid #00e5ff' }}>
            
            {/* BOTÓN CERRAR TIPO CÁPSULA FLOTANTE VISIBLE */}
            <button 
              className="boton-cerrar-modal" 
              onClick={() => setModalAbierto(false)}
              style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#00e5ff', color: '#000', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', fontSize: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
            >
              ✕
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'center', height: '160px', backgroundColor: '#fff', borderRadius: '8px', padding: '12px' }}>
              <img src={imagen} alt={titulo} style={{ maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            
            <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: '10px 0 0 0', textAlign: 'left' }}>{titulo}</h3>
            <p style={{ color: '#00e5ff', fontSize: '1.9rem', fontWeight: 'bold', margin: '0' }}>{formatearMoneda(precio)}</p>
            
            <div className="modal-etiquetas">
              <span className="etiqueta-modal">✅ Verificado</span>
              <span className="etiqueta-modal">🚚 Envíos Rápidos</span>
              <span className="etiqueta-modal">🛡️ Compra Con Garantía</span>
            </div>

            <p style={{ color: '#aaaaaa', fontSize: '0.95rem', lineHeight: '1.6', margin: '10px 0' }}>
              Monitoreamos este producto de manera constante. Al hacer clic en el botón de abajo, te redirigiremos a una publicación con stock real y los más altos estándares de reputación.
            </p>

            <a href={linkOferta} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', marginTop: '10px' }}>
              <button style={{ backgroundColor: '#00e5ff', color: '#000', width: '100%', padding: '15px', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Ir a la publicación oficial ➜
              </button>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default Producto;