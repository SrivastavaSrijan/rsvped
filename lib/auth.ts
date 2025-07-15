import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'

export const authConfig = {
  providers: [
    // Add providers here later
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/admin')
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/admin', nextUrl))
      }
      return true
    },
  },
} satisfies NextAuthConfig

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)
