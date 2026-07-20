# AH Tecno

Catálogo web de ofertas tecnológicas seleccionadas y enlazadas a tiendas externas mediante enlaces de afiliados.

## Tecnologías

- React 19 y Vite.
- React Router.
- Supabase para el catálogo.
- Vercel para vistas previas y producción.

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
- `src/Inicio.jsx`: catálogo, búsqueda, orden y filtros.
- `src/Producto.jsx`: tarjeta, galería y detalle reutilizable de cada producto.
- `src/ProductoDetalle.jsx`: ficha pública compartible con una URL estable.
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
   respaldo manual. El producto queda marcado para revisión y las siguientes
   sincronizaciones conservan ese valor hasta recibir uno oficial.
7. Vercel ejecuta una sincronización diaria de todos los productos con `ml_id`.
   El panel privado también permite solicitar una actualización inmediata.
8. El panel permite asignar una categoría editorial de AH Tecno y ocultar un
   producto manualmente. Las ofertas `paused`, `closed` o `inactive` dejan de
   mostrarse automáticamente después de una sincronización.
9. Los clics salientes se cuentan sin guardar IP, correo, cookies ni otros
   datos personales. El total aparece en el panel privado.

Antes de conectar una cuenta se debe ejecutar la migración incluida en
`supabase/migrations` y configurar en Vercel las variables privadas enumeradas
en `.env.example`. Los valores reales no se guardan en el repositorio ni se
comparten por chat.

La tarea automática usa `CRON_SECRET` y se ejecuta a las 09:00 UTC. En el plan
Hobby, Vercel puede iniciarla en cualquier momento dentro de esa hora.

`category_id` conserva la clasificación técnica original de Mercado Libre y
`categoria` guarda la clasificación editorial de AH Tecno. Si esta última se
deja en automático, la web usa las reglas de `src/catalogConfig.js`.
