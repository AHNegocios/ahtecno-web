import { siteConfig } from './siteConfig'

function SocialCard({ social }) {
  const content = (
    <>
      <span className="social-card__icon" aria-hidden="true">{social.icon}</span>
      <div>
        <strong>{social.label}</strong>
        <p>{social.description}</p>
      </div>
      <span className="social-card__status">{social.url ? 'Visitar →' : 'Próximamente'}</span>
    </>
  )

  if (!social.url) {
    return <div className="social-card social-card--disabled" aria-disabled="true">{content}</div>
  }

  return (
    <a className="social-card" href={social.url} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  )
}

function Comunidad() {
  return (
    <main className="community-page">
      <header className="page-heading">
        <p className="eyebrow">Más allá del catálogo</p>
        <h1>Comunidad AH Tecno</h1>
        <p>Acá vas a encontrar nuestros canales oficiales cuando estén listos para recibirte.</p>
      </header>

      <div className="community-grid">
        {siteConfig.socialLinks.map((social) => <SocialCard social={social} key={social.id} />)}
      </div>
    </main>
  )
}

export default Comunidad
