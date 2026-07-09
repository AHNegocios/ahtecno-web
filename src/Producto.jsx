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
      <div 
        className={claseTarjeta} 
        style={{ 
          backgroundColor: 'var(--fondo-tarjeta)', color: 'var(--texto-principal)', 
          border: esPrimero ? '2px solid var(--color-primario)' : '1px solid var(--borde-tarjeta)', 
          position: 'relative', display: 'flex', 
          flexDirection: vista === 'lista' ? 'row' : 'column', 
          padding: '20px', borderRadius: '12px', justifyContent: 'space-between', 
          width: vista === 'lista' ? '100%' : '240px', 
          minHeight: vista === 'lista' ? 'auto' : '400px', 
          transition: 'all 0.3s ease', boxSizing: 'border-box'
        }}>        
        
        {esPrimero && (
          <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-primario)', color: '#000', padding: '5px 14px', borderRadius: '20px', fontWeight: '900', fontSize: '0.8rem', whiteSpace: 'nowrap', zIndex: 10 }}>
            🔥 ÚLTIMO INGRESADO
          </div>
        )}

        <div className="prod-imagen" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '10px', height: vista === 'lista' ? '200px' : '160px', width: vista === 'lista' ? '200px' : '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
          <img src={imagen} alt={titulo} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
        </div>
        
        <div className="prod-info" style={{ flexGrow: 1, display: 'flex', flexDirection: vista === 'lista' ? 'row' : 'column', justifyContent: 'space-between', alignItems: vista === 'lista' ? 'center' : 'stretch', marginTop: vista === 'lista' ? '0' : '15px', width: '100%', paddingLeft: vista === 'lista' ? '20px' : '0' }}>
          
          <div className="prod-textos" style={{ display: 'flex', flexDirection: vista === 'lista' ? 'row' : 'column', flex: vista === 'lista' ? '3' : 'none', alignItems: vista === 'lista' ? 'center' : 'stretch' }}>
            <h3 className="prod-titulo" style={{ color: 'var(--texto-principal)', fontSize: '1rem', margin: '0', textAlign: vista === 'lista' ? 'left' : 'center', flex: '2' }}>{titulo}</h3>
            <p className="prod-precio" style={{ color: 'var(--color-primario)', fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center', margin: vista === 'lista' ? '0 20px' : '10px 0 15px 0', flex: '1' }}>{formatearMoneda(precio)}</p>
          </div>
          
          <div className="prod-botones" style={{ display: 'flex', gap: '8px', width: vista === 'lista' ? '220px' : '100%', flexShrink: 0, height: '40px' }}>
            <a href={linkOferta} target="_blank" rel="noopener noreferrer" style={{ flex: 2, textDecoration: 'none', height: '100%' }}>
              <button style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-primario)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.85rem' }}>
                OFERTA
              </button>
            </a>
            <button onClick={() => setModalAbierto(true)} style={{ flex: 1, height: '100%', backgroundColor: 'var(--fondo-tarjeta)', color: 'var(--color-primario)', border: '1px solid var(--color-primario)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.85rem' }}>
              + INFO
            </button>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }} onClick={() => setModalAbierto(false)}>
          {/* Modal original intacto */}
        </div>
      )}
    </>
  );
}

export default Producto;