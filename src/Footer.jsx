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
          <Link to="/ultimos">Últimos subidos</Link>
          <Link to="/productos">Productos</Link>
          <Link to="/comunidad">Comunidad</Link>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__legal">
          <Link to="/legal#terminos">Términos</Link>
          <Link to="/legal#privacidad">Privacidad</Link>
          <Link to="/legal#afiliados">Afiliados</Link>
          <Link to="/legal#almacenamiento">Almacenamiento local</Link>
          <Link to="/legal#contacto">Contacto</Link>
        </div>
        <p>© {new Date().getFullYear()} A&H Tecno · Las compras se realizan en sitios de terceros.</p>
      </div>
    </footer>
  )
}

export default Footer
