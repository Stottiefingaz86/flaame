import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/_next/',
          '/admin/',
          '/dashboard/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/_next/',
          '/admin/',
          '/dashboard/',
        ],
      }
    ],
    sitemap: 'https://www.flaame.co/sitemap.xml',
    host: 'https://www.flaame.co',
  }
}
