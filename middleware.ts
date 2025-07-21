import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { config as authConfig } from './lib/auth/config'

const { auth } = NextAuth(authConfig)

export default auth((request) => {
  // The `auth` middleware has already run at this point and decided whether to
  // allow the request or redirect. If we're here, the request is authorized.

  // We can now add the custom header for our layouts to use.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
})

export const config = {
  // Match all paths except for static files and specific API routes.
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webm$).*)',
  ],
}
