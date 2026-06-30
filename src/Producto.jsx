// src/Producto.jsx
import { useState, useEffect } from 'react';
import './Producto.css';

function Producto({ titulo, precio, linkOferta, imagen, vista, ml_id }) {
  const claseTarjeta = vista === 'lista' ? 'tarjeta modo-lista' : 'tarjeta';
  const [precioVivo, setPrecioVivo] = useState(null);

  // Radar para Mercado Libre
  useEffect(() => {
    if (ml_id) {
      fetch(`https://api.mercadolibre.com/items/${ml_id}`)
        .then(respuesta => respuesta.json())
        .then(datosMeli => {
          if (datosMeli.price) {
            setPrecioVivo(datosMeli.price);
          }
        })
        .catch(error => console.error("Error conectando con ML:", error));
    }
  }, [ml_id]);

  // Formateador automático a Pesos Argentinos
  const formatearMoneda = (monto) => {
    // Forzamos a que el dato sea un número puro antes de formatear
    const numeroPuro = Number(monto);
    
    if (isNaN(numeroPuro)) return '$ 0'; // Resguardo por si el dato viene roto

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(numeroPuro);
  };

  // Si ML encontró precio vivo, usa ese. Si no, usa el de Supabase.
  const precioFinal = precioVivo !== null ? precioVivo : precio;

  return (
    <div className={claseTarjeta}>
      <div className="contenedor-imagen">
        <img src={imagen} alt={titulo} />
      </div>
      
      <div className="info-producto">
        <h3>{titulo}</h3>
        {/* Dejamos que el formateador automático ponga el $ y los puntos solo */}
        <p className="precio">{formatearMoneda(precioFinal)}</p>
        <a href={linkOferta} target="_blank" rel="noopener noreferrer">
          <button>Ver Oferta</button>
        </a>
      </div>
    </div>
  );
}

export default Producto;