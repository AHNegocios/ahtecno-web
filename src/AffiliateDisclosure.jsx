import { Link } from 'react-router-dom'

function AffiliateDisclosure({ compact = false }) {
  return (
    <aside
      className={`affiliate-disclosure ${compact ? 'affiliate-disclosure--compact' : ''}`}
      aria-label="Información sobre enlaces de afiliados"
    >
      <span className="affiliate-disclosure__icon" aria-hidden="true">
        $
      </span>
      <p>
        <strong>Transparencia:</strong> algunos enlaces son de afiliados. Si comprás desde ellos,
        podemos recibir una comisión sin costo adicional para vos.{' '}
        <Link to="/legal#afiliados">Cómo funciona</Link>
      </p>
    </aside>
  )
}

export default AffiliateDisclosure
