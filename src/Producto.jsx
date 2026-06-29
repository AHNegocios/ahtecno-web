import './Producto.css'

// 1. Agregamos "imagen" a la lista de variables que entran
function Producto({ titulo, precio, linkOferta, imagen }) { 
  return (
    <div className="tarjeta">
      
      {/* 2. Reemplazamos el texto fijo por la variable de la imagen */}
      <img src={imagen} alt={titulo} />
      
      <h3>{titulo}</h3>
      <p className="precio">{precio}</p>
      
      <a href={linkOferta} target="_blank">
        <button>Ver Oferta</button>
      </a>
    </div>
  )
}

export default Producto