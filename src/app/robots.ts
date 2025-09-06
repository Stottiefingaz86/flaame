import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/profile/',
        '/auth/',
        '/_next/',
        '/admin/',
        '/dashboard/',
      ],
    },
    sitemap: 'https://flaame.com/sitemap.xml',
  }
}
