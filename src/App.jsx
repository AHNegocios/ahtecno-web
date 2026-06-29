// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './Navbar'
import Inicio from './Inicio' // Importamos nuestro nuevo "Canal"

function App() {
  return (
    <div>
      {/* 1. La cinta fija que se ve en TODAS las páginas */}
      <Navbar /> 

      {/* 2. El sector dinámico donde cambian los "canales" */}
      <Routes>
        {/* Cuando la URL esté vacía ("/"), mostrá el componente Inicio */}
        <Route path="/" element={<Inicio />} />
        
        {/* Próximamente agregaremos: 
        <Route path="/upgrades" element={<Upgrades />} /> 
        */}
      </Routes>
    </div>
  )
}

export default App