import './App.css'
import Producto from './Producto'

function App() {
  return (
    <div>
      <h1>¡Hola A&H Tecno!</h1>
      <h2>Preparando las mejores ofertas del mercado...</h2>
      
      {/* Aca esta la magia de la escalabilidad. 3 tarjetas, 1 solo componente */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        
        <Producto 
          titulo="Auriculares Xiaomi Buds 5" 
          precio="$45.000" 
          linkOferta="https://www.mercadolibre.com.ar" 
        />
        
        <Producto 
          titulo="Teclado Táctil Samsung" 
          precio="$85.000" 
          linkOferta="https://www.mercadolibre.com.ar" 
        />
        
        <Producto 
          titulo="Mochila Viajera 60L" 
          precio="$120.000" 
          linkOferta="https://www.mercadolibre.com.ar" 
        />

      </div>
      
    </div>
  )
}

export default App