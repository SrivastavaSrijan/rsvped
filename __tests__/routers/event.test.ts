/**
 * Event router integration tests.
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

describe('event.get (public procedures)', () => {
	it.skipIf(!dbAvailable)(
		'can fetch event metadata by slug via tRPC',
		async () => {
			const caller = createPublicCaller()
			// First get a real slug from the DB
			const { prisma } = await import('@/lib/prisma')
			const event = await prisma.event.findFirst({
				where: { isPublished: true, deletedAt: null },
				select: { slug: true },
			})
			if (!event) return // No data to test against

			const result = await caller.event.get.metadata({ slug: event.slug })
			expect(result).toHaveProperty('title')
			expect(result).toHaveProperty('startDate')
			expect(result).toHaveProperty('endDate')
		}
	)

	it.skipIf(!dbAvailable)(
		'can fetch event core data by slug via tRPC',
		async () => {
			const caller = createPublicCaller()
			const { prisma } = await import('@/lib/prisma')
			const event = await prisma.event.findFirst({
				where: { isPublished: true, deletedAt: null },
				select: { slug: true },
			})
			if (!event) return

			const result = await caller.event.get.core({ slug: event.slug })
			expect(typeof result.id).toBe('string')
			expect(typeof result.title).toBe('string')
			expect(typeof result.slug).toBe('string')
			expect(result.startDate).toBeInstanceOf(Date)
			expect(result.endDate).toBeInstanceOf(Date)
		}
	)

	it.skipIf(!dbAvailable)(
		'throws NOT_FOUND for non-existent event slug',
		async () => {
			const caller = createPublicCaller()
			await expect(
				caller.event.get.metadata({ slug: 'non-existent-slug-xyz-999' })
			).rejects.toThrow(TRPCError)

			try {
				await caller.event.get.metadata({ slug: 'non-existent-slug-xyz-999' })
			} catch (error) {
				expect(error).toBeInstanceOf(TRPCError)
				expect((error as TRPCError).code).toBe('NOT_FOUND')
			}
		}
	)
})

describe('event.get (protected procedures)', () => {
	it('throws UNAUTHORIZED when calling edit without auth', async () => {
		const caller = createPublicCaller()
		await expect(
			caller.event.get.edit({ slug: 'any-slug' })
		).rejects.toThrow(TRPCError)

		try {
			await caller.event.get.edit({ slug: 'any-slug' })
		} catch (error) {
			expect(error).toBeInstanceOf(TRPCError)
			expect((error as TRPCError).code).toBe('UNAUTHORIZED')
		}
	})

	it('throws UNAUTHORIZED when calling analytics without auth', async () => {
		const caller = createPublicCaller()
		await expect(
			caller.event.get.analytics({ slug: 'any-slug' })
		).rejects.toThrow(TRPCError)

		try {
			await caller.event.get.analytics({ slug: 'any-slug' })
		} catch (error) {
			expect(error).toBeInstanceOf(TRPCError)
			expect((error as TRPCError).code).toBe('UNAUTHORIZED')
		}
	})

	it('throws UNAUTHORIZED when calling register without auth', async () => {
		const caller = createPublicCaller()
		await expect(
			caller.event.get.register({ slug: 'any-slug' })
		).rejects.toThrow(TRPCError)

		try {
			await caller.event.get.register({ slug: 'any-slug' })
		} catch (error) {
			expect(error).toBeInstanceOf(TRPCError)
			expect((error as TRPCError).code).toBe('UNAUTHORIZED')
		}
	})
})

describe('event.create (protected procedures)', () => {
	it('throws UNAUTHORIZED when creating event without auth', async () => {
		const caller = createPublicCaller()
		await expect(
			caller.event.create({
				title: 'Test Event',
				startDate: new Date(),
				endDate: new Date(),
				timezone: 'America/New_York',
				locationType: 'PHYSICAL',
			})
		).rejects.toThrow(TRPCError)

		try {
			await caller.event.create({
				title: 'Test Event',
				startDate: new Date(),
				endDate: new Date(),
				timezone: 'America/New_York',
				locationType: 'PHYSICAL',
			})
		} catch (error) {
			expect(error).toBeInstanceOf(TRPCError)
			expect((error as TRPCError).code).toBe('UNAUTHORIZED')
		}
	})
})
