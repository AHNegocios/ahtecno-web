// src/Inicio.jsx
import { useState } from 'react' 
import Producto from './Producto'
import { inventarioOfertas } from './productos' 

function Inicio() {
  const [busqueda, setBusqueda] = useState("")

  const productosFiltrados = inventarioOfertas.filter((producto) => {
    return producto.titulo.toLowerCase().includes(busqueda.toLowerCase())
  })

  return (
    <div>
      <h2 style={{ marginTop: '40px', textAlign: 'center' }}>Preparando las mejores ofertas del mercado...</h2>
      
      <div className="layout-principal">
        
        {/* PANEL LATERAL */}
        <aside className="panel-lateral">
          <h3>Filtros</h3>
          <hr className="separador" />
          <p>🔧 Categorías (Próximamente)</p>
          <p>💰 Precio (Próximamente)</p>
          <p>🔥 Descuentos (Próximamente)</p>
        </aside>

        {/* COLUMNA DERECHA */}
        <main className="contenido-derecha">
          <div className="contenedor-buscador">
            <input 
              type="text" 
              placeholder="Buscar oferta..." 
              className="buscador"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {productosFiltrados.map( (productoEnTurno) => (
              <Producto 
                key={productoEnTurno.id} 
                titulo={productoEnTurno.titulo} 
                precio={productoEnTurno.precio} 
                linkOferta={productoEnTurno.link} 
                imagen={productoEnTurno.imagen}
              />
            ))}
          </div>
        </main>

      </div>
    </div>
  )
}

export default Inicio