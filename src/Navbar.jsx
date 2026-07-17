import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

const getInitialTheme = () => {
  const savedTheme = window.localStorage.getItem('ahtecno-theme')
  return savedTheme === 'claro' ? 'claro' : 'oscuro'
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.body.classList.remove('tema-claro', 'tema-oscuro')
    document.body.classList.add(`tema-${theme}`)
    window.localStorage.setItem('ahtecno-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!settingsOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSettingsOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [settingsOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand-link" to="/" onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true">
              <img src="/LogoAHTecno.png" alt="" />
            </span>
            <span>
              <strong>A&H</strong> TECNO
            </span>
          </Link>

          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Cerrar navegación' : 'Abrir navegación'}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
          </button>

          <nav
            id="main-navigation"
            className={`site-navigation ${menuOpen ? 'site-navigation--open' : ''}`}
            aria-label="Navegación principal"
          >
            <NavLink to="/" end onClick={closeMenu}>
              Inicio
            </NavLink>
            <NavLink className="latest-link" to="/ultimos" onClick={closeMenu}>
              Últimos subidos
            </NavLink>
            <NavLink to="/categorias" onClick={closeMenu}>
              Categorías
            </NavLink>
            <NavLink to="/productos" onClick={closeMenu}>
              Productos
            </NavLink>
            <NavLink to="/comunidad" onClick={closeMenu}>
              Comunidad
            </NavLink>
            <button
              className="settings-trigger"
              type="button"
              onClick={() => {
                setSettingsOpen(true)
                closeMenu()
              }}
            >
              <span aria-hidden="true">⚙</span>
              <span>Preferencias</span>
            </button>
          </nav>
        </div>
      </header>

      {settingsOpen && (
        <div className="settings-layer">
          <button
            className="settings-backdrop"
            type="button"
            aria-label="Cerrar preferencias"
            onClick={() => setSettingsOpen(false)}
          />

          <aside className="settings-drawer" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="settings-drawer__header">
              <div>
                <p className="eyebrow">Ajustes</p>
                <h2 id="settings-title">Preferencias</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Cerrar preferencias"
                onClick={() => setSettingsOpen(false)}
              >
                ✕
              </button>
            </div>

            <label className="settings-field" htmlFor="theme-select">
              <span>Tema visual</span>
              <select id="theme-select" value={theme} onChange={(event) => setTheme(event.target.value)}>
                <option value="oscuro">Modo oscuro</option>
                <option value="claro">Modo claro</option>
              </select>
            </label>

            <Link className="settings-legal-link" to="/legal" onClick={() => setSettingsOpen(false)}>
              Transparencia y privacidad
              <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </div>
      )}
    </>
  )
}

export default Navbar
