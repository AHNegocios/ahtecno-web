import { useEffect, useMemo, useState } from 'react'
import { categories, getCategoryLabel, getProductCategory, normalizeText } from './catalogConfig'
import { getProductPublicationState } from './productVisibility'

const COLUMN_STORAGE_KEY = 'ahtecno-admin-database-columns'
const DEFAULT_COLUMNS = {
  category: true,
  planned: true,
  published: true,
  content: false,
  notes: false,
}

const columnOptions = [
  { key: 'category', label: 'Categoría' },
  { key: 'planned', label: 'Fecha prevista' },
  { key: 'published', label: 'Fecha de publicación' },
  { key: 'content', label: 'Video o contenido' },
  { key: 'notes', label: 'Notas internas' },
]

const loadColumnPreferences = () => {
  if (typeof window === 'undefined') return DEFAULT_COLUMNS

  try {
    const stored = JSON.parse(window.localStorage.getItem(COLUMN_STORAGE_KEY) || '{}')
    return { ...DEFAULT_COLUMNS, ...stored }
  } catch {
    return DEFAULT_COLUMNS
  }
}

const toDateTimeLocal = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

const formatDateTime = (value, emptyLabel = '—') => {
  if (!value) return emptyLabel
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return emptyLabel
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

const getDatabaseState = (product) => {
  const publicState = getProductPublicationState(product)
  if (publicState.key === 'expired' || publicState.key === 'mercadolibre-inactive') {
    return { key: 'expired', label: 'Vencido', tone: 'expired' }
  }
  if (product.publication_status === 'draft' || publicState.key === 'draft') {
    return { key: 'draft', label: 'Borrador', tone: 'draft' }
  }
  if (product.publication_status === 'scheduled' && !publicState.public) {
    return { key: 'scheduled', label: 'Programado', tone: 'scheduled' }
  }
  return { key: 'published', label: 'Publicado', tone: 'published' }
}

function EditorialRow({ product, apiRequest, onReload, configured, visibleColumns }) {
  const [plannedAt, setPlannedAt] = useState(toDateTimeLocal(product.planned_publish_at))
  const [contentUrl, setContentUrl] = useState(product.content_url || '')
  const [notes, setNotes] = useState(product.editorial_notes || '')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const state = getDatabaseState(product)
  const hasChanges =
    plannedAt !== toDateTimeLocal(product.planned_publish_at) ||
    contentUrl !== (product.content_url || '') ||
    notes !== (product.editorial_notes || '')

  const submit = async (action) => {
    setSaving(true)
    setFeedback('')
    try {
      await apiRequest('/api/mercadolibre/product', {
        method: 'PATCH',
        body: JSON.stringify({
          product_id: product.id,
          action,
          planned_publish_at: plannedAt ? new Date(plannedAt).toISOString() : null,
          content_url: contentUrl,
          editorial_notes: notes,
        }),
      })
      setFeedback(
        action === 'publish'
          ? 'Publicado'
          : action === 'schedule'
            ? 'Programado'
            : action === 'draft'
              ? 'Guardado como borrador'
              : 'Cambios guardados',
      )
      await onReload()
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr>
      <td>
        <span className={`admin-editorial-state admin-editorial-state--${state.tone}`}>
          {state.label}
        </span>
      </td>
      <td>
        <div className="admin-database-product">
          {product.imagen ? <img src={product.imagen} alt="" /> : <span aria-hidden="true">📦</span>}
          <div>
            <strong>{product.titulo || 'Producto sin título'}</strong>
            <small>{product.ml_id || `Registro ${product.id}`}</small>
          </div>
        </div>
      </td>
      {visibleColumns.category && <td>
        <span className="admin-database-category">
          {getCategoryLabel(getProductCategory(product))}
        </span>
      </td>}
      {visibleColumns.planned && <td>
        <input
          aria-label={`Fecha prevista de ${product.titulo}`}
          type="datetime-local"
          value={plannedAt}
          onChange={(event) => setPlannedAt(event.target.value)}
          disabled={!configured || saving}
        />
      </td>}
      {visibleColumns.published && <td>
        <span className="admin-database-date">
          {formatDateTime(product.published_at, 'Todavía no publicado')}
        </span>
      </td>}
      {visibleColumns.content && <td>
        <input
          aria-label={`Enlace del contenido de ${product.titulo}`}
          type="url"
          placeholder="TikTok, Instagram o YouTube"
          value={contentUrl}
          onChange={(event) => setContentUrl(event.target.value)}
          disabled={!configured || saving}
        />
        {product.content_url && (
          <a href={product.content_url} target="_blank" rel="noreferrer">
            Abrir contenido ↗
          </a>
        )}
      </td>}
      {visibleColumns.notes && <td>
        <textarea
          aria-label={`Notas de ${product.titulo}`}
          rows="2"
          maxLength="1000"
          placeholder="Idea, plataforma, pendiente…"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={!configured || saving}
        />
      </td>}
      <td>
        <div className="admin-database-actions">
          {state.key !== 'expired' && state.key !== 'published' && (
            <button
              className="button button--primary"
              type="button"
              disabled={!configured || saving}
              onClick={() => submit('publish')}
            >
              Publicar ahora
            </button>
          )}
          {state.key !== 'expired' && state.key !== 'published' && plannedAt && (
            <button
              className="button button--secondary"
              type="button"
              disabled={!configured || saving || !plannedAt}
              onClick={() => submit('schedule')}
            >
              Programar
            </button>
          )}
          {hasChanges && (
            <button
              className="button button--secondary"
              type="button"
              disabled={!configured || saving}
              onClick={() => submit('save')}
            >
              Guardar cambios
            </button>
          )}
          {state.key !== 'expired' && state.key !== 'draft' && (
            <button
              className="button button--secondary"
              type="button"
              disabled={!configured || saving}
              onClick={() => submit('draft')}
            >
              {state.key === 'published' ? 'Pasar a borrador' : 'Cancelar programación'}
            </button>
          )}
          {feedback && <small role="status">{feedback}</small>}
        </div>
      </td>
    </tr>
  )
}

export default function AdminDatabase({
  products,
  loading,
  error,
  apiRequest,
  onReload,
  onCreateDraft,
  configured,
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sort, setSort] = useState('planned')
  const [visibleColumns, setVisibleColumns] = useState(loadColumnPreferences)

  useEffect(() => {
    window.localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(visibleColumns))
  }, [visibleColumns])

  const toggleColumn = (key) => {
    setVisibleColumns((current) => ({ ...current, [key]: !current[key] }))
  }

  const rows = useMemo(() => {
    const normalizedSearch = normalizeText(search)
    const filtered = products.filter((product) => {
      const state = getDatabaseState(product)
      const category = getProductCategory(product)
      const searchable = normalizeText(
        `${product.titulo || ''} ${product.ml_id || ''} ${product.editorial_notes || ''}`,
      )
      return (
        (!normalizedSearch || searchable.includes(normalizedSearch)) &&
        (statusFilter === 'all' || state.key === statusFilter) &&
        (categoryFilter === 'all' || category === categoryFilter)
      )
    })

    return [...filtered].sort((left, right) => {
      if (sort === 'title') {
        return String(left.titulo || '').localeCompare(String(right.titulo || ''), 'es')
      }
      if (sort === 'published') {
        return new Date(right.published_at || 0) - new Date(left.published_at || 0)
      }
      const leftDate = left.planned_publish_at
        ? new Date(left.planned_publish_at).getTime()
        : Number.MAX_SAFE_INTEGER
      const rightDate = right.planned_publish_at
        ? new Date(right.planned_publish_at).getTime()
        : Number.MAX_SAFE_INTEGER
      return leftDate - rightDate
    })
  }, [categoryFilter, products, search, sort, statusFilter])

  const totals = products.reduce(
    (summary, product) => {
      summary[getDatabaseState(product).key] += 1
      return summary
    },
    { draft: 0, scheduled: 0, published: 0, expired: 0 },
  )

  return (
    <section
      className="admin-card admin-database"
      id="admin-panel-database"
      role="tabpanel"
      aria-labelledby="admin-tab-database"
    >
      <div className="admin-database-heading">
        <div>
          <p className="eyebrow">Organización editorial</p>
          <h2>Base de datos de publicaciones</h2>
          <p>
            Prepará productos, coordiná el video y publicalos en la web cuando estén listos.
          </p>
        </div>
        <div className="admin-database-heading__actions">
          <button className="button button--primary" type="button" onClick={onCreateDraft}>
            + Preparar producto
          </button>
          <div className="admin-database-summary" aria-label="Resumen editorial">
            <span><strong>{totals.draft}</strong> borradores</span>
            <span><strong>{totals.scheduled}</strong> programados</span>
            <span><strong>{totals.published}</strong> publicados</span>
            <span><strong>{totals.expired}</strong> vencidos</span>
          </div>
        </div>
      </div>

      {!configured && (
        <p className="admin-message admin-message--warning">
          Ejecutá la migración <strong>202608020001_editorial_database.sql</strong> en
          Supabase para activar esta pestaña.
        </p>
      )}

      <div className="admin-database-filters">
        <label>
          Buscar
          <input
            type="search"
            placeholder="Producto, ID o nota"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          Publicado o borrador
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="draft">Borradores</option>
            <option value="scheduled">Programados</option>
            <option value="published">Publicados</option>
            <option value="expired">Vencidos</option>
          </select>
        </label>
        <label>
          Categoría
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option value={category.slug} key={category.slug}>{category.label}</option>
            ))}
          </select>
        </label>
        <label>
          Ordenar
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="planned">Próxima fecha prevista</option>
            <option value="published">Última publicación</option>
            <option value="title">Nombre del producto</option>
          </select>
        </label>
      </div>

      <details className="admin-database-settings">
        <summary>Configurar columnas</summary>
        <div>
          {columnOptions.map((option) => (
            <label key={option.key}>
              <input
                type="checkbox"
                checked={visibleColumns[option.key]}
                onChange={() => toggleColumn(option.key)}
              />
              {option.label}
            </label>
          ))}
        </div>
        <small>El estado, el producto y las acciones siempre permanecen visibles.</small>
      </details>

      <p className="admin-database-results">
        Mostrando {rows.length} de {products.length} productos.
      </p>

      {loading && <p className="admin-muted">Cargando la base de productos…</p>}
      {error && <p className="admin-message admin-message--error">{error}</p>}
      {!loading && !error && !rows.length && (
        <p className="admin-muted">No hay productos que coincidan con estos filtros.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="admin-database-table-wrap">
          <table className="admin-database-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Producto</th>
                {visibleColumns.category && <th>Categoría</th>}
                {visibleColumns.planned && <th>Fecha prevista</th>}
                {visibleColumns.published && <th>Fecha de publicación</th>}
                {visibleColumns.content && <th>Video o contenido</th>}
                {visibleColumns.notes && <th>Notas</th>}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => (
                <EditorialRow
                  product={product}
                  apiRequest={apiRequest}
                  onReload={onReload}
                  configured={configured}
                  visibleColumns={visibleColumns}
                  key={`${product.id}-${product.publication_status}-${product.planned_publish_at || ''}-${product.published_at || ''}`}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="admin-database-help">
        <strong>Publicar ahora</strong> muestra un borrador inmediatamente y registra la hora real.
        Los campos opcionales permanecen ocultos hasta que los actives en Configurar columnas.
      </p>
    </section>
  )
}
