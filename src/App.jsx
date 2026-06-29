import './App.css'
import Producto from './Producto'
// 1. Importamos nuestra base de datos simulada
import { inventarioOfertas } from './productos' 

function App() {
  return (
    <div>
      <h1>¡Hola A&H Tecno!</h1>
      <h2>Preparando las mejores ofertas del mercado...</h2>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        
        {/* 2. El comando .map() recorre la lista automáticamente */}
        {inventarioOfertas.map( (productoEnTurno) => (
          
          <Producto 
            key={productoEnTurno.id} // Obligatorio cuando creamos listas automáticas
            titulo={productoEnTurno.titulo} 
            precio={productoEnTurno.precio} 
            linkOferta={productoEnTurno.link} 
          />

        ))}

      </div>
    </div>
  )
}

export default App