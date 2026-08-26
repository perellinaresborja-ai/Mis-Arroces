# Stories V2 / Advanced Story Creator

El objetivo de esta implementación es evolucionar el sistema de Stories de Mis Arroces para permitir edición avanzada (Transformación de media, overlays como Textos, Ubicación, Menciones, Recetas, y GIFs) sin romper el diseño existente, respetando el sistema de base de datos actual, y asegurando compatibilidad total con dispositivos móviles (Mobile-First y futura app).

## User Review Required

> [!WARNING]
> **Base de Datos:** Se propone usar **JSONB** para `overlays`, `media_transform` y `background` dentro de la tabla `stories`. Esta decisión evitará tener que hacer cientos de consultas SQL extra y es mucho más óptima para lectura masiva en dispositivos móviles. ¿Apruebas este enfoque arquitectónico en vez de crear tablas separadas?

> [!IMPORTANT]
> **GIF Provider:** Se va a preparar la arquitectura para usar GIPHY. ¿Tienes ya una API Key de GIPHY Production/Dev, o preparo la interfaz para que se pueda añadir fácilmente mediante variables de entorno (`NEXT_PUBLIC_GIPHY_API_KEY`) sin romper la app si no está configurada?

## Open Questions

1. ¿Te parece bien que los borradores locales (Drafts) se guarden usando `localStorage` en el navegador del usuario para que, si recarga la página sin querer, no pierda su edición? 
2. Para el almacenamiento de las fotos originales que se suben a la Story, ¿seguimos usando el bucket público actual de `recipe_media` (donde se almacenaba la media actual) para no fragmentar el sistema, tal como sugerías?

## Proposed Changes

---

### Database Schema Updates
Se creará una nueva migración limpia `supabase/migrations/xxxx_stories_v2.sql` para no alterar el historial.

#### [NEW] `supabase/migrations/[TIMESTAMP]_stories_v2.sql`
- `ALTER TABLE stories ADD COLUMN media_transform JSONB DEFAULT NULL;`
- `ALTER TABLE stories ADD COLUMN overlays JSONB DEFAULT '[]'::jsonb;`
- `ALTER TABLE stories ADD COLUMN background JSONB DEFAULT NULL;`

---

### Backend Actions & Queries

#### [MODIFY] `src/app/actions/stories.ts`
- Actualizar `createStory` para aceptar `media_transform`, `overlays` y `background`.
- Procesar las notificaciones (`createNotification`) para los usuarios mencionados en la Story analizando los `overlays` de tipo `MENTION` solo en el momento de **Publicar** (NO en Preview).
- Mantener compatibilidad con los clics en recetas (`STORY_LINK_CLICK`).

---

### Frontend Components

#### [NEW] `src/components/domain/SharedStoryRenderer.tsx`
- Componente agnóstico encargado **exclusivamente** de pintar el Canvas `9:16`.
- Acepta props: `media`, `transform`, `background` y array de `overlays`.
- Se instanciará en tres modos: `EDITOR`, `PREVIEW` y `VIEWER`. Esto garantiza "What You See Is What You Publish".

#### [NEW] `src/components/domain/StoryCreator.tsx`
- Reemplazará el formulario básico actual.
- Control de estado para arrastrar (Drag) y hacer Pinch-to-Zoom (Touch/Mouse).
- Paneles inferiores para añadir: Texto, Mención, Receta, Ubicación, GIF.
- Control de Z-Index y Undo/Redo usando un historial de estado local (Pila).

#### [MODIFY] `src/components/domain/StoriesViewer.tsx`
- Refactorización visual para utilizar el nuevo `SharedStoryRenderer` en su interior.
- Actualización de los gestos de navegación (Tap izquierda/derecha, mantener presionado para pausar) para asegurar compatibilidad con la futura App (evitando eventos nativos exclusivos de web que fallen en WebViews).
- Degradación segura: si una receta fue eliminada, el overlay de la receta dirá "Receta no disponible".

#### [MODIFY] `src/app/create/story/page.tsx`
- Carga el `StoryCreator`.
- Comprueba si viene un parámetro `?recipe_id=` o `?session_id=` en la URL para precargar un overlay de receta automáticamente (Crear Story desde Receta/Sesión).

---

## Verification Plan

### Automated / Manual Verification
- **A. Composición:** Foto vertical -> Zoom -> Insertar Texto -> Preview -> Publicar -> Verificar en Viewer que es exacto.
- **B. Menciones:** Mencionarte a ti mismo -> Preview (no notifica) -> Publicar -> Verificar notificación y link al perfil.
- **C. Recetas:** Crear Story desde Receta -> Mover tarjeta -> Guardar borrador -> Recargar página -> Recuperar -> Publicar.
- **D. Analíticas:** Comprobar que visualizaciones (`STORY_VIEW`) solo se inyectan al ver una historia publicada ajena (y no en Preview).
