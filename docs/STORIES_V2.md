# STORIES V2 ARCHITECTURE

## OVERVIEW
The Stories V2 system implements an advanced 9:16 vertical story creator with rich overlays, drag & pinch-to-zoom capabilities, and real-time safe area validations.

## IMPLEMENTADO AHORA
- **JSONB Overlays**: `media_transform`, `overlays`, and `background` are stored natively in the `stories` table as validated JSONB.
- **Server Validation**: The server strictly checks payload lengths, types, boundaries, and prevents illegal insertions.
- **Story Creator**: Includes multi-touch pointer events for dragging and zooming the media, snap guides to the center, and undo/redo stacks.
- **Mentions**: Fully functional search against `profiles` with actual UUID matching and server-side notification trigger.
- **Backgrounds**: Supports neutral backgrounds or `blur` fallbacks when images are not 9:16.
- **Save from Story**: Viewers can save a recipe natively when viewing a story that has a `RECIPE` overlay.
- **Shared Renderer**: Guaranteed consistency between Editor, Preview, and Published viewers.
- **Drafts**: File object storage in IndexedDB (`idb-keyval` pattern natively) avoiding string bloat or UI blocks.
- **Analytics Isolation**: Drafts and Preview modes do NOT trigger `STORY_VIEW` or any other metric.
- **Recipe/Session to Story**: Direct conversion from Recipe UI -> Story Creator via the Share modal.

## PREPARADO PARA FUTURO
- **GIPHY**: Architecture is ready, just needs `NEXT_PUBLIC_GIPHY_API_KEY`.
- **Location Maps**: Fallback text implemented, prepared for Mapbox/Google Places API payload injection.
- **Video**: JSON schema is completely agnostic. `mediaUrl` can switch to rendering a `<video>` tag naturally.
- **DMs**: `entity_type: STORY` is structured to support sharing.

## BUCKET POLICIES (STORAGE AUDIT)
The `recipe_media` bucket is public. Anyone with the generated UUID URL can read the image. RLS on the `stories` table protects the *metadata* (who posted it, caption, view constraints) but the media URL itself is public.
If private profiles require total isolation, a new bucket with `storage.objects` RLS bound to profile logic must be implemented in the future.
