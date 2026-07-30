import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, getCategoryLabel, getProductCategory } from './catalogConfig'
import { getProductPublicationState } from './productVisibility'
import { supabase } from './supabaseClient'
import AdminAnalytics from './AdminAnalytics'
import AdminDecisionCenter from './AdminDecisionCenter'
import { doesPriceNeedReview } from './adminDecisionSupport'
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

function SyncFailureDetails({ failures = [] }) {
  if (!failures.length) return null

  return (
    <details className="admin-sync-failures">
      <summary>Ver por qué fallaron {failures.length} producto(s)</summary>
      <ul>
        {failures.map((failure, index) => (
          <li key={`${failure.productId || failure.mlId || 'sync'}-${index}`}>
            <strong>{failure.title || failure.mlId || 'Producto sin identificar'}</strong>
            <span>{failure.error}</span>
          </li>
        ))}
      </ul>
    </details>
  )
}

function ProductCatalogControls({ product, apiRequest, onSaved }) {
  const [category, setCategory] = useState(product.categoria || 'automatico')
  const [visible, setVisible] = useState(product.is_visible !== false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const publicationState = getProductPublicationState(product)
  const automaticallyHidden =
    publicationState.key === 'expired' ||
    publicationState.key === 'mercadolibre-inactive'

  const saveSettings = async () => {
    setSaving(true)
    setFeedback('')
    try {
      await apiRequest('/api/mercadolibre/product', {
        method: 'PATCH',
        body: JSON.stringify({
          product_id: product.id,
          category,
          is_visible: visible,
        }),
      })
      setFeedback('Guardado')
      await onSaved()
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-product-settings">
      <label>
        Categoría AH Tecno
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="automatico">
            Automática: {getCategoryLabel(getProductCategory(product))}
          </option>
          {categories.map((option) => (
            <option value={option.slug} key={option.slug}>{option.label}</option>
          ))}
        </select>
      </label>
      {automaticallyHidden ? (
        <p className="admin-visibility-control admin-visibility-control--locked">
          Oculto automáticamente
        </p>
      ) : (
        <label className="admin-visibility-control">
          <input
            type="checkbox"
            checked={visible}
            onChange={(event) => setVisible(event.target.checked)}
          />
          Mostrar en la web
        </label>
      )}
      <button className="button button--secondary" type="button" onClick={saveSettings} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
      {feedback && <small role="status">{feedback}</small>}
    </div>
  )
}

function AdminProductRow({ product, apiRequest, onSaved }) {
  const automatic = product.price_source === 'mercadolibre'
  const publicationState = getProductPublicationState(product)
  const priceNeedsReview = doesPriceNeedReview(product)

  return (
    <article
      className={`admin-price-item ${
        publicationState.key === 'expired'
          ? 'admin-price-item--expired'
          : ''
      }`}
    >
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
        <strong
          className={`admin-publication-state admin-publication-state--${publicationState.key}`}
        >
          {publicationState.label}
        </strong>
        {publicationState.key === 'expired' ? (
          <span>Sin revisión de precio</span>
        ) : priceNeedsReview ? (
          <strong className="admin-review-label">
            Revisar precio manual
          </strong>
        ) : (
          <span>Precio automático actualizado</span>
        )}
        <small>
          {product.last_synced_at
            ? `Actualizado: ${formatDate(product.last_synced_at)}`
            : 'Sin sincronización registrada'}
        </small>
        {publicationState.key === 'expired' && (
          <>
            <small className="admin-expired-reason">
              {publicationState.reason || product.sync_error}
            </small>
            <small>
              Detectado: {formatDate(product.unavailable_since)}
            </small>
          </>
        )}
        {!!product.consecutive_sync_failures &&
          publicationState.key !== 'expired' && (
            <small>
              {product.consecutive_sync_failures} intento(s) de sincronización
              fallido(s)
            </small>
          )}
        <div className="admin-product-events" aria-label="Actividad del producto">
          <span>{product.product_views || 0} vistas</span>
          <span>{product.outbound_clicks || 0} clics</span>
          <span>{product.shares || 0} compartidos</span>
        </div>
      </div>
      <ProductCatalogControls
        product={product}
        apiRequest={apiRequest}
        onSaved={onSaved}
      />
    </article>
  )
}

function AdminProductList({
  products,
  loading,
  error,
  emptyMessage,
  apiRequest,
  onSaved,
}) {
  if (loading) {
    return <p className="admin-muted">Cargando productos…</p>
  }
  if (error) {
    return <p className="admin-message admin-message--error">{error}</p>
  }
  if (!products.length) {
    return <p className="admin-muted">{emptyMessage}</p>
  }

  return (
    <div className="admin-price-list">
      {products.map((product) => (
        <AdminProductRow
          product={product}
          apiRequest={apiRequest}
          onSaved={onSaved}
          key={product.id}
        />
      ))}
    </div>
  )
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
  const [activeTab, setActiveTab] = useState('overview')
  const [status, setStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [mlId, setMlId] = useState('')
  const [affiliateUrl, setAffiliateUrl] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('automatico')
  const [manualPriceNeeded, setManualPriceNeeded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [savedProduct, setSavedProduct] = useState(null)
  const [priceOverview, setPriceOverview] = useState([])
  const [priceHistory, setPriceHistory] = useState([])
  const [decisionCenter, setDecisionCenter] = useState({
    campaigns_configured: false,
    price_history_configured: false,
  })
  const [analytics, setAnalytics] = useState({
    daily: [],
    product_daily: [],
    source_daily: [],
    sources: [],
  })
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
      setAnalytics(payload.analytics || {
        daily: [],
        product_daily: [],
        source_daily: [],
        sources: [],
      })
      setPriceHistory(payload.price_history || [])
      setDecisionCenter(payload.decision_center || {
        campaigns_configured: false,
        price_history_configured: false,
      })
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
        if (active) {
          setPriceOverview(payload.products || [])
          setAnalytics(payload.analytics || {
            daily: [],
            product_daily: [],
            source_daily: [],
            sources: [],
          })
          setPriceHistory(payload.price_history || [])
          setDecisionCenter(payload.decision_center || {
            campaigns_configured: false,
            price_history_configured: false,
          })
        }
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
          category: selectedCategory,
        }),
      })
      setSavedProduct(payload.product)
      await loadPriceOverview()
      setMlId('')
      setAffiliateUrl('')
      setManualPrice('')
      setSelectedCategory('automatico')
    } catch (error) {
      setFormError(error.message)
      setManualPriceNeeded(error.message.toLowerCase().includes('precio manual'))
    } finally {
      setSaving(false)
    }
  }

  const catalogSummary = priceOverview.reduce(
    (summary, product) => {
      const publicationState = getProductPublicationState(product)
      summary.total += 1
      summary.productViews += Number(product.product_views) || 0
      summary.outboundClicks += Number(product.outbound_clicks) || 0
      summary.shares += Number(product.shares) || 0
      if (publicationState.public) summary.published += 1
      if (publicationState.key === 'expired') summary.expired += 1
      if (!publicationState.public) summary.hidden += 1
      if (publicationState.public && doesPriceNeedReview(product)) {
        summary.needsReview += 1
      }
      return summary
    },
    {
      total: 0,
      published: 0,
      hidden: 0,
      expired: 0,
      needsReview: 0,
      productViews: 0,
      outboundClicks: 0,
      shares: 0,
    },
  )
  const expiredProducts = priceOverview.filter(
    (product) => getProductPublicationState(product).key === 'expired',
  )
  const currentProducts = priceOverview.filter(
    (product) => getProductPublicationState(product).key !== 'expired',
  )
  const adminTabs = [
    {
      id: 'overview',
      label: 'Vista general',
      count: currentProducts.length,
    },
    {
      id: 'expired',
      label: 'Vencidos',
      count: expiredProducts.length,
    },
    {
      id: 'analytics',
      label: 'Estadísticas',
      count: null,
    },
  ]

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

      <nav className="admin-tabs" role="tablist" aria-label="Secciones del panel">
        {adminTabs.map((tab) => (
          <button
            id={`admin-tab-${tab.id}`}
            className={activeTab === tab.id ? 'is-active' : ''}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`admin-panel-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count !== null && <strong>{tab.count}</strong>}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <AdminDecisionCenter
          products={priceOverview}
          priceHistory={priceHistory}
          apiRequest={apiRequest}
          onReload={loadPriceOverview}
          onOpenExpired={() => setActiveTab('expired')}
          onOpenAnalytics={() => setActiveTab('analytics')}
          configured={decisionCenter.campaigns_configured}
        />
      )}

      {activeTab === 'overview' && (
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
                    syncResult.failed || syncResult.needsReview || syncResult.expired
                      ? 'admin-message--warning'
                      : 'admin-message--success'
                  }`}
                >
                  Se revisaron {syncResult.total} productos: {syncResult.updated}{' '}
                  actualizados.
                  {syncResult.failed
                    ? ` ${syncResult.failed} no pudieron sincronizarse.`
                    : ''}
                  {syncResult.skipped
                    ? ` ${syncResult.skipped} enlaces antiguos quedaron pendientes de comprobación sin contarse como error.`
                    : ''}
                  {syncResult.needsReview
                    ? ` ${syncResult.needsReview} conservaron su precio anterior porque Mercado Libre no informó uno nuevo.`
                    : ''}
                  {syncResult.expired
                    ? ` ${syncResult.expired} vencidos se ocultaron del catálogo público.`
                    : ''}
                </p>
              )}
              <SyncFailureDetails failures={syncResult?.failures} />
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

            <label htmlFor="product-category">
              Categoría AH Tecno
              <select
                id="product-category"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                <option value="automatico">Elegir automáticamente</option>
                {categories.map((category) => (
                  <option value={category.slug} key={category.slug}>
                    {category.label}
                  </option>
                ))}
              </select>
              <small>
                Es la categoría visible en nuestra web. La categoría técnica de Mercado Libre se conserva aparte.
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
                <p className="admin-saved-category">
                  Categoría: {getCategoryLabel(getProductCategory(savedProduct))}
                </p>
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
              </div>
              <div className="admin-data-summary">
                <strong>Datos recibidos en esta importación</strong>
                <ul>
                  <li>
                    <span>Título</span>
                    <b>{savedProduct.titulo ? 'Recibido' : 'No entregado'}</b>
                  </li>
                  <li>
                    <span>Imágenes</span>
                    <b>
                      {savedProduct.imagenes?.length || savedProduct.imagen
                        ? `${savedProduct.imagenes?.length || 1} recibida(s)`
                        : 'No entregadas'}
                    </b>
                  </li>
                  <li>
                    <span>Descripción</span>
                    <b>{savedProduct.descripcion ? 'Recibida' : 'No entregada'}</b>
                  </li>
                  <li>
                    <span>Características</span>
                    <b>
                      {savedProduct.attributes?.length
                        ? `${savedProduct.attributes.length} recibida(s)`
                        : 'No entregadas'}
                    </b>
                  </li>
                  <li>
                    <span>Calificación</span>
                    <b>
                      {savedProduct.rating_average !== null &&
                      savedProduct.rating_average !== undefined
                        ? `${savedProduct.rating_average} / 5`
                        : 'No entregada por la API'}
                    </b>
                  </li>
                  <li>
                    <span>Opiniones</span>
                    <b>
                      {savedProduct.reviews_count
                        ? `${savedProduct.reviews_count} informada(s)`
                        : 'No entregadas por la API'}
                    </b>
                  </li>
                </ul>
              </div>
            </article>
          )}
        </section>
      </div>
      )}

      {activeTab === 'analytics' && (
        <section
          id="admin-panel-analytics"
          role="tabpanel"
          aria-labelledby="admin-tab-analytics"
        >
          <AdminAnalytics
            analytics={analytics}
            catalogSummary={catalogSummary}
            products={priceOverview}
            priceHistory={priceHistory}
            priceHistoryConfigured={decisionCenter.price_history_configured}
          />
        </section>
      )}

      {activeTab !== 'analytics' && (
        <section
          className={`admin-card admin-price-overview ${
            activeTab === 'expired' ? 'admin-expired-panel' : ''
          }`}
          id={`admin-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`admin-tab-${activeTab}`}
        >
          <div className="admin-card__header">
            <div>
              <p className="eyebrow">
                {activeTab === 'expired'
                  ? 'Historial interno'
                  : 'Control del catálogo'}
              </p>
              <h2 id="price-overview-title">
                {activeTab === 'expired'
                  ? 'Productos vencidos'
                  : 'Estado de precios'}
              </h2>
              {activeTab === 'expired' && (
                <p className="admin-expired-panel__description">
                  Se conservan para consulta y estadísticas, pero están ocultos para
                  todas las personas que visitan la web.
                </p>
              )}
            </div>
            {activeTab === 'expired' ? (
              <div className="admin-expired-panel__actions">
                <span>{expiredProducts.length} vencido(s)</span>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={syncing}
                  onClick={syncProducts}
                >
                  {syncing ? 'Revisando…' : 'Volver a revisar'}
                </button>
              </div>
            ) : (
              <div className="admin-price-legend" aria-label="Referencias">
                <span className="admin-price-source admin-price-source--automatic">
                  Automático
                </span>
                <span className="admin-price-source admin-price-source--manual">
                  Manual o pendiente
                </span>
              </div>
            )}
          </div>

          {activeTab === 'expired' && syncResult && (
            <p
              className={`admin-message ${
                syncResult.failed
                  ? 'admin-message--warning'
                  : 'admin-message--success'
              }`}
            >
              Revisión terminada: {syncResult.total} revisados,{' '}
              {syncResult.updated} actualizados, {syncResult.failed} con error
              {syncResult.skipped
                ? ` y ${syncResult.skipped} enlaces antiguos sin confirmar`
                : ''}
              . Quedan {expiredProducts.length} vencido(s) ocultos.
            </p>
          )}
          {activeTab === 'expired' && (
            <SyncFailureDetails failures={syncResult?.failures} />
          )}

          <AdminProductList
            products={
              activeTab === 'expired' ? expiredProducts : currentProducts
            }
            loading={priceOverviewLoading}
            error={priceOverviewError}
            emptyMessage={
              activeTab === 'expired'
                ? 'No hay productos vencidos. El catálogo está limpio.'
                : 'Todavía no hay productos para revisar.'
            }
            apiRequest={apiRequest}
            onSaved={loadPriceOverview}
          />
        </section>
      )}
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
