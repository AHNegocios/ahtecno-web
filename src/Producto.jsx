// src/Producto.jsx
import { useState, useEffect } from 'react';
import './Producto.css';

function Producto({ titulo, precio, linkOferta, imagen, vista, ml_id }) {
  const claseTarjeta = vista === 'lista' ? 'tarjeta modo-lista' : 'tarjeta';
  const [precioVivo, setPrecioVivo] = useState(null);

  // Radar para Mercado Libre Directo
  useEffect(() => {
    if (ml_id) {
      fetch(`https://api.mercadolibre.com/items/${ml_id}`)
        .then(respuesta => {
          if (!respuesta.ok) throw new Error("ID no encontrado en ML");
          return respuesta.json();
        })
        .then(datosMeli => {
          if (datosMeli.price) {
            setPrecioVivo(datosMeli.price);
          }
        })
        .catch(error => console.warn("Aviso ML (Usando precio local):", error.message));
    }
  }, [ml_id]);

  // Formateador automático a Pesos Argentinos
  const formatearMoneda = (monto) => {
    const numeroPuro = Number(monto);
    if (isNaN(numeroPuro) || numeroPuro === 0) return 'Consultar precio'; 

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
        <p className="precio">{formatearMoneda(precioFinal)}</p>
        <a href={linkOferta} target="_blank" rel="noopener noreferrer">
          <button>Ver Oferta</button>
        </a>
      </div>
    </div>
  );
}

export default Producto;