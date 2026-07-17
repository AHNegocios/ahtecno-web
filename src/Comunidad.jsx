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
    return <div className="social-card social-card--disabled" data-social={social.id} aria-disabled="true">{content}</div>
  }

  return (
    <a className="social-card" data-social={social.id} href={social.url} target="_blank" rel="noopener noreferrer">
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
        <p>Seguinos para descubrir nuevos productos, comparativas y los últimos enlaces que compartimos.</p>
      </header>

      <div className="community-grid">
        {siteConfig.socialLinks.map((social) => <SocialCard social={social} key={social.id} />)}
      </div>
    </main>
  )
}

export default Comunidad
