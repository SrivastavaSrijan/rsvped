import type { Prisma } from '@prisma/client'

export interface SearchScoreParams {
	query: string
	userLocationId?: string | null
}

export interface EventSearchScore {
	textScore: number
	recencyScore: number
	locationScore: number
	total: number
}

export interface CommunitySearchScore {
	textScore: number
	activityScore: number
	total: number
}

/**
 * Calculate text relevance score for search query
 */
export function calculateTextScore(
	text: string | null | undefined,
	query: string
): number {
	if (!text) return 0

	const lowerText = text.toLowerCase()
	const lowerQuery = query.toLowerCase()
	const words = lowerQuery.split(/\s+/).filter(Boolean)

	let score = 0

	// Exact match bonus
	if (lowerText === lowerQuery) score += 100

	// Start match bonus
	if (lowerText.startsWith(lowerQuery)) score += 50

	// Word matching
	for (const word of words) {
		if (lowerText.includes(word)) {
			score += 10
		}
	}

	// Substring match bonus
	if (lowerText.includes(lowerQuery)) score += 20

	return score
}

/**
 * Calculate event search score with multiple factors
 */
export function calculateEventScore(
	event: {
		title: string
		description?: string | null
		startDate: Date
		location?: { id: string } | null
	},
	params: SearchScoreParams
): EventSearchScore {
	const { query, userLocationId } = params

	// Text relevance (title weighted higher than description)
	const titleScore = calculateTextScore(event.title, query) * 2
	const descScore = calculateTextScore(event.description, query)
	const textScore = titleScore + descScore

	// Recency bonus (events happening sooner score higher)
	const now = Date.now()
	const eventTime = event.startDate.getTime()
	const daysDiff = (eventTime - now) / (1000 * 60 * 60 * 24)
	const recencyScore =
		daysDiff > 0 && daysDiff <= 30 ? Math.max(0, 30 - daysDiff) : 0

	// Location proximity bonus
	const locationScore =
		userLocationId && event.location?.id === userLocationId ? 10 : 0

	const total = textScore + recencyScore + locationScore

	return { textScore, recencyScore, locationScore, total }
}

/**
 * Calculate community search score
 */
export function calculateCommunityScore(
	community: {
		name: string
		description?: string | null
		_count?: { members?: number; events?: number }
		events?: { startDate: Date }[]
	},
	params: SearchScoreParams
): CommunitySearchScore {
	const { query } = params

	// Text relevance (name weighted higher than description)
	const nameScore = calculateTextScore(community.name, query) * 2
	const descScore = calculateTextScore(community.description, query)
	const textScore = nameScore + descScore

	// Activity score based on member count and recent events
	const memberCount = community._count?.members ?? 0
	const recentEventCount =
		community.events?.filter(
			(e) => e.startDate.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
		).length ?? 0

	const activityScore = Math.log(memberCount + 1) * 2 + recentEventCount * 3

	const total = textScore + activityScore

	return { textScore, activityScore, total }
}

/**
 * Create search where conditions for events
 */
export function createEventSearchWhere(query: string): Prisma.EventWhereInput {
	return {
		isPublished: true,
		deletedAt: null,
		OR: [
			{ title: { contains: query, mode: 'insensitive' } },
			{ description: { contains: query, mode: 'insensitive' } },
		],
	}
}

/**
 * Create search where conditions for communities
 */
export function createCommunitySearchWhere(
	query: string
): Prisma.CommunityWhereInput {
	return {
		isPublic: true,
		OR: [
			{ name: { contains: query, mode: 'insensitive' } },
			{ description: { contains: query, mode: 'insensitive' } },
		],
	}
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(total: number, page: number, size: number) {
	const totalPages = Math.ceil(total / size)
	const hasMore = page < totalPages
	const hasPrevious = page > 1

	return {
		total,
		page,
		size,
		totalPages,
		hasMore,
		hasPrevious,
	}
}
