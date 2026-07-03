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
      <div className={claseTarjeta} style={{ border: esPrimero ? '2px solid #00e5ff' : '1px solid #4d4d5e', position: 'relative' }}>
        
        {esPrimero && (
          <div className="etiqueta-neon">
            🔥 ÚLTIMO INGRESADO
          </div>
        )}

        <div className="contenedor-imagen">
          <img src={imagen} alt={titulo} />
        </div>
        
        <div className="info-producto">
          <h3>{titulo}</h3>
          <p className="precio">{formatearMoneda(precio)}</p>
          
          {/* ACÁ ESTÁN LOS BOTONES DOBLES */}
          <div className="botones-dobles">
            <a href={linkOferta} target="_blank" rel="noopener noreferrer" className="btn-oferta">
              OFERTA
            </a>
            <button onClick={() => setModalAbierto(true)} className="btn-info">
              + INFO
            </button>
          </div>
        </div>
      </div>

      {/* MODAL (Pop-up) */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="boton-cerrar-modal" onClick={() => setModalAbierto(false)}>✕</button>
            <div className="modal-imagen-container">
              <img src={imagen} alt={titulo} />
            </div>
            <h3>{titulo}</h3>
            <p className="precio-modal">{formatearMoneda(precio)}</p>
            <div className="modal-etiquetas">
              <span className="etiqueta-modal">✅ Verificado</span>
              <span className="etiqueta-modal">🚚 Envío Rápido</span>
            </div>
            <p className="texto-modal">Al hacer clic abajo, te redirigimos a la publicación oficial.</p>
            <a href={linkOferta} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn-modal-oficial">Ir a la publicación oficial ➜</button>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default Producto;