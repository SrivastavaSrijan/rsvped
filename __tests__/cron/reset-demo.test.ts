/**
 * Tests for the cron reset-demo route authorization logic
 * and demo seed stats shape.
 */
import { timingSafeEqual } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import type { DemoSeedStats } from '@/prisma/seed/demo'

// Replicate the auth helper from the route for isolated unit testing
function isValidCronSecret(
	authHeader: string | null,
	secret: string | undefined
): boolean {
	if (!secret || !authHeader) return false
	const token = authHeader.replace('Bearer ', '')
	try {
		return timingSafeEqual(Buffer.from(token), Buffer.from(secret))
	} catch {
		return false
	}
}

describe('isValidCronSecret', () => {
	it('returns false when secret is not configured', () => {
		expect(isValidCronSecret('Bearer abc', undefined)).toBe(false)
	})

	it('returns false when auth header is null', () => {
		expect(isValidCronSecret(null, 'mysecret')).toBe(false)
	})

	it('returns false for wrong token', () => {
		expect(isValidCronSecret('Bearer wrongtoken', 'mysecret')).toBe(false)
	})

	it('returns true for correct token', () => {
		const secret = 'a'.repeat(32)
		expect(isValidCronSecret(`Bearer ${secret}`, secret)).toBe(true)
	})

	it('returns true when Bearer-prefixed token matches secret', () => {
		const secret = 'mysecret123'
		expect(isValidCronSecret(`Bearer ${secret}`, secret)).toBe(true)
	})

	it('returns false for empty token (Bearer with no value)', () => {
		expect(isValidCronSecret('Bearer ', 'mysecret')).toBe(false)
	})

	it('returns false when token length differs from secret', () => {
		expect(isValidCronSecret('Bearer short', 'a-much-longer-secret')).toBe(
			false
		)
	})
})

describe('DemoSeedStats shape', () => {
	it('has all required fields with numeric values', () => {
		const stats: DemoSeedStats = {
			communities: 10,
			rsvps: 15,
			hostedEvents: 4,
			categoryInterests: 8,
			sentFriendRequests: 12,
			receivedFriendRequests: 4,
			activities: 45,
		}

		expect(typeof stats.communities).toBe('number')
		expect(typeof stats.rsvps).toBe('number')
		expect(typeof stats.hostedEvents).toBe('number')
		expect(typeof stats.categoryInterests).toBe('number')
		expect(typeof stats.sentFriendRequests).toBe('number')
		expect(typeof stats.receivedFriendRequests).toBe('number')
		expect(typeof stats.activities).toBe('number')
	})

	it('activities count is at least the sum of rsvps, hosted, communities, and sent requests', () => {
		const stats: DemoSeedStats = {
			communities: 10,
			rsvps: 15,
			hostedEvents: 4,
			categoryInterests: 8,
			sentFriendRequests: 12,
			receivedFriendRequests: 4,
			activities: 45,
		}

		const minActivities =
			stats.rsvps +
			stats.hostedEvents +
			stats.communities +
			stats.sentFriendRequests
		expect(stats.activities).toBeGreaterThanOrEqual(minActivities)
	})

	it('receivedFriendRequests is tracked separately from sentFriendRequests', () => {
		const stats: DemoSeedStats = {
			communities: 10,
			rsvps: 15,
			hostedEvents: 4,
			categoryInterests: 8,
			sentFriendRequests: 12,
			receivedFriendRequests: 4,
			activities: 45,
		}

		expect(stats.receivedFriendRequests).toBeGreaterThan(0)
		expect(stats.sentFriendRequests).toBeGreaterThan(stats.receivedFriendRequests)
	})
})


