import type { Prisma } from '@prisma/client'

interface TemporalRange {
	after: Date
	before: Date
}

const MONTH_NAMES = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
]

function startOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function endOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

function endOfWeek(d: Date): Date {
	const day = d.getDay()
	const diff = day === 0 ? 0 : 7 - day // Sunday = end of week
	return endOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff))
}

function endOfMonth(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

/**
 * Parse temporal hints from a search query without LLM.
 * Returns a date range if temporal patterns are detected, null otherwise.
 */
export function parseTemporalHints(query: string): TemporalRange | null {
	const now = new Date()
	const lower = query.toLowerCase()

	if (/\btonight\b/.test(lower) || /\btoday\b/.test(lower)) {
		return { after: startOfDay(now), before: endOfDay(now) }
	}
	if (/\btomorrow\b/.test(lower)) {
		const tom = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
		return { after: startOfDay(tom), before: endOfDay(tom) }
	}
	if (/\bthis\s+weekend\b/.test(lower)) {
		const day = now.getDay()
		const satOffset = day <= 6 ? 6 - day : 0
		const sat = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + satOffset
		)
		const sun = new Date(sat.getFullYear(), sat.getMonth(), sat.getDate() + 1)
		return { after: startOfDay(sat), before: endOfDay(sun) }
	}
	if (/\bthis\s+week\b/.test(lower)) {
		return { after: startOfDay(now), before: endOfWeek(now) }
	}
	if (/\bnext\s+week\b/.test(lower)) {
		const nextMon = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + (7 - now.getDay()) + 1
		)
		const nextSun = new Date(
			nextMon.getFullYear(),
			nextMon.getMonth(),
			nextMon.getDate() + 6
		)
		return { after: startOfDay(nextMon), before: endOfDay(nextSun) }
	}
	if (/\bthis\s+month\b/.test(lower)) {
		return { after: startOfDay(now), before: endOfMonth(now) }
	}

	// Month names: "in July", "July events", etc.
	const monthMatch = lower.match(
		/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/
	)
	if (monthMatch) {
		const monthIndex = MONTH_NAMES.indexOf(monthMatch[1])
		// If the month has already passed this year, assume next year
		const year =
			monthIndex < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear()
		const start = new Date(year, monthIndex, 1)
		const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)
		return { after: start, before: end }
	}

	return null
}

/**
 * Build a Prisma WHERE clause for a date range, handling multi-day events.
 */
export function buildDateWhere(range: TemporalRange): Prisma.EventWhereInput {
	return {
		OR: [
			{ startDate: { gte: range.after, lte: range.before } },
			{
				AND: [
					{ startDate: { lte: range.before } },
					{ endDate: { gte: range.after } },
				],
			},
		],
	}
}
