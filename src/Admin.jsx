import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Admin.css'

const formatPrice = (value, currency = 'ARS') => {
  const normalizedCurrency = String(currency || 'ARS').trim().toUpperCase()
  const safeCurrency = /^[A-Z]{3}$/.test(normalizedCurrency)
    ? normalizedCurrency
    : 'ARS'

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

const formatDate = (value) => {
  if (!value) return 'Sin vencimiento informado'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (loginError) {
      setError('No pudimos iniciar sesión. Revisá el correo y la contraseña.')
    }
    setSubmitting(false)
  }

  return (
    <main className="admin-page admin-page--login">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-lock" aria-hidden="true">🔐</div>
        <p className="eyebrow">Acceso privado</p>
        <h1 id="admin-login-title">Panel de AH Tecno</h1>
        <p>
          Este espacio permite conectar Mercado Libre y administrar productos.
          No está disponible para visitantes del catálogo.
        </p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-email">
            Correo autorizado
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label htmlFor="admin-password">
            Contraseña
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="admin-message admin-message--error">{error}</p>}

          <button className="button button--primary" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  )
}

function AdminDashboard({ session }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [status, setStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [mlId, setMlId] = useState('')
  const [affiliateUrl, setAffiliateUrl] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [manualPriceNeeded, setManualPriceNeeded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [savedProduct, setSavedProduct] = useState(null)
  const [priceOverview, setPriceOverview] = useState([])
  const [priceOverviewLoading, setPriceOverviewLoading] = useState(true)
  const [priceOverviewError, setPriceOverviewError] = useState('')

  const apiRequest = useCallback(
    async (path, options = {}) => {
      const response = await fetch(path, {
        ...options,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || 'No pudimos completar la operación.')
      }
      return payload
    },
    [session.access_token],
  )

  const loadStatus = useCallback(async () => {
    setStatusLoading(true)
    setStatusError('')
    try {
      setStatus(await apiRequest('/api/mercadolibre/status'))
    } catch (error) {
      setStatusError(error.message)
    } finally {
      setStatusLoading(false)
    }
  }, [apiRequest])

  const loadPriceOverview = useCallback(async () => {
    setPriceOverviewLoading(true)
    setPriceOverviewError('')
    try {
      const payload = await apiRequest('/api/mercadolibre/products')
      setPriceOverview(payload.products || [])
    } catch (error) {
      setPriceOverviewError(error.message)
    } finally {
      setPriceOverviewLoading(false)
    }
  }, [apiRequest])

  useEffect(() => {
    let active = true

    apiRequest('/api/mercadolibre/status')
      .then((payload) => {
        if (active) setStatus(payload)
      })
      .catch((error) => {
        if (active) setStatusError(error.message)
      })
      .finally(() => {
        if (active) setStatusLoading(false)
      })

    return () => {
      active = false
    }
  }, [apiRequest])

  useEffect(() => {
    let active = true

    apiRequest('/api/mercadolibre/products')
      .then((payload) => {
        if (active) setPriceOverview(payload.products || [])
      })
      .catch((error) => {
        if (active) setPriceOverviewError(error.message)
      })
      .finally(() => {
        if (active) setPriceOverviewLoading(false)
      })

    return () => {
      active = false
    }
  }, [apiRequest])

  useEffect(() => {
    if (searchParams.get('mercadolibre') !== 'connected') return
    const timer = window.setTimeout(() => {
      setSearchParams({}, { replace: true })
      loadStatus()
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [loadStatus, searchParams, setSearchParams])

  const connectMercadoLibre = async () => {
    setConnecting(true)
    setStatusError('')
    try {
      const payload = await apiRequest('/api/mercadolibre/connect', {
        method: 'POST',
      })
      window.location.assign(payload.authorizationUrl)
    } catch (error) {
      setStatusError(error.message)
      setConnecting(false)
    }
  }

  const syncProducts = async () => {
    setSyncing(true)
    setSyncResult(null)
    setStatusError('')
    try {
      const payload = await apiRequest('/api/mercadolibre/sync', {
        method: 'POST',
      })
      setSyncResult(payload)
      await loadPriceOverview()
    } catch (error) {
      setStatusError(error.message)
    } finally {
      setSyncing(false)
    }
  }

  const importProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    setSavedProduct(null)
    setManualPriceNeeded(false)

    try {
      const payload = await apiRequest('/api/mercadolibre/product', {
        method: 'POST',
        body: JSON.stringify({
          ml_reference: mlId,
          affiliate_url: affiliateUrl,
          manual_price: manualPrice,
        }),
      })
      setSavedProduct(payload.product)
      await loadPriceOverview()
      setMlId('')
      setAffiliateUrl('')
      setManualPrice('')
    } catch (error) {
      setFormError(error.message)
      setManualPriceNeeded(error.message.toLowerCase().includes('precio manual'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow">Administración privada</p>
          <h1>Centro de productos</h1>
          <p>Sesión iniciada como {session.user.email}</p>
        </div>
        <button
          className="button button--secondary"
          type="button"
          onClick={() => supabase.auth.signOut()}
        >
          Cerrar sesión
        </button>
      </header>

      {searchParams.get('mercadolibre') === 'connected' && (
        <p className="admin-message admin-message--success">
          Mercado Libre autorizó la conexión. Estamos verificando el estado.
        </p>
      )}

      <div className="admin-grid">
        <section className="admin-card" aria-labelledby="meli-status-title">
          <div className="admin-card__header">
            <div>
              <p className="eyebrow">Paso 1</p>
              <h2 id="meli-status-title">Conexión con Mercado Libre</h2>
            </div>
            <span
              className={`admin-status ${status?.connected ? 'admin-status--ready' : ''}`}
            >
              {status?.connected ? 'Conectado' : 'Pendiente'}
            </span>
          </div>

          {statusLoading && <p className="admin-muted">Comprobando conexión…</p>}
          {statusError && (
            <p className="admin-message admin-message--error">{statusError}</p>
          )}

          {!statusLoading && status && !status.configured && (
            <div className="admin-message admin-message--warning">
              <strong>Falta completar la configuración privada en Vercel.</strong>
              <span>{status.missing.join(', ')}</span>
            </div>
          )}

          {status?.connected ? (
            <div className="admin-sync-actions">
              <div className="admin-connection-detail">
                <span aria-hidden="true">✓</span>
                <div>
                  <strong>Credenciales guardadas y cifradas</strong>
                  <p>Vencimiento actual: {formatDate(status.expiresAt)}</p>
                </div>
              </div>

              <button
                className="button button--primary"
                type="button"
                disabled={syncing}
                onClick={syncProducts}
              >
                {syncing ? 'Actualizando productos…' : 'Actualizar todos ahora'}
              </button>

              {syncResult && (
                <p
                  className={`admin-message ${
                    syncResult.failed || syncResult.needsReview
                      ? 'admin-message--warning'
                      : 'admin-message--success'
                  }`}
                >
                  {syncResult.updated} de {syncResult.total} productos actualizados.
                  {syncResult.failed
                    ? ` ${syncResult.failed} necesitan revisión.`
                    : ''}
                  {syncResult.needsReview
                    ? ` ${syncResult.needsReview} conservaron su precio anterior porque Mercado Libre no informó uno nuevo.`
                    : ''}
                </p>
              )}
            </div>
          ) : (
            <button
              className="button button--primary"
              type="button"
              disabled={!status?.configured || connecting}
              onClick={connectMercadoLibre}
            >
              {connecting ? 'Abriendo Mercado Libre…' : 'Conectar Mercado Libre'}
            </button>
          )}
        </section>

        <section className="admin-card" aria-labelledby="import-product-title">
          <div className="admin-card__header">
            <div>
              <p className="eyebrow">Paso 2</p>
              <h2 id="import-product-title">Cargar o actualizar producto</h2>
            </div>
          </div>

          <form className="admin-form" onSubmit={importProduct}>
            <label htmlFor="product-ml-id">
              Enlace común o ID de Mercado Libre
              <input
                id="product-ml-id"
                type="text"
                placeholder="Pegá el enlace largo del producto"
                value={mlId}
                onChange={(event) => setMlId(event.target.value)}
                required
              />
              <small>
                Del enlace extraemos el producto de /p/ y la oferta indicada como wid.
              </small>
            </label>

            <label htmlFor="product-affiliate-url">
              Enlace de afiliado
              <input
                id="product-affiliate-url"
                type="url"
                placeholder="https://mercadolibre.com/sec/..."
                value={affiliateUrl}
                onChange={(event) => setAffiliateUrl(event.target.value)}
                required
              />
              <small>Este enlace se conserva y nunca se reemplaza por uno común.</small>
            </label>

            <label htmlFor="product-manual-price">
              Precio manual <span className="admin-optional">(solo si hace falta)</span>
              <input
                id="product-manual-price"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="Ejemplo: 48449"
                value={manualPrice}
                onChange={(event) => setManualPrice(event.target.value)}
                aria-describedby="product-manual-price-help"
                required={manualPriceNeeded}
              />
              <small id="product-manual-price-help">
                Dejalo vacío para intentar usar el precio automático. Si la API no
                lo entrega, escribí el importe sin puntos de miles.
              </small>
            </label>

            {manualPriceNeeded && (
              <p className="admin-message admin-message--warning">
                Mercado Libre entregó la ficha, pero no el precio. Completá el
                precio manual y volvé a presionar Importar producto.
              </p>
            )}

            {formError && !manualPriceNeeded && (
              <p className="admin-message admin-message--error">{formError}</p>
            )}

            <button
              className="button button--primary"
              type="submit"
              disabled={!status?.connected || saving}
            >
              {saving ? 'Consultando y guardando…' : 'Importar producto'}
            </button>
          </form>

          {savedProduct && (
            <article className="admin-product-result">
              {savedProduct.imagen && <img src={savedProduct.imagen} alt="" />}
              <div>
                <span>Producto guardado</span>
                <h3>{savedProduct.titulo}</h3>
                <p>{formatPrice(savedProduct.precio, savedProduct.currency_id)}</p>
                <strong
                  className={`admin-price-source ${
                    savedProduct.price_source === 'mercadolibre'
                      ? 'admin-price-source--automatic'
                      : 'admin-price-source--manual'
                  }`}
                >
                  {savedProduct.price_source === 'mercadolibre'
                    ? 'Precio automático de Mercado Libre'
                    : 'Precio manual · necesita revisión'}
                </strong>
                <div className="admin-data-summary">
                  <strong>Datos recibidos en esta importación</strong>
                  <ul>
                    <li>
                      <span>Título</span>
                      <b>{savedProduct.titulo ? 'Recibido' : 'No disponible'}</b>
                    </li>
                    <li>
                      <span>Imágenes</span>
                      <b>
                        {savedProduct.imagenes?.length || savedProduct.imagen
                          ? `${savedProduct.imagenes?.length || 1} recibida(s)`
                          : 'No disponibles'}
                      </b>
                    </li>
                    <li>
                      <span>Descripción</span>
                      <b>{savedProduct.descripcion ? 'Recibida' : 'No disponible'}</b>
                    </li>
                    <li>
                      <span>Características</span>
                      <b>
                        {savedProduct.attributes?.length
                          ? `${savedProduct.attributes.length} recibida(s)`
                          : 'No disponibles'}
                      </b>
                    </li>
                    <li>
                      <span>Calificación</span>
                      <b>
                        {savedProduct.rating_average !== null &&
                        savedProduct.rating_average !== undefined
                          ? `${savedProduct.rating_average} / 5`
                          : 'No disponible'}
                      </b>
                    </li>
                    <li>
                      <span>Opiniones</span>
                      <b>
                        {savedProduct.reviews_count
                          ? `${savedProduct.reviews_count} informada(s)`
                          : 'No disponibles'}
                      </b>
                    </li>
                  </ul>
                </div>
              </div>
            </article>
          )}
        </section>
      </div>

      <section className="admin-card admin-price-overview" aria-labelledby="price-overview-title">
        <div className="admin-card__header">
          <div>
            <p className="eyebrow">Control del catálogo</p>
            <h2 id="price-overview-title">Estado de precios</h2>
          </div>
          <div className="admin-price-legend" aria-label="Referencias">
            <span className="admin-price-source admin-price-source--automatic">
              Automático
            </span>
            <span className="admin-price-source admin-price-source--manual">
              Manual o pendiente
            </span>
          </div>
        </div>

        {priceOverviewLoading && (
          <p className="admin-muted">Cargando estado de precios…</p>
        )}
        {priceOverviewError && (
          <p className="admin-message admin-message--error">{priceOverviewError}</p>
        )}
        {!priceOverviewLoading && !priceOverviewError && !priceOverview.length && (
          <p className="admin-muted">Todavía no hay productos para revisar.</p>
        )}

        {!!priceOverview.length && (
          <div className="admin-price-list">
            {priceOverview.map((product) => {
              const automatic = product.price_source === 'mercadolibre'
              return (
                <article className="admin-price-item" key={product.id}>
                  <div className="admin-price-item__product">
                    {product.imagen ? <img src={product.imagen} alt="" /> : null}
                    <div>
                      <h3>{product.titulo}</h3>
                      <small>{product.ml_id || 'Sin referencia de Mercado Libre'}</small>
                    </div>
                  </div>
                  <div className="admin-price-item__value">
                    <strong>{formatPrice(product.precio, product.currency_id)}</strong>
                    <span
                      className={`admin-price-source ${
                        automatic
                          ? 'admin-price-source--automatic'
                          : 'admin-price-source--manual'
                      }`}
                    >
                      {automatic ? 'Automático' : 'Manual'}
                    </span>
                  </div>
                  <div className="admin-price-item__status">
                    {product.price_needs_review ? (
                      <strong className="admin-review-label">Revisar precio</strong>
                    ) : (
                      <span>Precio confirmado</span>
                    )}
                    <small>
                      {product.last_synced_at
                        ? `Actualizado: ${formatDate(product.last_synced_at)}`
                        : 'Sin sincronización registrada'}
                    </small>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

function Admin() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <main className="admin-page admin-page--loading">
        <p>Comprobando sesión segura…</p>
      </main>
    )
  }

  return session ? <AdminDashboard session={session} /> : <AdminLogin />
}

export default Admin
