# AH Tecno

Catálogo web de ofertas tecnológicas seleccionadas y enlazadas a tiendas externas mediante enlaces de afiliados.

## Tecnologías

- React 19 y Vite.
- React Router.
- Supabase para el catálogo.
- Vercel para vistas previas, producción, Web Analytics y Speed Insights.

## Desarrollo local

```bash
npm install
npm run dev
```

Controles antes de subir cambios:

```bash
npm run lint
npm run build
```

## Configuración

Copiar `.env.example` como `.env.local` y completar las variables publicables de Supabase. No se deben guardar claves privadas, tokens de Mercado Libre ni claves `service_role` dentro del repositorio.

## Flujo de publicación

1. Crear una rama desde `main`.
2. Implementar y probar los cambios.
3. Subir la rama y revisar la vista previa de Vercel.
4. Abrir un pull request.
5. Fusionar con `main` únicamente después de la aprobación.

## Estructura principal

- `src/App.jsx`: rutas y estructura global.
- `src/Navbar.jsx`: navegación, menú móvil y preferencias.
- `src/Inicio.jsx`: catálogo, búsqueda, orden y filtros por categoría, precio
  e información disponible.
- `src/Producto.jsx`: tarjeta, galería y detalle reutilizable de cada producto.
- `src/ProductoDetalle.jsx`: ficha pública compartible con una URL estable.
- `src/Favoritos.jsx`: favoritos guardados sólo en el dispositivo, sin crear
  una cuenta.
- `src/ProductComparison.jsx`: comparación de precio, categoría y
  características de hasta tres favoritos.
- `src/RecentlyViewed.jsx`: acceso a las últimas fichas consultadas desde el
  catálogo.
- `src/useProducts.js`: acceso centralizado al catálogo de Supabase.
- `src/catalogConfig.js`: categorías y clasificación temporal.
- `src/siteConfig.js`: datos públicos y enlaces sociales.

## Integración con Mercado Libre

La integración se ejecuta en funciones privadas de Vercel ubicadas en
`api/mercadolibre`. El navegador nunca recibe el `client_secret`, la clave
privada de Supabase ni los tokens de Mercado Libre.

Flujo previsto:

1. Un administrador inicia sesión con Supabase Auth.
2. Autoriza la aplicación AH Tecno en el dominio oficial de Mercado Libre.
3. El callback intercambia el código temporal por tokens y los cifra antes de
   guardarlos en Supabase.
4. En las páginas de producto `/p/`, se pega el enlace común completo. El
   backend extrae el ID de catálogo y la oferta `wid`, consulta la ficha del
   producto y el precio de venta oficial, y normaliza título, precio, imagen,
   disponibilidad, descripción y opiniones disponibles. Los IDs de
   publicaciones tradicionales continúan siendo compatibles.
5. El enlace de afiliado se conserva en `Productos.link`; nunca se reemplaza
   automáticamente por el permalink común de Mercado Libre.
6. Si Mercado Libre no informa un precio, el administrador puede cargar un
   respaldo manual. Debe comprobarlo en la publicación y confirmarlo desde
   Admin; la confirmación registra fecha y administrador y vence a los siete
   días. Las siguientes sincronizaciones conservan ese valor hasta recibir uno
   oficial.
7. Vercel ejecuta una sincronización diaria de todos los productos con `ml_id`.
   El panel privado también permite solicitar una actualización inmediata.
8. El panel permite asignar una categoría editorial de AH Tecno y ocultar un
   producto manualmente. Las ofertas `paused`, `closed` o `inactive` dejan de
   mostrarse automáticamente después de una sincronización.
9. Si Mercado Libre confirma con un `404` o `410` que la publicación ya no
   existe, queda marcada como `not_found`: desaparece del catálogo público,
   pero se conserva en el panel como “Producto vencido” para no perder su
   historial.
10. Las fallas temporales de red o autenticación no ocultan productos. Se
    registran como intentos fallidos para revisión.
11. Las apariciones de tarjetas, vistas de detalle, favoritos agregados,
    compartidos y clics salientes se cuentan sin guardar IP, correo, cookies
    ni otros datos personales. Los totales y el embudo aparecen en el panel
    privado.
12. Las visitas generales y el rendimiento técnico se consultan en Web
    Analytics y Speed Insights dentro del proyecto de Vercel.

Antes de conectar una cuenta se debe ejecutar la migración incluida en
`supabase/migrations` y configurar en Vercel las variables privadas enumeradas
en `.env.example`. Los valores reales no se guardan en el repositorio ni se
comparten por chat.

Para esta versión también se debe ejecutar
`supabase/migrations/202607250001_product_analytics_and_expiration.sql` y
habilitar Analytics y Speed Insights desde el panel del proyecto en Vercel.

Para habilitar el historial privado de confirmaciones manuales se debe ejecutar
`supabase/migrations/202607300001_manual_price_reviews.sql`. La tabla de
auditoría no es accesible para visitantes ni usuarios autenticados comunes; las
confirmaciones se realizan desde la función privada de Admin.

Para habilitar el embudo de actividad y la procedencia general de las visitas se
debe ejecutar `supabase/migrations/202607300002_visitor_funnel.sql`. Sólo se
guarda el producto, la acción, la superficie, un canal general como TikTok o
Instagram y el momento; no se agregan identificadores personales.

Los favoritos públicos se guardan en `localStorage` con la clave
`ahtecno-favorites-v1`. Conservan sólo una referencia mínima del producto, no
se envían a Supabase ni Mercado Libre y desaparecen al borrar los datos del
navegador. Se puede registrar anónimamente el uso del botón de favoritos, pero
no el contenido privado de la lista.

Los productos vistos recientemente siguen el mismo criterio y se guardan con
la clave `ahtecno-recent-products-v1`, con un máximo de seis referencias. El
visitante puede borrar ese historial desde el catálogo.

La tarea automática usa `CRON_SECRET` y se ejecuta a las 09:00 UTC. En el plan
Hobby, Vercel puede iniciarla en cualquier momento dentro de esa hora.

`category_id` conserva la clasificación técnica original de Mercado Libre y
`categoria` guarda la clasificación editorial de AH Tecno. Si esta última se
deja en automático, la web usa las reglas de `src/catalogConfig.js`.

## Descubrimiento y enlaces compartidos

- `robots.txt` permite rastrear la parte pública y excluye Admin y las rutas de
  API.
- `/sitemap.xml` se genera con las páginas principales y todos los productos
  públicos activos.
- Cada ruta actualiza título, descripción y dirección canónica.
- Las fichas de producto agregan datos estructurados `Product` sin presentar a
  AH Tecno como vendedor.
- `public/og.png` es la tarjeta general que aparece al compartir la web.
