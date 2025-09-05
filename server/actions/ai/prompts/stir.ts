import { z } from 'zod'

// System prompts for Stir search and relevance
export const StirSystemPrompts = {
	intent: `You are Stir, an AI search analyst for RSVP'd.
Analyze the user's natural language query and convert it into structured search filters for events, users, and communities.
Respect privacy: only infer intent and filters; do not fabricate personal details.
Return valid JSON that matches the provided schema exactly.`,

	relevance: `You are Stir, an AI relevance scorer for RSVP'd.
Given a user context and candidate items, explain relevance succinctly.
Return scores from 0 to 1 and short reasons (max 100 chars).`,
}

// Input schema for Stir search
export const StirSearchInputSchema = z.object({
	query: z.string().min(1).max(500),
	type: z.enum(['all', 'events', 'users', 'communities']).optional(),
	location: z.string().optional(),
	dateRange: z
		.object({
			start: z.string().optional(), // ISO date
			end: z.string().optional(), // ISO date
		})
		.optional(),
	limit: z.number().min(1).max(50).optional(),
})

// Intent parsing response schema
export const SearchIntentSchema = z.object({
	primaryType: z.enum(['events', 'users', 'communities', 'mixed']),
	keywords: z.array(z.string()).optional(),
	eventFilters: z
		.object({
			categories: z.array(z.string()).optional(),
			price: z
				.object({ max: z.number().int().nonnegative().optional() })
				.optional(),
			location: z.string().optional(),
			dateRange: z
				.object({ start: z.string().optional(), end: z.string().optional() })
				.optional(),
			online: z.boolean().optional(),
		})
		.optional(),
	userFilters: z
		.object({
			professions: z.array(z.string()).optional(),
			experienceLevels: z
				.array(z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE']))
				.optional(),
			interests: z.array(z.string()).optional(),
			location: z.string().optional(),
		})
		.optional(),
	communityFilters: z
		.object({
			topics: z.array(z.string()).optional(),
			location: z.string().optional(),
			isPublic: z.boolean().optional(),
		})
		.optional(),
	summary: z.object({
		interpretation: z.string(),
		extracted: z
			.object({
				location: z.string().optional(),
				dateRange: z
					.object({ start: z.string().optional(), end: z.string().optional() })
					.optional(),
				budget: z.number().optional(),
			})
			.optional(),
		suggestions: z.array(z.string()).optional(),
	}),
})

// Output schema for Stir search results
export const StirSearchOutputSchema = z.object({
	events: z
		.array(
			z.object({
				id: z.string(),
				title: z.string(),
				startDate: z.date(),
				locationId: z.string().nullable(),
				communityId: z.string().nullable().optional(),
				score: z.number().min(0).max(1).optional(),
				reason: z.string().optional(),
			})
		)
		.optional(),
	users: z
		.array(
			z.object({
				id: z.string(),
				name: z.string().nullable(),
				profession: z.string().nullable().optional(),
				experienceLevel: z
					.enum(['JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE'])
					.nullable()
					.optional(),
				score: z.number().min(0).max(1).optional(),
				reason: z.string().optional(),
			})
		)
		.optional(),
	communities: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
				isPublic: z.boolean(),
				score: z.number().min(0).max(1).optional(),
				reason: z.string().optional(),
			})
		)
		.optional(),
	searchSummary: z.object({
		interpretation: z.string(),
		filters: z.record(z.string(), z.unknown()).optional(),
		suggestions: z.array(z.string()).optional(),
	}),
})

export type StirSearchInput = z.infer<typeof StirSearchInputSchema>
export type SearchIntent = z.infer<typeof SearchIntentSchema>
export type StirSearchOutput = z.infer<typeof StirSearchOutputSchema>

export const StirPrompts = {
	buildIntentPrompt: (q: string) =>
		`Query: ${q}\n\nParse into structured filters for events, users, and communities. Be precise and conservative in inferences.`,
	buildRelevancePrompt: (context: unknown, candidates: unknown) =>
		`User context: ${JSON.stringify(context)}\n\nCandidates: ${JSON.stringify(
			candidates
		)}\n\nProvide scores (0-1) and brief reasons.`,
}
