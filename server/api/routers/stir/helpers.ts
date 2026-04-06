import type { Prisma } from '@prisma/client'
import { buildDateWhere, parseTemporalHints } from './temporal'

// Stop words: common English words + event-domain noise + temporal qualifiers
// Temporal qualifiers are handled separately by parseTemporalHints
const SEARCH_STOP_WORDS = new Set([
	// English function words
	'a',
	'an',
	'the',
	'and',
	'or',
	'but',
	'in',
	'on',
	'at',
	'to',
	'for',
	'of',
	'with',
	'by',
	'from',
	'as',
	'is',
	'was',
	'are',
	'be',
	'been',
	'being',
	'have',
	'has',
	'had',
	'do',
	'does',
	'did',
	'will',
	'would',
	'could',
	'should',
	'may',
	'might',
	'can',
	'shall',
	'not',
	'no',
	'so',
	'if',
	'then',
	'than',
	'that',
	'this',
	'these',
	'those',
	'it',
	'its',
	'my',
	'your',
	'our',
	'their',
	'his',
	'her',
	'me',
	'us',
	'them',
	'him',
	'who',
	'what',
	'which',
	'where',
	'when',
	'how',
	'all',
	'each',
	'every',
	'any',
	'some',
	'few',
	'more',
	'most',
	'just',
	'very',
	'really',
	'about',
	'also',
	'like',
	// Event-domain noise (common but not meaningful as search terms)
	'event',
	'events',
	'near',
	'nearby',
	'around',
	'find',
	'show',
	'looking',
	'search',
	'best',
	'good',
	'great',
	'new',
	'upcoming',
	'popular',
	'trending',
	'happening',
	'going',
	// Temporal qualifiers (handled by parseTemporalHints)
	'today',
	'tonight',
	'tomorrow',
	'week',
	'weekend',
	'month',
	'next',
	'last',
	'this',
	'morning',
	'afternoon',
	'evening',
])

// Static category keyword map — maps search terms to category names
// Sync with prisma/seed/data/categories.json
const CATEGORY_KEYWORD_MAP: Record<string, string[]> = {
	'Food & Drinks': [
		'food',
		'drink',
		'dining',
		'restaurant',
		'culinary',
		'cocktail',
		'wine',
		'beer',
		'brunch',
		'cooking',
	],
	'Nightlife & Parties': ['nightlife', 'party', 'club', 'dj', 'rave', 'dance'],
	'Music & Concerts': [
		'music',
		'concert',
		'band',
		'jazz',
		'rock',
		'electronic',
		'acoustic',
	],
	'Arts & Culture': [
		'art',
		'gallery',
		'museum',
		'painting',
		'sculpture',
		'exhibit',
		'culture',
		'theater',
		'theatre',
	],
	'Sports & Fitness': [
		'sport',
		'fitness',
		'gym',
		'run',
		'marathon',
		'basketball',
		'soccer',
		'football',
		'tennis',
		'cycling',
	],
	'Gaming & Esports': ['gaming', 'esport', 'game', 'tournament', 'lan'],
	'Travel & Adventure': [
		'travel',
		'adventure',
		'hiking',
		'camping',
		'trek',
		'explore',
		'backpack',
	],
	'Tech & Startups': [
		'tech',
		'startup',
		'coding',
		'programming',
		'developer',
		'software',
		'ai',
		'hackathon',
		'data',
		'web3',
		'crypto',
	],
	'Wellness & Self-Care': [
		'wellness',
		'yoga',
		'meditation',
		'mindfulness',
		'spa',
		'retreat',
	],
	'Photography & Film': [
		'photo',
		'photography',
		'film',
		'cinema',
		'movie',
		'video',
		'documentary',
		'camera',
	],
	'Books & Writing': [
		'book',
		'writing',
		'author',
		'poetry',
		'literary',
		'reading',
		'novel',
	],
	'Comedy & Entertainment': ['comedy', 'standup', 'improv', 'entertainment'],
	'Fashion & Style': [
		'fashion',
		'style',
		'clothing',
		'design',
		'runway',
		'boutique',
	],
	'Networking & Career': [
		'networking',
		'career',
		'professional',
		'hiring',
		'job',
		'mentorship',
	],
	'Outdoor & Nature': [
		'outdoor',
		'nature',
		'park',
		'garden',
		'trail',
		'beach',
		'lake',
	],
	'Crafts & DIY': ['craft', 'diy', 'handmade', 'maker', 'pottery', 'knitting'],
	'Dating & Social': ['dating', 'social', 'singles', 'mixer', 'speed dating'],
	'Learning & Skills': [
		'learn',
		'class',
		'course',
		'tutorial',
		'skill',
		'education',
		'seminar',
	],
	'Volunteering & Impact': [
		'volunteer',
		'charity',
		'nonprofit',
		'impact',
		'donate',
	],
	'Pets & Animals': ['pet', 'dog', 'cat', 'animal', 'puppy', 'adoption'],
}

/**
 * Extract significant search words from a query (stop words removed).
 */
export function extractSignificantWords(query: string): string[] {
	return query
		.toLowerCase()
		.split(/\s+/)
		.filter((w) => w.length >= 2 && !SEARCH_STOP_WORDS.has(w))
}

/**
 * Detect matching categories from search keywords.
 */
export function detectCategories(words: string[]): string[] {
	const matches: string[] = []
	for (const [category, keywords] of Object.entries(CATEGORY_KEYWORD_MAP)) {
		if (words.some((word) => keywords.includes(word))) {
			matches.push(category)
		}
	}
	return matches
}

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
 * Create search WHERE for events with stop words, AND semantics,
 * category detection, and temporal heuristics.
 */
export function createEventSearchWhere(query: string): Prisma.EventWhereInput {
	const significantWords = extractSignificantWords(query)

	// If all words were stop words, use full phrase fallback
	if (significantWords.length === 0) {
		return {
			isPublished: true,
			deletedAt: null,
			OR: [
				{ title: { contains: query, mode: 'insensitive' as const } },
				{ description: { contains: query, mode: 'insensitive' as const } },
			],
		}
	}

	// AND conditions: all significant words must appear in title or description
	const wordConditions: Prisma.EventWhereInput[] = significantWords.map(
		(word) => ({
			OR: [
				{ title: { contains: word, mode: 'insensitive' as const } },
				{ description: { contains: word, mode: 'insensitive' as const } },
			],
		})
	)

	// Detect categories from keywords
	const categories = detectCategories(significantWords)

	// Detect temporal hints from the original query (before stop word removal)
	const dateRange = parseTemporalHints(query)

	// Build the primary AND conditions
	const andConditions: Prisma.EventWhereInput[] = [...wordConditions]

	// Add date filtering if temporal hints detected
	if (dateRange) {
		andConditions.push(buildDateWhere(dateRange))
	}

	// Build the OR branches (tiered)
	const orBranches: Prisma.EventWhereInput[] = []

	if (categories.length > 0) {
		// Tier 0 (best): keywords + category + date range
		orBranches.push({
			AND: [
				...andConditions,
				{
					categories: {
						some: {
							category: {
								name: { in: categories, mode: 'insensitive' as const },
							},
						},
					},
				},
			],
		})
	}

	// Tier 1: AND — all significant words must match (+ date if detected)
	orBranches.push({ AND: andConditions })

	// Tier 2 (fallback): full phrase match in title or description
	orBranches.push(
		{ title: { contains: query, mode: 'insensitive' as const } },
		{ description: { contains: query, mode: 'insensitive' as const } }
	)

	return {
		isPublished: true,
		deletedAt: null,
		OR: orBranches,
	}
}

/**
 * Create search WHERE for communities with stop words and AND semantics.
 */
export function createCommunitySearchWhere(
	query: string
): Prisma.CommunityWhereInput {
	const significantWords = extractSignificantWords(query)

	if (significantWords.length === 0) {
		return {
			isPublic: true,
			OR: [
				{ name: { contains: query, mode: 'insensitive' as const } },
				{ description: { contains: query, mode: 'insensitive' as const } },
			],
		}
	}

	const wordConditions: Prisma.CommunityWhereInput[] = significantWords.map(
		(word) => ({
			OR: [
				{ name: { contains: word, mode: 'insensitive' as const } },
				{ description: { contains: word, mode: 'insensitive' as const } },
			],
		})
	)

	return {
		isPublic: true,
		OR: [
			{ AND: wordConditions },
			{ name: { contains: query, mode: 'insensitive' as const } },
			{ description: { contains: query, mode: 'insensitive' as const } },
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

/**
 * Create enhanced event search WHERE from LLM-interpreted query
 */
export function createEnhancedEventSearchWhere(interpreted: {
	keywords: string[]
	city: string | null
	category: string | null
	dateRange: { after: string | null; before: string | null }
	locationType: 'PHYSICAL' | 'ONLINE' | 'HYBRID' | null
}): Prisma.EventWhereInput {
	const conditions: Prisma.EventWhereInput[] = []

	// Keywords — reuse existing text search
	if (interpreted.keywords.length > 0) {
		const textWhere = createEventSearchWhere(interpreted.keywords.join(' '))
		const { isPublished: _, deletedAt: __, ...textConditions } = textWhere
		conditions.push(textConditions)
	}

	// City — match location name or slug
	if (interpreted.city) {
		conditions.push({
			location: {
				OR: [
					{
						name: {
							contains: interpreted.city,
							mode: 'insensitive' as const,
						},
					},
					{
						slug: {
							contains: interpreted.city.toLowerCase(),
							mode: 'insensitive' as const,
						},
					},
				],
			},
		})
	}

	// Category
	if (interpreted.category) {
		conditions.push({
			categories: {
				some: {
					category: {
						name: {
							contains: interpreted.category,
							mode: 'insensitive' as const,
						},
					},
				},
			},
		})
	}

	// Date range — handles multi-day events spanning the range
	const { after, before } = interpreted.dateRange
	if (after || before) {
		const dateConditions: Prisma.EventWhereInput[] = []
		if (after && before) {
			dateConditions.push({
				OR: [
					{ startDate: { gte: new Date(after), lte: new Date(before) } },
					{
						AND: [
							{ startDate: { lte: new Date(before) } },
							{ endDate: { gte: new Date(after) } },
						],
					},
				],
			})
		} else if (after) {
			dateConditions.push({ startDate: { gte: new Date(after) } })
		} else if (before) {
			dateConditions.push({ startDate: { lte: new Date(before) } })
		}
		if (dateConditions.length > 0) {
			conditions.push(...dateConditions)
		}
	}

	// Location type
	if (interpreted.locationType) {
		conditions.push({ locationType: interpreted.locationType })
	}

	return {
		isPublished: true,
		deletedAt: null,
		...(conditions.length > 0 && { AND: conditions }),
	}
}

/**
 * Create enhanced community search WHERE from LLM-interpreted query
 */
export function createEnhancedCommunitySearchWhere(interpreted: {
	keywords: string[]
	city: string | null
}): Prisma.CommunityWhereInput {
	const conditions: Prisma.CommunityWhereInput[] = []

	if (interpreted.keywords.length > 0) {
		const textWhere = createCommunitySearchWhere(interpreted.keywords.join(' '))
		const { isPublic: _, ...textConditions } = textWhere
		conditions.push(textConditions)
	}

	if (interpreted.city) {
		conditions.push({
			events: {
				some: {
					location: {
						OR: [
							{
								name: {
									contains: interpreted.city,
									mode: 'insensitive' as const,
								},
							},
							{
								slug: {
									contains: interpreted.city.toLowerCase(),
									mode: 'insensitive' as const,
								},
							},
						],
					},
				},
			},
		})
	}

	return {
		isPublic: true,
		...(conditions.length > 0 && { AND: conditions }),
	}
}
