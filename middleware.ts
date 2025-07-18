import NextAuth from 'next-auth'

import { config as authConfig } from './lib/auth/config'

// The `auth` middleware now uses the `authorized` callback from `auth.config.ts`
// to protect your routes, keeping this file clean and the bundle small.
export default NextAuth(authConfig).auth

export const config = {
  // Match all paths except for static files and specific API routes.
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webm$).*)',
  ],
}
