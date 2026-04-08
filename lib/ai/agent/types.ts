import type { UIMessage } from 'ai'
import { z } from 'zod'

export const PAGE_CONTEXT_PAGES = {
	EVENT_DETAIL: 'event-detail',
	COMMUNITY: 'community',
	USER_PROFILE: 'user-profile',
	FEED: 'feed',
	STIR_HOME: 'stir-home',
	GENERAL: 'general',
} as const

export type PageContextPage =
	(typeof PAGE_CONTEXT_PAGES)[keyof typeof PAGE_CONTEXT_PAGES]

export interface PageContext {
	page: PageContextPage
	eventSlug?: string
	communitySlug?: string
	username?: string
	path?: string
}

export interface StirRequestBody {
	messages: UIMessage[]
	pageContext?: PageContext
}

export interface StirStreamOptions {
	messages: UIMessage[]
	pageContext?: PageContext
	userId?: string
}

/** Serialized event returned by search tools */
export interface ToolEventResult {
	id: string
	title: string
	slug: string
	description?: string | null
	startDate: string
	endDate: string
	location: string
	community: string | null
	categories: string[]
	rsvpCount: number
}

/** Serialized community returned by search tools */
export interface ToolCommunityResult {
	id: string
	name: string
	slug: string
	description?: string | null
	memberCount: number
	eventCount: number
}

/** Serialized category returned by category tool */
export interface ToolCategoryResult {
	name: string
	slug: string
	eventCount: number
}

/** Intent classification result from the router */
export const INTENTS = [
	'search',
	'recommend',
	'detail',
	'compare',
	'general',
] as const
export type Intent = (typeof INTENTS)[number]

export interface IntentClassification {
	intent: Intent
	reasoning: string
}

// ---------------------------------------------------------------------------
// Zod Schemas — centralized for reuse across classifier, suggestions, etc.
// Tool input schemas stay co-located in their tool files (AI SDK convention).
// ---------------------------------------------------------------------------

/** Schema for intent classification structured output. */
export const intentSchema = z.object({
	intent: z.enum(INTENTS),
	reasoning: z.string(),
})

/** Schema for AI-generated follow-up suggestions. */
export const suggestionsSchema = z.object({
	suggestions: z
		.array(z.string())
		.describe('Short follow-up questions the user might ask next'),
})
