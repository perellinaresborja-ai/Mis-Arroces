<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Línea Gráfica de Mis Arroces
- Todas las tarjetas, contenedores de feed, modales y barras de contenido deben tener bordes redondeados (`rounded-2xl` o `rounded-3xl`), fondo `bg-card` y un borde `border border-border`. Sin excepciones.
- No usar diseños de bloque a sangre (flush sin bordes ni redondeo) para los contenedores principales (por ejemplo, barra de historias, publicaciones).

## Funcionalidad y Flujo de Trabajo
- **Cero Adornos:** Cuando se implementa algo, se hace para que funcione de verdad. Todo botón, menú o interfaz visual debe tener su funcionalidad real conectada y funcionando por detrás (base de datos, páginas, API, etc.) desde el minuto uno. No dejar botones "de pega", "alertas", mockups o cosas a medias simulando que funcionan.
- **Git Push Automático:** Cuando se complete exitosamente la implementación de una característica (y compile sin errores), se debe realizar automáticamente un `git add .`, `git commit` y `git push` al repositorio. No hay que esperar a que el usuario pida actualizar el deployment, hay que hacerlo de forma proactiva.
