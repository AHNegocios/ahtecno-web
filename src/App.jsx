import { useState } from 'react' 
import './App.css'
import Producto from './Producto'
import { inventarioOfertas } from './productos' 
import Navbar from './Navbar' // 1. IMPORTAMOS LA CINTA

function App() {
  const [busqueda, setBusqueda] = useState("")

  const productosFiltrados = inventarioOfertas.filter((producto) => {
    return producto.titulo.toLowerCase().includes(busqueda.toLowerCase())
  })

  return (
    <div>
      <h1>¡Hola A&H Tecno!</h1>
      <h2>Preparando las mejores ofertas del mercado...</h2>
      
      {/* 1. ACÁ ARRANCA LA NUEVA INFRAESTRUCTURA */}
      <div className="layout-principal">
        
        {/* 2. LA COLUMNA IZQUIERDA (Panel Lateral) */}
        <aside className="panel-lateral">
          <h3>Filtros</h3>
          <hr className="separador" />
          <p>🔧 Categorías (Próximamente)</p>
          <p>💰 Precio (Próximamente)</p>
          <p>🔥 Descuentos (Próximamente)</p>
        </aside>

        {/* 3. LA COLUMNA DERECHA (Contenido Principal) */}
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

export default App