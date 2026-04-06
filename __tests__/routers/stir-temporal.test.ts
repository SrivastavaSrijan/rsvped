import { describe, expect, it } from 'vitest'
import { buildDateWhere, parseTemporalHints } from '@/server/api/routers/stir/temporal'

describe('parseTemporalHints', () => {
	it('parses "today" to today date range', () => {
		const result = parseTemporalHints('yoga today')
		expect(result).not.toBeNull()
		const now = new Date()
		expect(result!.after.getDate()).toBe(now.getDate())
		expect(result!.before.getDate()).toBe(now.getDate())
		expect(result!.after.getHours()).toBe(0)
		expect(result!.before.getHours()).toBe(23)
	})

	it('parses "tonight" to today date range', () => {
		const result = parseTemporalHints('concerts tonight')
		expect(result).not.toBeNull()
		expect(result!.after.getDate()).toBe(new Date().getDate())
	})

	it('parses "tomorrow" to next day', () => {
		const result = parseTemporalHints('events tomorrow')
		expect(result).not.toBeNull()
		const tomorrow = new Date()
		tomorrow.setDate(tomorrow.getDate() + 1)
		expect(result!.after.getDate()).toBe(tomorrow.getDate())
		expect(result!.before.getDate()).toBe(tomorrow.getDate())
	})

	it('parses "this week" to rest of current week', () => {
		const result = parseTemporalHints('tech events this week')
		expect(result).not.toBeNull()
		const now = new Date()
		expect(result!.after.getDate()).toBe(now.getDate())
		// Before should be Sunday of this week
		expect(result!.before.getDay()).toBe(0) // Sunday
	})

	it('parses "this weekend" to Saturday-Sunday', () => {
		const result = parseTemporalHints('music this weekend')
		expect(result).not.toBeNull()
		expect(result!.after.getDay()).toBe(6) // Saturday
		expect(result!.before.getDay()).toBe(0) // Sunday
	})

	it('parses "next week" to next Monday-Sunday', () => {
		const result = parseTemporalHints('meetups next week')
		expect(result).not.toBeNull()
		expect(result!.after.getDay()).toBe(1) // Monday
	})

	it('parses "this month" to end of current month', () => {
		const result = parseTemporalHints('events this month')
		expect(result).not.toBeNull()
		const now = new Date()
		expect(result!.after.getMonth()).toBe(now.getMonth())
		expect(result!.before.getMonth()).toBe(now.getMonth())
	})

	it('parses month names to that month range', () => {
		const result = parseTemporalHints('events in july')
		expect(result).not.toBeNull()
		expect(result!.after.getMonth()).toBe(6) // July (0-indexed)
		expect(result!.after.getDate()).toBe(1)
		expect(result!.before.getMonth()).toBe(6)
		// Last day of July
		expect(result!.before.getDate()).toBe(31)
	})

	it('assumes next year for past months', () => {
		const now = new Date()
		// Pick a month that has definitely passed
		const pastMonth = now.getMonth() > 0 ? 'january' : null
		if (pastMonth) {
			const result = parseTemporalHints(`events in ${pastMonth}`)
			expect(result).not.toBeNull()
			expect(result!.after.getFullYear()).toBe(now.getFullYear() + 1)
		}
	})

	it('returns null for queries with no temporal hints', () => {
		expect(parseTemporalHints('yoga classes')).toBeNull()
		expect(parseTemporalHints('tech meetups')).toBeNull()
		expect(parseTemporalHints('food')).toBeNull()
	})
})

describe('buildDateWhere', () => {
	it('builds OR clause for date range with multi-day event support', () => {
		const range = {
			after: new Date('2026-04-06'),
			before: new Date('2026-04-12'),
		}
		const where = buildDateWhere(range)
		expect(where).toHaveProperty('OR')
		expect(where.OR).toHaveLength(2)
	})
})
