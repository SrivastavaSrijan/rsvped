import type { NextAuthConfig } from 'next-auth'
import { Routes } from '@/lib/config'

export const config = {
  pages: {
    signIn: Routes.SignIn,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthRoute = ([Routes.SignIn, Routes.SignUp] as string[]).includes(nextUrl.pathname)
      const isProtectedRoute = nextUrl.pathname.startsWith(Routes.Dashboard)

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL(Routes.Home, nextUrl))
        }
        return true
      }

      if (isProtectedRoute && !isLoggedIn) {
        const next = nextUrl.pathname + nextUrl.search
        const encodedNext = encodeURIComponent(next)
        return Response.redirect(new URL(`${Routes.SignIn}?next=${encodedNext}`, nextUrl))
      }

      return true
    },
  },
  providers: [], // IMPORTANT: No providers in the middleware config
} satisfies NextAuthConfig
