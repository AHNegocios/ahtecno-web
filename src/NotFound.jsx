import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="content-page empty-page">
      <p className="eyebrow">Error 404</p>
      <h1>Esta página no existe</h1>
      <p>El enlace puede haber cambiado o la oferta ya no está disponible.</p>
      <Link className="button button--primary" to="/">
        Volver al inicio
      </Link>
    </main>
  )
}

export default NotFound
