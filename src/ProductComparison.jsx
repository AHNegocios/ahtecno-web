import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getCategoryLabel,
  getProductCategory,
} from './catalogConfig'
import {
  formatProductCondition,
  normalizeProductAttributes,
} from './productDetails'
import { getProductPath } from './productUrls'
import './ProductComparison.css'

const MAX_COMPARISON_PRODUCTS = 3
const MAX_COMPARISON_ATTRIBUTES = 8

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

const buildAttributeRows = (products) => {
  const attributesByProduct = products.map((product) => {
    const entries = normalizeProductAttributes(product.attributes).map(
      (attribute) => [attribute.name, attribute.value],
    )
    return new Map(entries)
  })
  const attributeFrequency = new Map()

  attributesByProduct.forEach((attributes) => {
    attributes.forEach((_, name) => {
      attributeFrequency.set(name, (attributeFrequency.get(name) || 0) + 1)
    })
  })

  return [...attributeFrequency]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, MAX_COMPARISON_ATTRIBUTES)
    .map(([name]) => ({
      name,
      values: attributesByProduct.map(
        (attributes) => attributes.get(name) || 'No informado',
      ),
    }))
}

function ProductComparison({ products = [] }) {
  const [selectedIds, setSelectedIds] = useState([])
  const availableIds = new Set(products.map((product) => String(product.id)))
  const validSelectedIds = selectedIds.filter((id) => availableIds.has(id))
  const selectedProducts = validSelectedIds
    .map((id) => products.find((product) => String(product.id) === id))
    .filter(Boolean)
  const attributeRows = buildAttributeRows(selectedProducts)
  const minimumPrice = selectedProducts.length
    ? Math.min(
        ...selectedProducts
          .map((product) => Number(product.precio))
          .filter((price) => Number.isFinite(price) && price > 0),
      )
    : null

  if (products.length < 2) return null

  const toggleProduct = (productId) => {
    const id = String(productId)
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((selectedId) => selectedId !== id)
      }
      if (current.length >= MAX_COMPARISON_PRODUCTS) return current
      return [...current, id]
    })
  }

  return (
    <section className="product-comparison" aria-labelledby="comparison-title">
      <div className="product-comparison__heading">
        <div>
          <p className="eyebrow">Decidí con más claridad</p>
          <h2 id="comparison-title">Comparar favoritos</h2>
          <p>Elegí entre 2 y 3 productos para ver sus diferencias juntas.</p>
        </div>
        <span>{validSelectedIds.length}/{MAX_COMPARISON_PRODUCTS}</span>
      </div>

      <div className="product-comparison__picker">
        {products.map((product) => {
          const id = String(product.id)
          const selected = validSelectedIds.includes(id)
          const disabled =
            !selected && validSelectedIds.length >= MAX_COMPARISON_PRODUCTS

          return (
            <button
              className={selected ? 'is-selected' : ''}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => toggleProduct(id)}
              key={id}
            >
              <span className="product-comparison__picker-image">
                {product.imagen ? (
                  <img src={product.imagen} alt="" />
                ) : (
                  <span aria-hidden="true">◇</span>
                )}
              </span>
              <span>
                <strong>{product.titulo}</strong>
                <small>{selected ? 'Seleccionado' : 'Elegir'}</small>
              </span>
            </button>
          )
        })}
      </div>

      {selectedProducts.length === 1 && (
        <p className="product-comparison__hint" role="status">
          Elegí un producto más para iniciar la comparación.
        </p>
      )}

      {selectedProducts.length >= 2 && (
        <div className="product-comparison__table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Dato</th>
                {selectedProducts.map((product) => (
                  <th scope="col" key={product.id}>
                    <span className="product-comparison__product">
                      {product.imagen && <img src={product.imagen} alt="" />}
                      <strong>{product.titulo}</strong>
                      <Link to={getProductPath(product)}>Ver ficha →</Link>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Precio publicado</th>
                {selectedProducts.map((product) => {
                  const price = Number(product.precio)
                  const isMinimum =
                    Number.isFinite(minimumPrice) && price === minimumPrice
                  return (
                    <td key={product.id}>
                      <strong>{formatPrice(price, product.currency_id)}</strong>
                      {isMinimum && (
                        <small className="product-comparison__best">
                          Menor precio
                        </small>
                      )}
                    </td>
                  )
                })}
              </tr>
              <tr>
                <th scope="row">Categoría</th>
                {selectedProducts.map((product) => (
                  <td key={product.id}>
                    {getCategoryLabel(getProductCategory(product))}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Condición</th>
                {selectedProducts.map((product) => (
                  <td key={product.id}>
                    {formatProductCondition(product.condition) || 'No informada'}
                  </td>
                ))}
              </tr>
              {attributeRows.map((row) => (
                <tr key={row.name}>
                  <th scope="row">{row.name}</th>
                  {row.values.map((value, index) => (
                    <td key={`${selectedProducts[index].id}-${row.name}`}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="product-comparison__notice">
            Los datos ayudan a comparar. Precio, stock, envío y condiciones
            finales se confirman en Mercado Libre.
          </p>
        </div>
      )}
    </section>
  )
}

export default ProductComparison
