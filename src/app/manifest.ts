import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The best Laura · Gastos',
    short_name: 'Gastos',
    description: 'Control de gastos, suscripciones y pagos mensuales',
    start_url: '/',
    display: 'standalone',
    background_color: '#BAB5AD',
    theme_color: '#BAB5AD',
    lang: 'es',
    icons: [{ src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' }],
  };
}
