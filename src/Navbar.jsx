import { Link } from 'react-router-dom' // 1. Importamos el cable del GPS
import './Navbar.css'

function Navbar() {
  return (
    <nav className="cinta-navegacion">
      <div className="logo-cinta">A&H TECNO</div>
      
      <ul className="links-cinta">
        {/* 2. Reemplazamos los <li> sueltos por <Link> */}
        <li>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Inicio</Link>
        </li>
        <li>
          <Link to="/hardware" style={{ color: 'inherit', textDecoration: 'none' }}>Hardware</Link>
        </li>
        <li>
          <Link to="/contacto" style={{ color: 'inherit', textDecoration: 'none' }}>Contacto</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar