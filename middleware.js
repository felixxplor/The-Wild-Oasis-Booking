import { auth } from '@/app/_lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register'
  const isProtectedRoute =
    nextUrl.pathname.startsWith('/account') || nextUrl.pathname.startsWith('/appointments')

  // Redirect logged-in users away from login/register pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/appointments', nextUrl))
  }

  // Redirect non-logged-in users away from protected routes
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/login', '/register', '/account/:path*', '/appointments/:path*', '/booking-summary'],
}
