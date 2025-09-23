import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  
  // Check if the request is from a search engine crawler
  const isSearchEngine = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkshare|w3c_validator|redditbot|applebot|whatsapp|flipboard|tumblr|bitlybot|skypeuripreview|nuzzel|discordbot|google page speed|qwantify|pinterestbot|bitlybot|skypeuripreview|nuzzel|discordbot|google page speed|qwantify|pinterestbot|bitlybot|skypeuripreview|nuzzel|discordbot|google page speed|qwantify/i.test(userAgent)
  
  // For search engines, serve static content without redirects
  if (isSearchEngine) {
    // Allow search engines to access all public pages
    if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
      // Block API and auth routes for crawlers
      return new NextResponse('Not Found', { status: 404 })
    }
    
    // Allow all other pages for search engines
    return NextResponse.next()
  }
  
  // For regular users, continue with normal behavior
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
