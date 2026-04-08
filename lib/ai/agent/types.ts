import type { UIMessage } from 'ai'

export interface PageContext {
	page: string
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
