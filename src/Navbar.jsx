import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="cinta-navegacion">
      {/* 1. Agrupamos el logo y el texto en un Link al Inicio */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' }}>
       <img src="/LogoAHTecno.png" alt="Logo A&H" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'contain' }} />
        <div className="logo-cinta">A&H TECNO</div>
      </Link>
      
      <ul className="links-cinta">
        <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Inicio</Link></li>
        <li><Link to="/hardware" style={{ color: 'inherit', textDecoration: 'none' }}>Hardware</Link></li>
        <li><Link to="/contacto" style={{ color: 'inherit', textDecoration: 'none' }}>Contacto</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar