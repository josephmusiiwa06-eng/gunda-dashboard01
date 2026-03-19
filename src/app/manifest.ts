import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GUNDA — Athletic Intelligence',
    short_name: 'GUNDA',
    description: 'Zimbabwe Athletic Load Monitoring System',
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
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
