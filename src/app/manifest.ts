import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'misarroces',
    short_name: 'misarroces',
    description: 'La red social de los arroces. Descubre, guarda y comparte las mejores recetas de arroces y paellas.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/logopaellaicono.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logopaellaicono.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
