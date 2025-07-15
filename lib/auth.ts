import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'

export const authConfig = {
  providers: [
    // Add providers here later
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl: _nextUrl } }) {
      const isLoggedIn = !!auth?.user
      if (isLoggedIn) return true
      return false // Redirect unauthenticated users to login page
    },
  },
} satisfies NextAuthConfig

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)
