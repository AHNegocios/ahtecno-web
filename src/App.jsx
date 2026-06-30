// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './Navbar'
import Inicio from './Inicio'
import Hardware from './Hardware' // 1. Importamos la página nueva

function App() {
  return (
    <div>
      <Navbar /> 

      <Routes>
        <Route path="/" element={<Inicio />} />
        {/* 2. Registramos la ruta en el GPS */}
        <Route path="/hardware" element={<Hardware />} /> 
      </Routes>
    </div>
  )
}

export default App