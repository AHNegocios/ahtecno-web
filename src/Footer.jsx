import { Link } from 'react-router-dom'
import { siteConfig } from './siteConfig'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__content">
        <div className="site-footer__brand">
          <img src="/LogoAHTecno.png" alt="" aria-hidden="true" />
          <div>
            <strong>{siteConfig.shortName}</strong>
            <p>{siteConfig.tagline}</p>
          </div>
        </div>

        <nav className="site-footer__links" aria-label="Enlaces del pie de página">
          <Link to="/productos">Productos</Link>
          <Link to="/comunidad">Comunidad</Link>
          <Link to="/legal">Transparencia y privacidad</Link>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()} A&H Tecno.</p>
        <p>Las compras se realizan en sitios de terceros.</p>
      </div>
    </footer>
  )
}

export default Footer
