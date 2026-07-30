import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteConfig } from './siteConfig'

const defaultDescription =
  'AH Tecno selecciona y organiza productos tecnológicos publicados en Mercado Libre para que compares opciones sin perder horas buscando.'

const pageSeo = {
  '/': {
    title: 'AH Tecno | Tecnología útil y ofertas seleccionadas',
    description: defaultDescription,
  },
  '/productos': {
    title: 'Productos tecnológicos seleccionados | AH Tecno',
    description:
      'Explorá el catálogo de AH Tecno por categoría, precio y nivel de información antes de continuar tu compra en Mercado Libre.',
  },
  '/ultimos': {
    title: 'Últimos productos publicados | AH Tecno',
    description:
      'Encontrá rápidamente los productos que viste en las redes de AH Tecno, ordenados desde el ingreso más reciente.',
  },
  '/ofertas-semana': {
    title: 'Últimos productos publicados | AH Tecno',
    description:
      'Encontrá rápidamente los productos que viste en las redes de AH Tecno, ordenados desde el ingreso más reciente.',
  },
  '/categorias': {
    title: 'Categorías de tecnología | AH Tecno',
    description:
      'Navegá la selección de AH Tecno por periféricos, audio, energía, imagen, componentes y tecnología para el hogar.',
  },
  '/favoritos': {
    title: 'Tus productos favoritos | AH Tecno',
    description:
      'Revisá y compará los productos tecnológicos que guardaste en este dispositivo.',
  },
  '/comunidad': {
    title: 'Comunidad y redes | AH Tecno',
    description:
      'Seguinos en TikTok, Instagram y YouTube para descubrir análisis, comparativas y oportunidades tecnológicas.',
  },
  '/legal': {
    title: 'Información legal y privacidad | AH Tecno',
    description:
      'Consultá los términos de uso, la política de privacidad, afiliados y almacenamiento local de AH Tecno.',
  },
}

const setMeta = (selector, attribute, value) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    const [key, name] = attribute
    element.setAttribute(key, name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', value)
}

const setCanonical = (url) => {
  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', url)
}

function SeoManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    const normalizedPath =
      pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    const isProductPage = normalizedPath.startsWith('/producto/')
    const seo = isProductPage
      ? {
          title: 'Producto seleccionado | AH Tecno',
          description:
            'Consultá imágenes, características y datos disponibles de este producto seleccionado por AH Tecno.',
        }
      : pageSeo[normalizedPath] || {
          title: 'Página no encontrada | AH Tecno',
          description: defaultDescription,
        }
    const canonicalUrl = `${siteConfig.siteUrl}${normalizedPath === '/' ? '/' : normalizedPath}`

    document.title = seo.title
    setMeta('meta[name="description"]', ['name', 'description'], seo.description)
    setMeta('meta[property="og:title"]', ['property', 'og:title'], seo.title)
    setMeta(
      'meta[property="og:description"]',
      ['property', 'og:description'],
      seo.description,
    )
    setMeta('meta[property="og:url"]', ['property', 'og:url'], canonicalUrl)
    setMeta('meta[name="twitter:title"]', ['name', 'twitter:title'], seo.title)
    setMeta(
      'meta[name="twitter:description"]',
      ['name', 'twitter:description'],
      seo.description,
    )
    setCanonical(canonicalUrl)
  }, [pathname])

  return null
}

export default SeoManager
