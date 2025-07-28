import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/booking',
  '/chat',
]

// Define admin routes that require admin authentication
const adminRoutes = [
  '/admin',
]

// Define routes that are only accessible when NOT authenticated
const authRoutes = [
  '/login',
  '/register',
]

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Handle admin routes
  if (adminRoutes.some(route => path.startsWith(route))) {
    // Allow admin login page
    if (path === '/admin/login') {
      return NextResponse.next()
    }
    
    // For other admin routes, redirect to admin login if not authenticated
    // The actual admin role check is handled client-side in the withAuth HOC
    return NextResponse.next()
  }
  
  // Allow all requests to pass through
  // Auth protection is handled by the enhanced auth provider
  
  return NextResponse.next()
}