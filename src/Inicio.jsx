// src/Inicio.jsx
import { useState, useEffect } from 'react'
import Producto from './Producto'
import { supabase } from './supabaseClient'

function Inicio() {
  const [busqueda, setBusqueda] = useState("")
  const [panelAbierto, setPanelAbierto] = useState(true)
  const [vista, setVista] = useState("grilla")
  const [ofertas, setOfertas] = useState([])
  
  // Este es el estado que controla los filtros
  const [orden, setOrden] = useState('mas_nuevos')

  useEffect(() => {
    async function fetchProductos() {
      let query = supabase.from('Productos').select('*')

      // Matemática de los filtros
      if (orden === 'menor_precio') {
        query = query.order('precio', { ascending: true }) 
      } else if (orden === 'mayor_precio') {
        query = query.order('precio', { ascending: false }) 
      } else {
        query = query.order('created_at', { ascending: false }) 
      }

      const { data, error } = await query
      if (!error) setOfertas(data || [])
    }
    
    fetchProductos()
  }, [orden]) // El centinela reacciona cuando tocás un botón

  const productosFiltrados = ofertas.filter((productoEnTurno) => {
    if (!productoEnTurno.titulo) return false;
    return productoEnTurno.titulo.toLowerCase().includes(busqueda.toLowerCase())
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
              
              <h4 className="titulo-filtro">Ordenar Por</h4>
              
              <button 
                className={`boton-filtro ${orden === 'menor_precio' ? 'activo' : ''}`}
                onClick={() => setOrden('menor_precio')}
              >
                Menor Precio <span>⬇</span>
              </button>
              
              <button 
                className={`boton-filtro ${orden === 'mayor_precio' ? 'activo' : ''}`}
                onClick={() => setOrden('mayor_precio')}
              >
                Mayor Precio <span>⬆</span>
              </button>
              
              <button 
                className={`boton-filtro ${orden === 'mas_nuevos' ? 'activo' : ''}`}
                onClick={() => setOrden('mas_nuevos')}
              >
                Más Nuevos <span>✨</span>
              </button>

              <h4 className="titulo-filtro">Categorías</h4>
              <button className="boton-filtro">Periféricos</button>
              <button className="boton-filtro">Audio y Video</button>

            </div>
          </aside>
        )}

<main className="contenido-derecha" style={{ padding: '0 20px', width: '100%', boxSizing: 'border-box' }}>
  
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
                >
                  ⊞
                </button>
                <button
                  onClick={() => setVista('lista')}
                  style={{ padding: '8px 12px', width: 'auto', backgroundColor: vista === 'lista' ? '#00e5ff' : 'transparent', color: vista === 'lista' ? '#000' : '#00e5ff' }}
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
            {productosFiltrados.map((productoEnTurno) => (
              <Producto
                key={productoEnTurno.id}
                titulo={productoEnTurno.titulo}
                precio={productoEnTurno.precio}
                linkOferta={productoEnTurno.link}
                imagen={productoEnTurno.imagen}
                vista={vista}
                ml_id={productoEnTurno.ml_id}
              />
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}

export default Inicio