import { useState, useEffect } from 'react' 
import Producto from './Producto'

function Inicio() {
  const [busqueda, setBusqueda] = useState("")
  const [panelAbierto, setPanelAbierto] = useState(true)
  const [vista, setVista] = useState("grilla") // Memoria para saber cómo mostrar los productos
  
  const [ofertas, setOfertas] = useState([]) 

  useEffect(() => {
    import('./productos').then(modulo => {
      setOfertas(modulo.inventarioOfertas)
    })
  }, [])

  const productosFiltrados = ofertas.filter((producto) => {
    return producto.titulo.toLowerCase().includes(busqueda.toLowerCase())
  })

  return (
    <div>
      <h2 style={{ marginTop: '40px', textAlign: 'center' }}>Preparando las mejores ofertas del mercado...</h2>
      
      <div className="layout-principal">
        
        {panelAbierto && (
          <aside className="panel-lateral">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>FILTROS</h3>
              <button onClick={() => setPanelAbierto(false)} style={{ padding: '5px 10px', fontSize: '0.8rem', width: 'auto' }}>
                Ocultar
              </button>
            </div>
            <hr className="separador" />
            <div className="lista-filtros">
              <p>Categorías</p>
              <p>Precio</p>
              <p>Descuentos</p>
            </div>
          </aside>
        )}

        <main className="contenido-derecha">
          
          <div className="contenedor-buscador" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            
            {!panelAbierto ? (
              <button onClick={() => setPanelAbierto(true)} style={{ width: 'auto', padding: '10px 20px' }}>
                Mostrar Filtros
              </button>
            ) : (
              <div style={{ width: '150px' }}></div>
            )}

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              
              <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  onClick={() => setVista('grilla')} 
                  style={{ padding: '8px 12px', width: 'auto', backgroundColor: vista === 'grilla' ? '#00e5ff' : 'transparent', color: vista === 'grilla' ? '#000' : '#00e5ff' }}
                  title="Vista de Grilla"
                >
                  ⊞
                </button>
                <button 
                  onClick={() => setVista('lista')} 
                  style={{ padding: '8px 12px', width: 'auto', backgroundColor: vista === 'lista' ? '#00e5ff' : 'transparent', color: vista === 'lista' ? '#000' : '#00e5ff' }}
                  title="Vista de Lista"
                >
                  ☰
                </button>
              </div>

              <input 
                type="text" 
                placeholder="Buscar oferta..." 
                className="buscador"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)} 
              />
            </div>
          </div>

          <div className="grilla-productos">
            {productosFiltrados.map( (productoEnTurno) => (
              <Producto 
                key={productoEnTurno.id} 
                titulo={productoEnTurno.titulo} 
                precio={productoEnTurno.precio} 
                linkOferta={productoEnTurno.link} 
                imagen={productoEnTurno.imagen}
                vista={vista} /* <--- LE PASAMOS LA ORDEN AL PRODUCTO */
              />
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}

export default Inicio