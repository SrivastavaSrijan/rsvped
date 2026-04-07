import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { config as authConfig } from './lib/auth/config'

const { auth } = NextAuth(authConfig)

export default auth((request) => {
	return NextResponse.next()
})

export const config = {
	matcher: [
		// Auth routes — redirect logged-in users away, or gate profile
		'/login',
		'/register',
		'/profile/:path*',
		// Protected routes — require authentication
		'/feed',
		'/events/create',
		'/events/:slug/edit',
		'/events/:slug/manage',
	],
}
