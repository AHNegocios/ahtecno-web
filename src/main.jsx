import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Importamos el GPS (Enrutador)
import { BrowserRouter } from 'react-router-dom' 
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Envolvemos toda la aplicación en el GPS */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)