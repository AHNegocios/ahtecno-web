// src/Inicio.jsx
import { useState, useEffect } from 'react'
import Producto from './Producto'
import { supabase } from './supabaseClient'

function Inicio() {
  const [busqueda, setBusqueda] = useState("")
// Si la pantalla es ancha (PC) arranca abierto, si es chica (Celu) arranca cerrado
  const [panelAbierto, setPanelAbierto] = useState(window.innerWidth > 768);
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
    <div style={{ backgroundColor: 'var(--fondo-pagina)', minHeight: '100vh', color: 'var(--texto-principal)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <h2 style={{ paddingTop: '40px', textAlign: 'center', margin: 0 }}>Catálogo de Productos</h2>

      <div className="layout-principal" style={{ padding: '20px', display: 'flex', gap: '20px' }}>

       {panelAbierto && (
          <div className="fondo-oscuro-filtros" onClick={() => setPanelAbierto(false)}></div>
        )}

        {panelAbierto && (
          <aside className="panel-lateral" style={{ backgroundColor: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-tarjeta)', borderRadius: '12px', padding: '20px', width: '250px', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: 'var(--texto-principal)' }}>FILTROS</h3>
              <button onClick={() => setPanelAbierto(false)} style={{ padding: '5px 10px', fontSize: '0.8rem', width: 'auto', backgroundColor: 'transparent', color: '#00e5ff', border: '1px solid #00e5ff', borderRadius: '4px', cursor: 'pointer' }}>
                Ocultar
              </button>
            </div>
            <hr className="separador" style={{ borderColor: 'var(--borde-tarjeta)', margin: '15px 0' }} />
            <div className="lista-filtros">
              
              <h4 className="titulo-filtro" style={{ color: 'var(--texto-secundario)', marginTop: '20px', marginBottom: '10px' }}>Ordenar Por</h4>
              
              <button 
                className={`boton-filtro ${orden === 'menor_precio' ? 'activo' : ''}`}
                onClick={() => setOrden('menor_precio')}
                style={{ backgroundColor: orden === 'menor_precio' ? '#00e5ff' : 'transparent', color: orden === 'menor_precio' ? '#000' : 'var(--texto-principal)', border: '1px solid var(--borde-tarjeta)', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', textAlign: 'left', transition: 'all 0.2s', cursor: 'pointer' }}
              >
                Menor Precio <span>⬇</span>
              </button>
              
              <button 
                className={`boton-filtro ${orden === 'mayor_precio' ? 'activo' : ''}`}
                onClick={() => setOrden('mayor_precio')}
                style={{ backgroundColor: orden === 'mayor_precio' ? '#00e5ff' : 'transparent', color: orden === 'mayor_precio' ? '#000' : 'var(--texto-principal)', border: '1px solid var(--borde-tarjeta)', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', textAlign: 'left', transition: 'all 0.2s', cursor: 'pointer' }}
              >
                Mayor Precio <span>⬆</span>
              </button>
              
              <button 
                className={`boton-filtro ${orden === 'mas_nuevos' ? 'activo' : ''}`}
                onClick={() => setOrden('mas_nuevos')}
                style={{ backgroundColor: orden === 'mas_nuevos' ? '#00e5ff' : 'transparent', color: orden === 'mas_nuevos' ? '#000' : 'var(--texto-principal)', border: '1px solid var(--borde-tarjeta)', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', textAlign: 'left', transition: 'all 0.2s', cursor: 'pointer' }}
              >
                Más Nuevos <span>✨</span>
              </button>

              <h4 className="titulo-filtro" style={{ color: 'var(--texto-secundario)', marginTop: '20px', marginBottom: '10px' }}>Categorías</h4>
              <button className="boton-filtro" style={{ backgroundColor: 'transparent', color: 'var(--texto-principal)', border: '1px solid var(--borde-tarjeta)', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>Periféricos</button>
              <button className="boton-filtro" style={{ backgroundColor: 'transparent', color: 'var(--texto-principal)', border: '1px solid var(--borde-tarjeta)', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>Audio y Video</button>

            </div>
          </aside>
        )}

        <main className="contenido-derecha" style={{ width: '100%', boxSizing: 'border-box' }}>
          
          <div className="contenedor-buscador" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'var(--fondo-tarjeta)', padding: '15px 20px', borderRadius: '12px', border: '1px solid var(--borde-tarjeta)', transition: 'all 0.3s ease' }}>

            {!panelAbierto ? (
              <button onClick={() => setPanelAbierto(true)} style={{ width: 'auto', padding: '10px 20px', backgroundColor: '#00e5ff', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Mostrar Filtros
              </button>
            ) : (
              <div style={{ width: '150px' }}></div>
            )}

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  onClick={() => setVista('grilla')}
                  style={{ padding: '8px 12px', width: 'auto', backgroundColor: vista === 'grilla' ? '#00e5ff' : 'transparent', color: vista === 'grilla' ? '#000' : '#00e5ff', border: '1px solid #00e5ff', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setVista('lista')}
                  style={{ padding: '8px 12px', width: 'auto', backgroundColor: vista === 'lista' ? '#00e5ff' : 'transparent', color: vista === 'lista' ? '#000' : '#00e5ff', border: '1px solid #00e5ff', borderRadius: '4px', cursor: 'pointer' }}
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
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--borde-tarjeta)', backgroundColor: 'var(--fondo-pagina)', color: 'var(--texto-principal)', outline: 'none' }}
              />
            </div>
          </div>

          <div 
            className={`grilla-productos ${vista}`}
            style={{
              display: 'grid',
              gridTemplateColumns: vista === 'lista' ? 'minmax(auto, 950px)' : 'repeat(auto-fit, minmax(240px, 250px))',
              gap: '25px',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'start',
              margin: '0 auto'
            }}
          >
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