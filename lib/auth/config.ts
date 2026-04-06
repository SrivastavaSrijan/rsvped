import { NextResponse } from 'next/server'
import type { NextAuthConfig } from 'next-auth'
import { RouteDefs, Routes } from '@/lib/config'
import { matchPathSegments } from '../utils'

export const config = {
	pages: {
		signIn: Routes.Auth.SignIn,
	},
	trustHost: true,
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user
			const { pathname, search } = nextUrl
			const isAuthRoute = (Object.values(Routes.Auth) as string[]).some(
				(route) => pathname.startsWith(route)
			)

			if (isAuthRoute) {
				// Profile routes require login — don't redirect logged-in users away
				const isProfileRoute = pathname.startsWith(Routes.Auth.Profile)
				if (
					isLoggedIn &&
					!isProfileRoute &&
					!pathname.startsWith(Routes.Utility.HoldOn)
				) {
					// If the user is logged in and tries to access auth routes (login/register), redirect them to the home page
					return NextResponse.redirect(new URL(Routes.Home, nextUrl))
				}
				// If not logged in and trying to access profile, redirect to login
				if (!isLoggedIn && isProfileRoute) {
					const next = pathname + search
					const encodedNext = encodeURIComponent(next)
					return NextResponse.redirect(
						new URL(`${Routes.Auth.SignIn}?next=${encodedNext}`, nextUrl)
					)
				}
				return true
			}

			const isPublicRoute = RouteDefs.Public.some((route) => {
				return matchPathSegments(pathname, route)
			})
			// A route is public if it's the event view page.

			if (isPublicRoute) {
				return true
			}

			// Any other route under /events is protected.
			const isProtectedRoute = RouteDefs.Protected.some((route) => {
				return matchPathSegments(pathname, route)
			})

			if (isProtectedRoute && !isLoggedIn) {
				const next = pathname + search
				const encodedNext = encodeURIComponent(next)
				return NextResponse.redirect(
					new URL(`${Routes.Auth.SignIn}?next=${encodedNext}`, nextUrl)
				)
			}

			return true
		},
	},
	providers: [], // IMPORTANT: No providers in the middleware config
} satisfies NextAuthConfig
