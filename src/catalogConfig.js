export const normalizeText = (value = '') =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export const categories = [
  {
    slug: 'perifericos',
    label: 'Periféricos',
    icon: '⌨️',
    description: 'Teclados, mouses, auriculares y accesorios para el escritorio.',
    keywords: ['teclado', 'mouse', 'webcam', 'joystick'],
  },
  {
    slug: 'componentes',
    label: 'Componentes',
    icon: '🧩',
    description: 'Procesadores, placas de video, memorias y componentes internos.',
    keywords: ['procesador', 'placa de video', 'motherboard', 'memoria ram', 'cooler'],
  },
  {
    slug: 'equipos',
    label: 'Equipos armados',
    icon: '🖥️',
    description: 'Computadoras y equipos preparados para trabajar, crear o jugar.',
    keywords: ['computadora', 'notebook', 'pc gamer', 'equipo armado', 'mini pc'],
  },
  {
    slug: 'energia',
    label: 'Energía',
    icon: '⚡',
    description: 'Power banks, cargadores, adaptadores, cables y protección eléctrica.',
    keywords: ['power bank', 'cargador', 'cable', 'bateria', 'estabilizador', 'ups'],
  },
  {
    slug: 'imagen-video',
    label: 'Imagen y video',
    icon: '📷',
    description: 'Monitores, proyectores, cámaras y accesorios para streaming.',
    keywords: ['proyector', 'monitor', 'camara', 'video', 'streaming'],
  },
  {
    slug: 'audio',
    label: 'Audio',
    icon: '🎧',
    description: 'Parlantes, barras de sonido, micrófonos y auriculares.',
    keywords: ['parlante', 'audio', 'sonido', 'microfono', 'auricular'],
  },
  {
    slug: 'almacenamiento',
    label: 'Almacenamiento',
    icon: '💾',
    description: 'Discos SSD, unidades externas, tarjetas y memorias.',
    keywords: ['ssd', 'disco', 'almacenamiento', 'pendrive', 'memoria'],
  },
  {
    slug: 'redes',
    label: 'Redes',
    icon: '📡',
    description: 'Routers, extensores, adaptadores y equipos de conectividad.',
    keywords: ['router', 'wifi', 'red', 'extensor', 'mesh'],
  },
  {
    slug: 'varios',
    label: 'Varios',
    icon: '✨',
    description: 'Gadgets y accesorios tecnológicos seleccionados.',
    keywords: [],
  },
]

export const getProductCategory = (product) => {
  const explicitCategory = normalizeText(product?.categoria || product?.etiqueta)

  if (explicitCategory) {
    const explicitMatch = categories.find(
      ({ slug, label }) =>
        normalizeText(slug) === explicitCategory || normalizeText(label) === explicitCategory,
    )

    if (explicitMatch) return explicitMatch.slug
  }

  const title = normalizeText(product?.titulo)
  const inferredCategory = categories.find(({ slug, keywords }) =>
    slug !== 'varios' && keywords.some((keyword) => title.includes(normalizeText(keyword))),
  )

  return inferredCategory?.slug || 'varios'
}

export const getCategoryLabel = (slug) =>
  categories.find((category) => category.slug === slug)?.label || 'Todas'
