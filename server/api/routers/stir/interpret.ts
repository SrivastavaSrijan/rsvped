import { z } from 'zod'
import { generate, isAvailable } from '@/lib/ai/llm'

// 20 seed categories — sync with prisma/seed/data/categories.json
const VALID_CATEGORIES = [
	'Food & Drinks',
	'Nightlife & Parties',
	'Music & Concerts',
	'Arts & Culture',
	'Sports & Fitness',
	'Gaming & Esports',
	'Travel & Adventure',
	'Tech & Startups',
	'Wellness & Self-Care',
	'Photography & Film',
	'Books & Writing',
	'Comedy & Entertainment',
	'Fashion & Style',
	'Networking & Career',
	'Outdoor & Nature',
	'Crafts & DIY',
	'Dating & Social',
	'Learning & Skills',
	'Volunteering & Impact',
	'Pets & Animals',
] as const

const InterpretedQuerySchema = z.object({
	keywords: z
		.array(z.string())
		.describe('Core search keywords, stripped of qualifiers'),
	city: z.string().nullable().describe('City name if mentioned'),
	category: z.string().nullable().describe('Event category if inferrable'),
	dateRange: z.object({
		after: z.string().nullable().describe('ISO date for range start'),
		before: z.string().nullable().describe('ISO date for range end'),
	}),
	locationType: z.enum(['PHYSICAL', 'ONLINE', 'HYBRID']).nullable(),
})

export type InterpretedQuery = z.infer<typeof InterpretedQuerySchema>

// Patterns that suggest a natural language query worth interpreting
const TEMPORAL_PATTERNS =
	/\b(today|tonight|tomorrow|this\s+week(end)?|next\s+week|this\s+month|next\s+month)\b/i
const LOCATION_PATTERNS = /\b(in|near|around|at)\s+\w+/i
const QUESTION_PATTERNS = /\b(where|when|what|how|find|show|any)\b/i

function shouldInterpret(query: string): boolean {
	const wordCount = query.trim().split(/\s+/).length
	if (wordCount <= 2) {
		// Short queries only if they have temporal/location/question patterns
		return (
			TEMPORAL_PATTERNS.test(query) ||
			LOCATION_PATTERNS.test(query) ||
			QUESTION_PATTERNS.test(query)
		)
	}
	return true
}

export async function interpretSearchQuery(
	rawQuery: string
): Promise<InterpretedQuery | null> {
	if (!isAvailable()) return null
	if (!shouldInterpret(rawQuery)) return null

	const today = new Date().toISOString().split('T')[0]
	const systemPrompt = `You are a search query interpreter for an event platform. Extract structured search parameters from natural language queries.

Today's date: ${today}

Valid categories: ${VALID_CATEGORIES.join(', ')}

Rules:
- Extract only what's explicitly or strongly implied in the query
- For date references like "this weekend", compute actual ISO dates from today
- For city names, return the common name (e.g., "NYC" → "New York", "SF" → "San Francisco")
- For category, only return a match if the query clearly relates to one
- Keywords should be the core search terms with qualifiers stripped (no "this weekend", no "in NYC")
- Return null for fields you can't confidently determine`

	try {
		const result = await Promise.race([
			generate(
				rawQuery,
				systemPrompt,
				InterpretedQuerySchema,
				'search-interpret'
			),
			new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
		])
		return result
	} catch {
		return null
	}
}
