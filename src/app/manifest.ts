import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GUNDA Coach',
    short_name: 'GUNDA Coach',
    description: 'GUNDA Coach Dashboard',
    start_url: '/',
    display: 'standalone',
    background_color: '#080c08',
    theme_color: '#d4a017',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}
