/**
 * Configuración de enlaces oficiales a las tiendas de aplicaciones de Mis Arroces.
 * 
 * Para activar los botones oficiales de las tiendas en /descargar:
 * - Asigna la variable de entorno NEXT_PUBLIC_URL_GOOGLE_PLAY o la URL directa en googlePlayUrl.
 * - Asigna la variable de entorno NEXT_PUBLIC_URL_APP_STORE o la URL directa en appStoreUrl.
 * 
 * Comportamiento:
 * - Cuando exista la URL de una tienda, se mostrará el botón oficial destacado como opción principal.
 * - Mientras no exista (o esté vacía ""), se mantiene de forma 100% transparente la instalación PWA actual.
 */
export const APP_STORE_CONFIG = {
  // Ej: "https://play.google.com/store/apps/details?id=es.misarroces.app"
  googlePlayUrl: process.env.NEXT_PUBLIC_URL_GOOGLE_PLAY || "",

  // Ej: "https://apps.apple.com/app/mis-arroces/id..."
  appStoreUrl: process.env.NEXT_PUBLIC_URL_APP_STORE || "",
}
