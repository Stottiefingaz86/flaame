import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/arena',
          '/beats', 
          '/leaderboard',
          '/blog',
          '/store',
          '/contact',
          '/help',
          '/profile',
          '/battles'
        ],
        disallow: [
          '/api/',
          '/auth/',
          '/_next/',
          '/admin/',
          '/dashboard/',
          '/battle/', // Individual battle pages (dynamic)
          '/profile/', // Individual profile pages (dynamic)
          '/battles/' // Individual battle pages (dynamic)
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/arena',
          '/beats',
          '/leaderboard', 
          '/blog',
          '/store',
          '/contact',
          '/help'
        ],
        disallow: [
          '/api/',
          '/auth/',
          '/_next/',
          '/admin/',
          '/dashboard/',
          '/battle/',
          '/profile/',
          '/battles/'
        ],
      }
    ],
    sitemap: 'https://www.flaame.co/sitemap.xml',
    host: 'https://www.flaame.co',
  }
}
