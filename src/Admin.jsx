import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Admin.css'

const formatPrice = (value, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const formatDate = (value) => {
  if (!value) return 'Sin vencimiento informado'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
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
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [savedProduct, setSavedProduct] = useState(null)

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

    try {
      const payload = await apiRequest('/api/mercadolibre/product', {
        method: 'POST',
        body: JSON.stringify({ ml_id: mlId, affiliate_url: affiliateUrl }),
      })
      setSavedProduct(payload.product)
      setMlId('')
      setAffiliateUrl('')
    } catch (error) {
      setFormError(error.message)
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
                    syncResult.failed
                      ? 'admin-message--warning'
                      : 'admin-message--success'
                  }`}
                >
                  {syncResult.updated} de {syncResult.total} productos actualizados.
                  {syncResult.failed
                    ? ` ${syncResult.failed} necesitan revisión.`
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
              ID de Mercado Libre
              <input
                id="product-ml-id"
                type="text"
                placeholder="MLA62407115"
                pattern="[Mm][Ll][Aa][0-9]+"
                value={mlId}
                onChange={(event) => setMlId(event.target.value)}
                required
              />
              <small>
                En una página de catálogo, usá el ID que aparece después de /p/.
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

            {formError && (
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
              </div>
            </article>
          )}
        </section>
      </div>
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
