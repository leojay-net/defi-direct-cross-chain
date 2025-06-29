import { NextRequest, NextResponse } from 'next/server';

// Custom middleware that combines Civic auth with browser wallet authentication
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('Middleware - Processing request:', pathname);

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt'
  ) {
    console.log('Middleware - Skipping static/API route');
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/crosschain') ||
    pathname.startsWith('/transaction') ||
    pathname.startsWith('/settings');

  if (!isProtectedRoute) {
    console.log('Middleware - Not a protected route, allowing');
    return NextResponse.next();
  }

  console.log('Middleware - Protected route detected, allowing client-side auth to handle');

  // For now, let all requests through and let client-side AuthGuard handle authentication
  return NextResponse.next();
}

export const config = {
  // include the paths you wish to secure here
  matcher: [
    /*
     * Match all request paths except:
     * - _next directory (Next.js static files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image files
     * - api routes (optional, depending on your needs)
     */
    '/((?!_next|favicon.ico|sitemap.xml|robots.txt|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.gif|api).*)',
  ],
};