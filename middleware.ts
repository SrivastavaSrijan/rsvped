import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config/routes'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Define protected routes - add more as needed
  const protectedRoutes: string[] = []

  // Define auth routes
  const authRoutes: string[] = ['/login', '/register']

  const isAuthRoute = authRoutes.includes(nextUrl.pathname)
  const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route))

  // If user is on auth route and already logged in, redirect to home
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL(Routes.Home, nextUrl))
  }

  // If user is trying to access protected route and not logged in, redirect to login
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = nextUrl.pathname + nextUrl.search
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }

  return null
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webm$).*)',
  ],
}
