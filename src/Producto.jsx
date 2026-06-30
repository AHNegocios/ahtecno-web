// src/Producto.jsx
import './Producto.css'

function Producto({ titulo, precio, linkOferta, imagen, vista }) {
  // Si la vista es "lista", le agregamos una clase CSS extra llamada "modo-lista"
  const claseTarjeta = vista === 'lista' ? 'tarjeta modo-lista' : 'tarjeta'

  return (
    <div className={claseTarjeta}>
      <div className="contenedor-imagen">
        <img src={imagen} alt={titulo} />
      </div>
      
      <div className="info-producto">
        <h3>{titulo}</h3>
        <p className="precio">${precio}</p>
        <a href={linkOferta} target="_blank" rel="noopener noreferrer">
          <button>Ver Oferta</button>
        </a>
      </div>
    </div>
  )
}

export default Producto