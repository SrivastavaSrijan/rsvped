import { NextResponse } from 'next/server'
import type { NextAuthConfig } from 'next-auth'
import { Routes } from '@/lib/config'

export const config = {
  pages: {
    signIn: Routes.SignIn,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthRoute = ([Routes.SignIn, Routes.SignUp] as string[]).some((route) =>
        nextUrl.pathname.startsWith(route)
      )
      const isProtectedRoute = [Routes.Dashboard].some((route) =>
        nextUrl.pathname.startsWith(route)
      )

      if (isAuthRoute) {
        if (isLoggedIn && !nextUrl.pathname.startsWith(Routes.HoldOn)) {
          // If the user is logged in and tries to access auth routes, redirect them to the home page
          return NextResponse.redirect(new URL(Routes.Home, nextUrl))
        }
        return true
      }

      if (isProtectedRoute && !isLoggedIn) {
        const next = nextUrl.pathname + nextUrl.search
        const encodedNext = encodeURIComponent(next)
        return NextResponse.redirect(new URL(`${Routes.SignIn}?next=${encodedNext}`, nextUrl))
      }

      return true
    },
  },
  providers: [], // IMPORTANT: No providers in the middleware config
} satisfies NextAuthConfig
