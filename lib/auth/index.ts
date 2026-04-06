import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { type Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/server/actions'
import { config } from './config'

import './types'

async function fetchUserRoleAndDemo(id: string) {
	return prisma.user.findUnique({
		where: { id },
		select: { role: true, isDemo: true },
	})
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	...config,
	session: {
		strategy: 'jwt',
	},
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		}),
		Credentials({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				return (await verifyPassword(credentials)) ?? null
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger }) {
			// On initial sign-in, populate from the user object
			if (user) {
				token.id = user.id
				// Fetch role and isDemo from DB (user object from authorize doesn't include these)
				const dbUser = await fetchUserRoleAndDemo(user.id as string)
				if (dbUser) {
					token.role = dbUser.role
					token.isDemo = dbUser.isDemo
				}
			}

			// On session update trigger, refresh from DB
			if (trigger === 'update' && token.id) {
				const dbUser = await fetchUserRoleAndDemo(token.id as string)
				if (dbUser) {
					token.role = dbUser.role
					token.isDemo = dbUser.isDemo
				}
			}

			return token
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string
				session.user.role = token.role as Session['user']['role']
				session.user.isDemo = token.isDemo as boolean
			}
			return session
		},
	},
})
