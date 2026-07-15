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
- `src/Producto.jsx`: tarjeta y detalle de cada producto.
- `src/useProducts.js`: acceso centralizado al catálogo de Supabase.
- `src/catalogConfig.js`: categorías y clasificación temporal.
- `src/siteConfig.js`: datos públicos y enlaces sociales.

La clasificación por palabras clave es transitoria. Cuando se integre la API de Mercado Libre, cada producto deberá guardar una categoría normalizada en Supabase.
