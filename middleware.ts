import { NextResponse, type NextRequest } from 'next/server'
import { createClientFromRequest } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClientFromRequest(request)

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Auth condition checks
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback'
  const isPublicPage = request.nextUrl.pathname === '/' || isAuthPage

  // Redirect logic
  if (!user && !isPublicPage) {
    // Redirect unauthenticated users to login
    const redirectUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && request.nextUrl.pathname === '/') {
    // Redirect authenticated users from home to dashboard
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && request.nextUrl.pathname === '/auth/login') {
    // Redirect authenticated users from login to dashboard
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Don't interfere with the OAuth callback process
  if (isAuthCallback) {
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}