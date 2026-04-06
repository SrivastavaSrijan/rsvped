import { prisma } from '@/lib/prisma'
import { appRouter } from '@/server/api/root'
import type { Context } from '@/server/api/trpc'

/**
 * Check if the database is reachable. Skip tests if not.
 */
export async function requireDatabase() {
	try {
		await prisma.$queryRaw`SELECT 1`
		return true
	} catch {
		return false
	}
}

/**
 * Create a tRPC caller with no auth context (public procedures).
 */
export function createPublicCaller() {
	const ctx: Context = { session: null, prisma }
	return appRouter.createCaller(ctx)
}

/**
 * Create a tRPC caller with a fake authenticated session.
 */
export function createAuthenticatedCaller(userId: string) {
	const ctx: Context = {
		session: {
			user: {
				id: userId,
				name: 'Test User',
				email: 'test@example.com',
				role: 'USER',
				isDemo: false,
				username: 'test_user',
			},
			expires: new Date(Date.now() + 86400000).toISOString(),
		},
		prisma,
	}
	return appRouter.createCaller(ctx)
}

/**
 * Get the Prisma client for direct DB operations in tests.
 */
export function getPrisma() {
	return prisma
}
