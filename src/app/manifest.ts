import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'misarroces',
    short_name: 'misarroces',
    description: 'La red social de los arroces. Descubre, guarda y comparte las mejores recetas de arroces y paellas.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F7F5F0',
    theme_color: '#F7F5F0',
    icons: [
      {
        src: '/icons/icon-192x192.webp?v=8',
        sizes: '192x192',
        type: 'image/webp',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.webp?v=8',
        sizes: '512x512',
        type: 'image/webp',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.webp?v=8',
        sizes: '512x512',
        type: 'image/webp',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192x192.png?v=8',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png?v=8',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.png?v=8',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
