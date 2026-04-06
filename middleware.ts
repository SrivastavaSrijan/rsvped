import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { config as authConfig } from './lib/auth/config'

const { auth } = NextAuth(authConfig)

export default auth((request) => {
	const start = performance.now()

	// The `auth` middleware has already run at this point and decided whether to
	// allow the request or redirect. If we're here, the request is authorized.

	const requestHeaders = new Headers(request.headers)
	requestHeaders.set('x-pathname', request.nextUrl.pathname)

	const duration = performance.now() - start
	const isAuthenticated = !!request.auth?.user
	const pathname = request.nextUrl.pathname

	// Log timing for edge performance benchmarking (A4)
	// Only log in development to avoid noise in production
	if (process.env.NODE_ENV === 'development') {
		console.log(
			JSON.stringify({
				type: 'middleware_timing',
				pathname,
				duration_ms: Math.round(duration * 100) / 100,
				authenticated: isAuthenticated,
				timestamp: Date.now(),
			})
		)
	}

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
