import './Producto.css'

// 1. Agregamos "variables" (props o propiedades) entre llaves en la función
function Producto({ titulo, precio, linkOferta }) { 
  return (
    <div className="tarjeta">
      <img src="https://via.placeholder.com/150" alt="Producto" />
      
      {/* 2. Reemplazamos el texto fijo por las variables */}
      <h3>{titulo}</h3>
      <p className="precio">{precio}</p>
      
      {/* 3. El botón ahora usa el link que le pasemos */}
      <a href={linkOferta} target="_blank">
        <button>Ver Oferta</button>
      </a>
    </div>
  )
}

export default Producto