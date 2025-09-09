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

export interface SearchMatchInfo {
	reason: string
	matchedField: 'title' | 'description' | 'name'
	matchType: 'exact' | 'phrase' | 'word' | 'prefix' | 'fuzzy'
	matchedText: string
	score: number
}

export interface EventSearchResult {
	textScore: number
	recencyScore: number
	locationScore: number
	total: number
	matches: SearchMatchInfo[]
}

export interface CommunitySearchResult {
	textScore: number
	activityScore: number
	total: number
	matches: SearchMatchInfo[]
}

/**
 * Calculate text relevance score for search query with intelligent word boundary matching
 * Returns both score and detailed match information
 */
export function calculateTextScoreWithMatches(
	text: string | null | undefined,
	query: string,
	fieldName: 'title' | 'description' | 'name'
): { score: number; matches: SearchMatchInfo[] } {
	if (!text) return { score: 0, matches: [] }

	const lowerText = text.toLowerCase()
	const lowerQuery = query.toLowerCase()
	const queryWords = lowerQuery.split(/\s+/).filter(Boolean)
	const textWords = lowerText.split(/\s+/).filter(Boolean)

	let score = 0
	const matches: SearchMatchInfo[] = []

	// Exact match bonus (highest priority)
	if (lowerText === lowerQuery) {
		score += 1000
		matches.push({
			reason: `Exact match in ${fieldName}`,
			matchedField: fieldName,
			matchType: 'exact',
			matchedText: text,
			score: 1000,
		})
		return { score, matches }
	}

	// Full phrase match bonus
	if (lowerText.includes(lowerQuery)) {
		// Check if it's a word boundary match (not substring)
		const regex = new RegExp(`\\b${escapeRegex(lowerQuery)}\\b`, 'i')
		if (regex.test(text)) {
			score += 500
			matches.push({
				reason: `Complete phrase match in ${fieldName}`,
				matchedField: fieldName,
				matchType: 'phrase',
				matchedText: lowerQuery,
				score: 500,
			})
		} else {
			// Partial phrase match (lower score)
			score += 100
			matches.push({
				reason: `Partial phrase match in ${fieldName}`,
				matchedField: fieldName,
				matchType: 'phrase',
				matchedText: lowerQuery,
				score: 100,
			})
		}
	}

	// Individual word matching with word boundaries
	for (const queryWord of queryWords) {
		if (queryWord.length < 2) continue // Skip very short words

		// Exact word match (highest individual word score)
		if (textWords.includes(queryWord)) {
			const wordScore = 200
			score += wordScore
			matches.push({
				reason: `Word "${queryWord}" found in ${fieldName}`,
				matchedField: fieldName,
				matchType: 'word',
				matchedText: queryWord,
				score: wordScore,
			})
			continue
		}

		// Word starts with query (good for partial matches like "tech" -> "technology")
		const startsWithMatches = textWords.filter(
			(word) => word.startsWith(queryWord) && word.length > queryWord.length
		)
		if (startsWithMatches.length > 0) {
			// Score based on how close the match is
			const bestMatch = startsWithMatches.reduce((best, current) =>
				current.length < best.length ? current : best
			)
			const lengthRatio = queryWord.length / bestMatch.length
			const wordScore = Math.floor(100 * lengthRatio)
			score += wordScore
			matches.push({
				reason: `Prefix match "${queryWord}" → "${bestMatch}" in ${fieldName}`,
				matchedField: fieldName,
				matchType: 'prefix',
				matchedText: bestMatch,
				score: wordScore,
			})
			continue
		}

		// Fuzzy matching for typos (very conservative)
		for (const textWord of textWords) {
			if (
				textWord.length >= queryWord.length &&
				calculateLevenshteinDistance(queryWord, textWord) <= 1
			) {
				const wordScore = 50
				score += wordScore
				matches.push({
					reason: `Fuzzy match "${queryWord}" → "${textWord}" in ${fieldName}`,
					matchedField: fieldName,
					matchType: 'fuzzy',
					matchedText: textWord,
					score: wordScore,
				})
				break
			}
		}
	}

	// Title/name specific bonuses
	if (lowerText.startsWith(lowerQuery)) {
		const bonusScore = 300
		score += bonusScore
		matches.push({
			reason: `${fieldName} starts with search term`,
			matchedField: fieldName,
			matchType: 'prefix',
			matchedText: lowerQuery,
			score: bonusScore,
		})
	}

	// Penalize very long texts where match might be incidental
	const textLength = text.length
	if (textLength > 200) {
		score = Math.floor(score * 0.8)
		// Update match scores proportionally
		matches.forEach((match) => {
			match.score = Math.floor(match.score * 0.8)
		})
	}

	return { score, matches }
}

/**
 * Legacy function for backward compatibility
 */
export function calculateTextScore(
	text: string | null | undefined,
	query: string
): number {
	return calculateTextScoreWithMatches(text, query, 'title').score
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function calculateLevenshteinDistance(a: string, b: string): number {
	if (a.length === 0) return b.length
	if (b.length === 0) return a.length

	const matrix = Array(b.length + 1)
		.fill(null)
		.map(() => Array(a.length + 1).fill(null))

	for (let i = 0; i <= a.length; i++) matrix[0][i] = i
	for (let j = 0; j <= b.length; j++) matrix[j][0] = j

	for (let j = 1; j <= b.length; j++) {
		for (let i = 1; i <= a.length; i++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1
			matrix[j][i] = Math.min(
				matrix[j][i - 1] + 1, // deletion
				matrix[j - 1][i] + 1, // insertion
				matrix[j - 1][i - 1] + cost // substitution
			)
		}
	}

	return matrix[b.length][a.length]
}

/**
 * Check if a search query should match against text with intelligent filtering
 */
export function isRelevantMatch(text: string, query: string): boolean {
	const lowerText = text.toLowerCase()
	const lowerQuery = query.toLowerCase()
	const queryWords = lowerQuery.split(/\s+/).filter(Boolean)
	const textWords = lowerText.split(/\s+/).filter(Boolean)

	// Quick exact matches
	if (lowerText.includes(lowerQuery)) {
		// Check if it's a meaningful word boundary match
		const regex = new RegExp(`\\b${escapeRegex(lowerQuery)}\\b`, 'i')
		if (regex.test(text)) return true
	}

	// Check individual words
	let matchedWords = 0
	for (const queryWord of queryWords) {
		if (queryWord.length < 2) continue

		// Exact word match
		if (textWords.includes(queryWord)) {
			matchedWords++
			continue
		}

		// Meaningful prefix match (avoid "tech" matching "technique")
		const meaningfulMatches = textWords.filter((word) => {
			if (!word.startsWith(queryWord)) return false

			// Allow if query is substantial portion of the word
			const ratio = queryWord.length / word.length
			return ratio >= 0.6 // "tech" (4) vs "technique" (9) = 0.44, won't match
		})

		if (meaningfulMatches.length > 0) {
			matchedWords++
		}
	}

	// Require at least half of the query words to have meaningful matches
	return matchedWords >= Math.ceil(queryWords.length / 2)
}

/**
 * Calculate event search score with multiple factors and detailed match information
 */
export function calculateEventScoreWithMatches(
	event: {
		title: string
		description?: string | null
		startDate: Date
		location?: { id: string } | null
	},
	params: SearchScoreParams
): EventSearchResult {
	const { query, userLocationId } = params

	// Text relevance with detailed match info
	const titleResult = calculateTextScoreWithMatches(event.title, query, 'title')
	const descResult = event.description
		? calculateTextScoreWithMatches(event.description, query, 'description')
		: { score: 0, matches: [] }

	// Title weighted higher than description
	const titleScore = titleResult.score * 2
	const descScore = descResult.score
	const textScore = titleScore + descScore

	// Combine all matches
	const allMatches: SearchMatchInfo[] = [
		...titleResult.matches.map((m) => ({ ...m, score: m.score * 2 })), // Weight title matches higher
		...descResult.matches,
	]

	// Recency bonus (events happening sooner score higher)
	const now = Date.now()
	const eventTime = event.startDate.getTime()
	const daysDiff = (eventTime - now) / (1000 * 60 * 60 * 24)
	const recencyScore =
		daysDiff > 0 && daysDiff <= 30 ? Math.max(0, 30 - daysDiff) : 0

	// Location proximity bonus
	const locationScore =
		userLocationId && event.location?.id === userLocationId ? 10 : 0

	// Add location match if applicable
	if (locationScore > 0) {
		allMatches.push({
			reason: 'Event in your preferred location',
			matchedField: 'title', // Default field for location matches
			matchType: 'exact',
			matchedText: 'location match',
			score: locationScore,
		})
	}

	// Add recency bonus to matches if significant
	if (recencyScore > 0) {
		allMatches.push({
			reason: `Upcoming event (${Math.round(daysDiff)} days away)`,
			matchedField: 'title',
			matchType: 'exact',
			matchedText: 'recent event',
			score: recencyScore,
		})
	}

	const total = textScore + recencyScore + locationScore

	return {
		textScore,
		recencyScore,
		locationScore,
		total,
		matches: allMatches.sort((a, b) => b.score - a.score), // Sort by score descending
	}
}

/**
 * Legacy function for backward compatibility
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
	const result = calculateEventScoreWithMatches(event, params)
	return {
		textScore: result.textScore,
		recencyScore: result.recencyScore,
		locationScore: result.locationScore,
		total: result.total,
	}
}

/**
 * Calculate community search score with detailed match information
 */
export function calculateCommunityScoreWithMatches(
	community: {
		name: string
		description?: string | null
		_count?: { members?: number; events?: number }
		events?: { startDate: Date }[]
	},
	params: SearchScoreParams
): CommunitySearchResult {
	const { query } = params

	// Text relevance with detailed match info
	const nameResult = calculateTextScoreWithMatches(
		community.name,
		query,
		'name'
	)
	const descResult = community.description
		? calculateTextScoreWithMatches(community.description, query, 'description')
		: { score: 0, matches: [] }

	// Name weighted higher than description
	const nameScore = nameResult.score * 2
	const descScore = descResult.score
	const textScore = nameScore + descScore

	// Combine all matches
	const allMatches: SearchMatchInfo[] = [
		...nameResult.matches.map((m) => ({ ...m, score: m.score * 2 })), // Weight name matches higher
		...descResult.matches,
	]

	// Activity score based on member count and recent events
	const memberCount = community._count?.members ?? 0
	const recentEventCount =
		community.events?.filter(
			(e) => e.startDate.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
		).length ?? 0

	const activityScore = Math.log(memberCount + 1) * 2 + recentEventCount * 3

	// Add activity context to matches if significant
	if (memberCount > 10) {
		allMatches.push({
			reason: `Active community with ${memberCount} members`,
			matchedField: 'name',
			matchType: 'exact',
			matchedText: 'community activity',
			score: Math.log(memberCount + 1) * 2,
		})
	}

	if (recentEventCount > 0) {
		allMatches.push({
			reason: `${recentEventCount} recent event${recentEventCount > 1 ? 's' : ''}`,
			matchedField: 'name',
			matchType: 'exact',
			matchedText: 'recent events',
			score: recentEventCount * 3,
		})
	}

	const total = textScore + activityScore

	return {
		textScore,
		activityScore,
		total,
		matches: allMatches.sort((a, b) => b.score - a.score), // Sort by score descending
	}
}

/**
 * Legacy function for backward compatibility
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
	const result = calculateCommunityScoreWithMatches(community, params)
	return {
		textScore: result.textScore,
		activityScore: result.activityScore,
		total: result.total,
	}
}

/**
 * Create intelligent search where conditions for events
 */
export function createEventSearchWhere(query: string): Prisma.EventWhereInput {
	const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean)

	// Create word boundary patterns for better matching
	const wordBoundaryConditions: Prisma.EventWhereInput[] = []

	for (const word of queryWords) {
		wordBoundaryConditions.push({
			OR: [
				// Exact word match in title
				{ title: { contains: ` ${word} `, mode: 'insensitive' as const } },
				{ title: { startsWith: `${word} `, mode: 'insensitive' as const } },
				{ title: { endsWith: ` ${word}`, mode: 'insensitive' as const } },
				{ title: { equals: word, mode: 'insensitive' as const } },

				// Same for description
				{
					description: { contains: ` ${word} `, mode: 'insensitive' as const },
				},
				{
					description: { startsWith: `${word} `, mode: 'insensitive' as const },
				},
				{ description: { endsWith: ` ${word}`, mode: 'insensitive' as const } },
			],
		})
	}

	// Fallback to original contains for broader coverage
	const fallbackConditions: Prisma.EventWhereInput = {
		OR: [
			{ title: { contains: query, mode: 'insensitive' as const } },
			{ description: { contains: query, mode: 'insensitive' as const } },
		],
	}

	return {
		isPublished: true,
		deletedAt: null,
		OR: [
			// Include word boundary matches for short queries
			...(queryWords.length <= 3 ? wordBoundaryConditions : []),
			// Always include fallback
			fallbackConditions,
		],
	}
}

/**
 * Create intelligent search where conditions for communities
 */
export function createCommunitySearchWhere(
	query: string
): Prisma.CommunityWhereInput {
	const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean)

	// Create word boundary patterns for better matching
	const wordBoundaryConditions: Prisma.CommunityWhereInput[] = []

	for (const word of queryWords) {
		wordBoundaryConditions.push({
			OR: [
				// Exact word match for name
				{ name: { contains: ` ${word} `, mode: 'insensitive' as const } },
				{ name: { startsWith: `${word} `, mode: 'insensitive' as const } },
				{ name: { endsWith: ` ${word}`, mode: 'insensitive' as const } },
				{ name: { equals: word, mode: 'insensitive' as const } },

				// Same for description
				{
					description: { contains: ` ${word} `, mode: 'insensitive' as const },
				},
				{
					description: { startsWith: `${word} `, mode: 'insensitive' as const },
				},
				{ description: { endsWith: ` ${word}`, mode: 'insensitive' as const } },
			],
		})
	}

	// Fallback to original contains
	const fallbackConditions: Prisma.CommunityWhereInput = {
		OR: [
			{ name: { contains: query, mode: 'insensitive' as const } },
			{ description: { contains: query, mode: 'insensitive' as const } },
		],
	}

	return {
		isPublic: true,
		OR: [
			// Include word boundary matches for short queries
			...(queryWords.length <= 3 ? wordBoundaryConditions : []),
			// Always include fallback
			fallbackConditions,
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
