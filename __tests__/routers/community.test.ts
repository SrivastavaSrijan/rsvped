/**
 * Community router integration tests.
 *
 * Uses actual tRPC callers via vi.mock to avoid NextAuth/next-server deps.
 * DB-dependent tests skip gracefully when no database is available.
 */
import { TRPCError } from '@trpc/server'
import { beforeAll, describe, expect, it } from 'vitest'
import {
	createAuthenticatedCaller,
	createPublicCaller,
	requireDatabase,
} from './helpers'

let dbAvailable = false

beforeAll(async () => {
	dbAvailable = await requireDatabase()
})

describe('community.get (public procedures)', () => {
	it.skipIf(!dbAvailable)(
		'can fetch community core data by slug via tRPC',
		async () => {
			const caller = createPublicCaller()
			const { prisma } = await import('@/lib/prisma')
			const community = await prisma.community.findFirst({
				where: { isPublic: true },
				select: { slug: true },
			})
			if (!community) return // No data to test against

			const result = await caller.community.get.core({
				slug: community.slug,
			})
			expect(typeof result.id).toBe('string')
			expect(typeof result.name).toBe('string')
			expect(typeof result.slug).toBe('string')
			expect(result).toHaveProperty('description')
			expect(result).toHaveProperty('metadata')
		}
	)

	it.skipIf(!dbAvailable)(
		'can fetch community enhanced data by slug via tRPC',
		async () => {
			const caller = createPublicCaller()
			const { prisma } = await import('@/lib/prisma')
			const community = await prisma.community.findFirst({
				where: { isPublic: true },
				select: { slug: true },
			})
			if (!community) return

			const result = await caller.community.get.enhanced({
				slug: community.slug,
			})
			expect(typeof result.id).toBe('string')
			expect(typeof result.name).toBe('string')
			expect(result).toHaveProperty('membershipTiers')
			expect(result).toHaveProperty('metadata')
		}
	)

	it.skipIf(!dbAvailable)(
		'throws NOT_FOUND for non-existent community slug',
		async () => {
			const caller = createPublicCaller()
			await expect(
				caller.community.get.core({
					slug: 'non-existent-community-slug-xyz-999',
				})
			).rejects.toThrow(TRPCError)

			try {
				await caller.community.get.core({
					slug: 'non-existent-community-slug-xyz-999',
				})
			} catch (error) {
				expect(error).toBeInstanceOf(TRPCError)
				expect((error as TRPCError).code).toBe('NOT_FOUND')
			}
		}
	)
})

describe('community.list (protected procedures)', () => {
	it('throws UNAUTHORIZED when listing communities without auth', async () => {
		const caller = createPublicCaller()
		await expect(caller.community.list.core({})).rejects.toThrow(TRPCError)

		try {
			await caller.community.list.core({})
		} catch (error) {
			expect(error).toBeInstanceOf(TRPCError)
			expect((error as TRPCError).code).toBe('UNAUTHORIZED')
		}
	})

	it('throws UNAUTHORIZED when calling enhanceByIds without auth', async () => {
		const caller = createPublicCaller()
		await expect(
			caller.community.list.enhanceByIds({ ids: ['some-id'] })
		).rejects.toThrow(TRPCError)

		try {
			await caller.community.list.enhanceByIds({ ids: ['some-id'] })
		} catch (error) {
			expect(error).toBeInstanceOf(TRPCError)
			expect((error as TRPCError).code).toBe('UNAUTHORIZED')
		}
	})
})

describe('community.subscribe (protected procedure)', () => {
	it('throws UNAUTHORIZED when subscribing without auth', async () => {
		const caller = createPublicCaller()
		await expect(
			caller.community.subscribe({ communityId: 'some-id' })
		).rejects.toThrow(TRPCError)

		try {
			await caller.community.subscribe({ communityId: 'some-id' })
		} catch (error) {
			expect(error).toBeInstanceOf(TRPCError)
			expect((error as TRPCError).code).toBe('UNAUTHORIZED')
		}
	})
})
