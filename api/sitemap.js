import { createSupabaseAdmin } from './_lib/supabase-admin.js'

const SITE_URL = 'https://ahtecno-web.vercel.app'
const coreRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/ultimos', changefreq: 'daily', priority: '0.9' },
  { path: '/productos', changefreq: 'daily', priority: '0.9' },
  { path: '/categorias', changefreq: 'weekly', priority: '0.8' },
  { path: '/comunidad', changefreq: 'weekly', priority: '0.6' },
  { path: '/legal', changefreq: 'monthly', priority: '0.4' },
]

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const productPath = (product) => {
  const key = String(product.ml_id || product.id || '').trim()
  const slug = slugify(product.titulo)
  return `/producto/${encodeURIComponent(key)}${slug ? `/${slug}` : ''}`
}

const buildUrl = ({
  path,
  changefreq = 'weekly',
  priority = '0.7',
  lastmod,
}) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
${lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`

export async function GET() {
  let products = []

  try {
    const supabase = createSupabaseAdmin()
    const result = await supabase
      .from('Productos')
      .select('id, ml_id, titulo, last_synced_at')
      .eq('is_visible', true)
      .or('ml_status.is.null,ml_status.eq.active')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (!result.error) products = result.data || []
  } catch (error) {
    console.error('No se pudieron agregar productos al sitemap.', error)
  }

  const urls = [
    ...coreRoutes,
    ...products.map((product) => ({
      path: productPath(product),
      changefreq: 'daily',
      priority: '0.8',
      lastmod: product.last_synced_at
        ? new Date(product.last_synced_at).toISOString()
        : undefined,
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(buildUrl).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  })
}
