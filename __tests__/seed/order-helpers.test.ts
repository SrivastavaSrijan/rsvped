import { faker } from '@faker-js/faker'
import { OrderStatus } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import {
	type EventWithCategories,
	type UserWithCategories,
	determineOrderStatus,
	findInterestedUsers,
	selectIntelligentAttendees,
	selectTierForUser,
} from '@/prisma/seed/creators/order-helpers'

// --- Test Data Builders ---

function buildEvent(
	overrides: Partial<EventWithCategories> = {}
): EventWithCategories {
	return {
		id: faker.string.uuid(),
		title: faker.lorem.words(3),
		startDate: faker.date.future(),
		endDate: faker.date.future(),
		categories: [],
		...overrides,
	}
}

function buildUser(
	overrides: Partial<UserWithCategories> = {}
): UserWithCategories {
	return {
		id: faker.string.uuid(),
		name: faker.person.fullName(),
		email: faker.internet.email(),
		profession: 'Engineer',
		spendingPower: 'MEDIUM',
		networkingStyle: 'ACTIVE',
		categoryInterests: [],
		...overrides,
	}
}

const techCategory = { id: 'cat-tech', name: 'Technology' }
const musicCategory = { id: 'cat-music', name: 'Music' }
const artCategory = { id: 'cat-art', name: 'Art' }

// --- findInterestedUsers ---

describe('findInterestedUsers', () => {
	it('returns users with matching category interests', () => {
		const event = buildEvent({
			categories: [{ categoryId: techCategory.id, category: techCategory }],
		})
		const matchingUser = buildUser({
			categoryInterests: [
				{
					categoryId: techCategory.id,
					interestLevel: 8,
					category: techCategory,
				},
			],
		})
		const nonMatchingUser = buildUser({
			categoryInterests: [
				{
					categoryId: musicCategory.id,
					interestLevel: 8,
					category: musicCategory,
				},
			],
		})

		const results = findInterestedUsers(event, [matchingUser, nonMatchingUser])

		const matchedIds = results.map((r) => r.user.id)
		expect(matchedIds).toContain(matchingUser.id)
	})

	it('filters out users with very low probability (<0.1)', () => {
		const event = buildEvent({
			categories: [{ categoryId: techCategory.id, category: techCategory }],
		})
		const lowInterestUser = buildUser({
			networkingStyle: 'SELECTIVE',
			categoryInterests: [
				{
					categoryId: musicCategory.id,
					interestLevel: 1,
					category: musicCategory,
				},
			],
		})

		const results = findInterestedUsers(event, [lowInterestUser])
		expect(results).toHaveLength(0)
	})

	it('returns empty array when event has no categories', () => {
		const event = buildEvent({ categories: [] })
		const user = buildUser({
			categoryInterests: [
				{
					categoryId: techCategory.id,
					interestLevel: 10,
					category: techCategory,
				},
			],
		})

		const results = findInterestedUsers(event, [user])
		expect(results).toHaveLength(0)
	})

	it('returns empty array when user has no interests', () => {
		const event = buildEvent({
			categories: [{ categoryId: techCategory.id, category: techCategory }],
		})
		const user = buildUser({ categoryInterests: [] })

		const results = findInterestedUsers(event, [user])
		expect(results).toHaveLength(0)
	})

	it('ACTIVE networking style increases probability', () => {
		const event = buildEvent({
			categories: [{ categoryId: techCategory.id, category: techCategory }],
		})
		const activeUser = buildUser({
			networkingStyle: 'ACTIVE',
			categoryInterests: [
				{
					categoryId: techCategory.id,
					interestLevel: 5,
					category: techCategory,
				},
			],
		})
		const casualUser = buildUser({
			networkingStyle: 'CASUAL',
			categoryInterests: [
				{
					categoryId: techCategory.id,
					interestLevel: 5,
					category: techCategory,
				},
			],
		})

		const results = findInterestedUsers(event, [activeUser, casualUser])
		const activeProbability = results.find(
			(r) => r.user.id === activeUser.id
		)?.probability
		const casualProbability = results.find(
			(r) => r.user.id === casualUser.id
		)?.probability

		expect(activeProbability).toBeGreaterThan(casualProbability!)
	})

	it('caps probability at 1.0', () => {
		const event = buildEvent({
			categories: [
				{ categoryId: techCategory.id, category: techCategory },
				{ categoryId: musicCategory.id, category: musicCategory },
				{ categoryId: artCategory.id, category: artCategory },
			],
		})
		const superUser = buildUser({
			networkingStyle: 'ACTIVE',
			categoryInterests: [
				{
					categoryId: techCategory.id,
					interestLevel: 10,
					category: techCategory,
				},
				{
					categoryId: musicCategory.id,
					interestLevel: 10,
					category: musicCategory,
				},
				{
					categoryId: artCategory.id,
					interestLevel: 10,
					category: artCategory,
				},
			],
		})

		const results = findInterestedUsers(event, [superUser])
		expect(results[0].probability).toBeLessThanOrEqual(1.0)
	})
})

// --- selectTierForUser ---

describe('selectTierForUser', () => {
	const tiers = [
		{ id: 'free', name: 'Free', priceCents: 0 },
		{ id: 'standard', name: 'Standard', priceCents: 2500 },
		{ id: 'vip', name: 'VIP', priceCents: 10000 },
	]

	it('HIGH spending users get top tiers', () => {
		const highUser = buildUser({ spendingPower: 'HIGH' })

		// Run multiple times to account for randomness
		const selectedTiers = new Set<string>()
		for (let i = 0; i < 50; i++) {
			const tier = selectTierForUser(highUser, [...tiers], faker)
			if (tier) selectedTiers.add(tier.id)
		}

		// HIGH users should never get the free tier when premium tiers exist
		expect(selectedTiers).not.toContain('free')
	})

	it('LOW spending users get cheapest tier', () => {
		const lowUser = buildUser({ spendingPower: 'LOW' })

		const selectedTiers = new Set<string>()
		for (let i = 0; i < 50; i++) {
			const tier = selectTierForUser(lowUser, [...tiers], faker)
			if (tier) selectedTiers.add(tier.id)
		}

		// LOW users should only get the free tier
		expect(selectedTiers).toEqual(new Set(['free']))
	})

	it('returns null when no tiers available', () => {
		const user = buildUser({ spendingPower: 'HIGH' })
		const result = selectTierForUser(user, [], faker)
		expect(result).toBeNull()
	})

	it('falls back to available tiers for single-tier events', () => {
		const user = buildUser({ spendingPower: 'HIGH' })
		const singleTier = [{ id: 'only', name: 'Only Option', priceCents: 0 }]

		const result = selectTierForUser(user, singleTier, faker)
		expect(result?.id).toBe('only')
	})
})

// --- selectIntelligentAttendees ---

describe('selectIntelligentAttendees', () => {
	it('selects up to target attendance count', () => {
		const users = Array.from({ length: 20 }, (_, i) => ({
			user: buildUser(),
			probability: 0.8 - i * 0.03,
			categoryScore: 0.5,
			maxInterestLevel: 7,
			matchReason: 'category' as const,
		}))

		const selected = selectIntelligentAttendees(users, 10)
		expect(selected.length).toBeLessThanOrEqual(10)
	})

	it('returns empty array when no users provided', () => {
		const selected = selectIntelligentAttendees([], 10)
		expect(selected).toHaveLength(0)
	})

	it('prioritizes high-probability users', () => {
		const highProbUser = {
			user: buildUser({ id: 'high-prob' }),
			probability: 0.95,
			categoryScore: 0.9,
			maxInterestLevel: 9,
			matchReason: 'category' as const,
		}
		const lowProbUser = {
			user: buildUser({ id: 'low-prob' }),
			probability: 0.15,
			categoryScore: 0.1,
			maxInterestLevel: 2,
			matchReason: 'category' as const,
		}

		// Run many times — high prob user should appear more often
		let highCount = 0
		let lowCount = 0
		for (let i = 0; i < 100; i++) {
			const selected = selectIntelligentAttendees(
				[highProbUser, lowProbUser],
				1
			)
			for (const s of selected) {
				if (s.user.id === 'high-prob') highCount++
				if (s.user.id === 'low-prob') lowCount++
			}
		}

		expect(highCount).toBeGreaterThan(lowCount)
	})

	it('returns empty array when targetAttendance is 0', () => {
		const users = Array.from({ length: 5 }, () => ({
			user: buildUser(),
			probability: 0.9,
			categoryScore: 0.8,
			maxInterestLevel: 9,
			matchReason: 'category' as const,
		}))

		const selected = selectIntelligentAttendees(users, 0)
		expect(selected).toHaveLength(0)
	})

	it('handles targetAttendance larger than user pool', () => {
		const users = Array.from({ length: 3 }, () => ({
			user: buildUser(),
			probability: 0.95,
			categoryScore: 0.9,
			maxInterestLevel: 9,
			matchReason: 'category' as const,
		}))

		const selected = selectIntelligentAttendees(users, 100)
		// Cannot select more users than exist in the pool
		expect(selected.length).toBeLessThanOrEqual(3)
		expect(selected.length).toBeGreaterThan(0)
	})
})

// --- determineOrderStatus ---

describe('determineOrderStatus', () => {
	it('always returns PAID for free events (priceCents === 0)', () => {
		const user = buildUser({ spendingPower: 'LOW' })

		for (let i = 0; i < 100; i++) {
			const status = determineOrderStatus(user, 0, faker)
			expect(status).toBe(OrderStatus.PAID)
		}
	})

	it('always returns PAID for free events regardless of spending power', () => {
		for (const spendingPower of ['HIGH', 'MEDIUM', 'LOW', null]) {
			const user = buildUser({ spendingPower })

			for (let i = 0; i < 50; i++) {
				const status = determineOrderStatus(user, 0, faker)
				expect(status).toBe(OrderStatus.PAID)
			}
		}
	})

	it('HIGH spending users have ~95% success rate on paid events', () => {
		const user = buildUser({ spendingPower: 'HIGH' })
		const iterations = 300
		let paidCount = 0

		for (let i = 0; i < iterations; i++) {
			const status = determineOrderStatus(user, 2500, faker)
			if (status === OrderStatus.PAID) paidCount++
		}

		const successRate = paidCount / iterations
		expect(successRate).toBeGreaterThanOrEqual(0.85)
		expect(successRate).toBeLessThanOrEqual(1.0)
	})

	it('LOW spending users have ~75% success rate on paid events', () => {
		const user = buildUser({ spendingPower: 'LOW' })
		const iterations = 300
		let paidCount = 0

		for (let i = 0; i < iterations; i++) {
			const status = determineOrderStatus(user, 2500, faker)
			if (status === OrderStatus.PAID) paidCount++
		}

		const successRate = paidCount / iterations
		expect(successRate).toBeGreaterThanOrEqual(0.6)
		expect(successRate).toBeLessThanOrEqual(0.9)
	})

	it('MEDIUM spending users have ~88% success rate on paid events', () => {
		const user = buildUser({ spendingPower: 'MEDIUM' })
		const iterations = 300
		let paidCount = 0

		for (let i = 0; i < iterations; i++) {
			const status = determineOrderStatus(user, 2500, faker)
			if (status === OrderStatus.PAID) paidCount++
		}

		const successRate = paidCount / iterations
		expect(successRate).toBeGreaterThanOrEqual(0.78)
		expect(successRate).toBeLessThanOrEqual(0.98)
	})

	it('expensive events (>10000 cents) reduce success rate', () => {
		const user = buildUser({ spendingPower: 'HIGH' })
		const iterations = 300
		let cheapPaidCount = 0
		let expensivePaidCount = 0

		for (let i = 0; i < iterations; i++) {
			if (determineOrderStatus(user, 2500, faker) === OrderStatus.PAID)
				cheapPaidCount++
			if (determineOrderStatus(user, 15000, faker) === OrderStatus.PAID)
				expensivePaidCount++
		}

		// Expensive events should have a noticeably lower success rate
		// HIGH user: 0.95 base for cheap vs 0.95 - 0.10 - 0.05 = 0.80 for expensive (>10000 and >5000)
		expect(cheapPaidCount).toBeGreaterThan(expensivePaidCount)
	})

	it('returns only valid OrderStatus values for non-free events', () => {
		const user = buildUser({ spendingPower: 'LOW' })
		const validStatuses = new Set([
			OrderStatus.PAID,
			OrderStatus.PENDING,
			OrderStatus.CANCELLED,
		])

		for (let i = 0; i < 200; i++) {
			const status = determineOrderStatus(user, 5000, faker)
			expect(validStatuses).toContain(status)
		}
	})
})

// --- findInterestedUsers edge cases ---

describe('findInterestedUsers — edge cases', () => {
	it('handles event with undefined categories', () => {
		const event = buildEvent({ categories: undefined })
		const user = buildUser({
			categoryInterests: [
				{
					categoryId: techCategory.id,
					interestLevel: 10,
					category: techCategory,
				},
			],
		})

		const results = findInterestedUsers(event, [user])
		expect(results).toHaveLength(0)
	})

	it('handles user with undefined categoryInterests', () => {
		const event = buildEvent({
			categories: [{ categoryId: techCategory.id, category: techCategory }],
		})
		const user = buildUser({ categoryInterests: undefined })

		const results = findInterestedUsers(event, [user])
		expect(results).toHaveLength(0)
	})
})

// --- selectTierForUser edge cases ---

describe('selectTierForUser — edge cases', () => {
	it('MEDIUM spending with exactly 2 tiers falls back to all tiers', () => {
		const mediumUser = buildUser({ spendingPower: 'MEDIUM' })
		const twoTiers = [
			{ id: 'free', name: 'Free', priceCents: 0 },
			{ id: 'vip', name: 'VIP', priceCents: 10000 },
		]

		// slice(1, -1) on a 2-element array is empty, so it should fallback to all tiers
		const selectedTiers = new Set<string>()
		for (let i = 0; i < 50; i++) {
			const tier = selectTierForUser(mediumUser, [...twoTiers], faker)
			if (tier) selectedTiers.add(tier.id)
		}

		// Should get either tier since the middle slice is empty and it falls back
		expect(selectedTiers.size).toBeGreaterThanOrEqual(1)
	})
})
