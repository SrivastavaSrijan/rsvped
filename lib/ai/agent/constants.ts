import type { Intent } from './types'

// ---------------------------------------------------------------------------
// Model Configuration
// ---------------------------------------------------------------------------

/** Model tiers: fast (Haiku) for classification/suggestions, quality (Sonnet) for conversations. */
export const MODEL_OPTIONS = {
	fast: {
		id: 'claude-haiku-4-5-20251001',
		label: 'Claude Haiku 4.5',
	},
	quality: {
		id: 'claude-sonnet-4-20250514',
		label: 'Claude Sonnet 4',
	},
} as const

export type ModelTier = keyof typeof MODEL_OPTIONS

// ---------------------------------------------------------------------------
// Agent Configuration
// ---------------------------------------------------------------------------

export const AGENT_CONFIG = {
	/** Maximum multi-step tool loop iterations */
	maxSteps: 10,
	/** Max message length from user (chars) */
	maxMessageLength: 4000,
	/** Vercel Edge Function timeout (seconds) */
	maxDuration: 30,
	/** Max context length sent to suggestions endpoint (chars) */
	maxSuggestionsContext: 1000,
	/** Max description length returned in tool results (chars) */
	maxDescriptionLength: 200,
	/** Max category interests fetched for user profile context */
	maxCategoryInterests: 10,
	/** Max recent RSVPs fetched for user profile context */
	maxRecentRsvps: 5,
	/** Default search result limit for tools */
	defaultSearchLimit: 10,
	/** Max peers returned by friends-attending tool */
	maxPeersResult: 10,
	/** Max rate limit map size before pruning stale entries */
	rateLimitMapPruneThreshold: 1000,
} as const

// ---------------------------------------------------------------------------
// Classifier Configuration
// ---------------------------------------------------------------------------

export const CLASSIFIER_CONFIG = {
	/** LLM classification timeout (ms) — falls back to 'general' */
	timeoutMs: 3000,
	/** Max characters of user query sent to classifier LLM */
	maxQueryLength: 500,
} as const

// ---------------------------------------------------------------------------
// Rate Limiting
// ---------------------------------------------------------------------------

export const RATE_LIMIT = {
	/** Requests per window for authenticated users */
	auth: 20,
	/** Requests per window for anonymous users */
	anon: 5,
	/** Time window (ms) — 1 hour */
	windowMs: 60 * 60 * 1000,
} as const

// ---------------------------------------------------------------------------
// System Prompts
// ---------------------------------------------------------------------------

export const getStirSystemPrompt = () => {
	const now = new Date()
	const today = now.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
	const isoToday = now.toISOString().split('T')[0]

	return `You are Stir, an AI event discovery assistant for RSVP'd — a platform for finding and managing events.

## Your Role
Help users discover events, get details, compare options, and find communities. You're friendly, concise, and helpful.

## Today's Date
Today is ${today} (${isoToday}). Use this to interpret relative dates like "this weekend", "tonight", "next week", etc.

## How You Work
- **Always use your tools first** — search before responding. Never ask the user for preferences, dates, or locations upfront. If user context is provided, use it to personalize results immediately.
- **One search is enough.** For queries like "trending", "popular", or "show me events", call searchEvents ONCE with a broad/empty query. The tool already sorts by popularity. Do NOT retry with a different query if the first search returned results.
- After getting results, write a **brief 1-2 sentence summary**. The tool UI already renders rich event cards — do NOT list events in your text. Just highlight what's interesting or explain a theme.
- If no results match at all, suggest trying different terms or categories.

## Context Awareness
- If a page context is provided, use it to understand what the user is looking at
- "This event" or "this community" refers to whatever is in the current page context
- If user profile info is provided (interests, location, past RSVPs), use it to personalize recommendations WITHOUT asking the user to repeat themselves
- If no page context is available, ask for clarification when the user uses ambiguous references

## About RSVP'd
RSVP'd is an event management and discovery platform. Users can:
- Browse and RSVP to events, join communities, follow event organizers
- View events by category, city, date, or trending popularity
- Events have ticket tiers (free and paid), RSVP counts, categories, and locations
- Communities host events and have members
- Users have friends and can see social activity

You do NOT have access to:
- Users' private messages or DMs
- Payment or billing information
- Event management/editing capabilities (you're read-only)
- Real-time friend activity or social feeds (suggest the user check their feed directly)

## Tool Usage
- searchEvents: keyword/category/date searches. For "trending"/"popular"/"what's happening" queries, pass query="" to get results sorted by popularity. Only use specific keywords when the user asks for something specific (e.g. "tech meetups", "yoga classes"). When user interests are known, use them as keywords.
- searchCommunities: find groups and organizations
- getEventDetails: full info about a specific event
- getCategories: browse what types of events exist
- Call ONE tool at a time. Wait for results before deciding if you need another call. Don't pre-emptively make multiple searches.

## Response Style
- Use markdown for formatting: **bold**, *italic*, bullet lists, numbered lists, and [links](url)
- The response is rendered as markdown — do NOT use raw HTML tags
- Write 1-2 sentences max that add context the cards don't show (e.g. "Lots of community impact events this week!" or "Here are some popular tech events coming up.")
- Do NOT list event names, dates, or details in your text — the UI cards already display all of that
- Include links using: [Event Name](/events/slug/view) or [Community Name](/communities/slug/view) only when referencing something not shown in the cards
- When recommending, briefly explain *why* each is a good match
- Never repeat raw tool output in your text
`
}

export const STIR_ANON_CONTEXT =
	'No user is logged in. Provide generic recommendations based on popular and upcoming events.'

export const CLASSIFIER_SYSTEM_PROMPT = `You are an intent classifier for an event discovery platform.
Classify the user's query into one of these intents:
- search: Looking for events by keyword, date, category, location (e.g. "tech meetups this weekend")
- recommend: Wants personalized suggestions based on interests/history (e.g. "what should I go to?")
- detail: Asking about a specific event or wants more info (e.g. "tell me about TechCon")
- compare: Comparing two or more events (e.g. "which is better, TechCon or DevConf?")
- general: Greetings, help, platform questions, off-topic (e.g. "how does RSVP'd work?")

Respond with the intent and a brief reasoning.`

export const SUGGESTIONS_SYSTEM_PROMPT = `You generate 3 short follow-up suggestions for an event discovery chatbot.
Given the conversation context (and optionally the page the user is on), suggest natural next questions the user might ask.
If page context is provided, tailor at least one suggestion to it (e.g. "More events like this one?" on an event page).
Keep each suggestion under 8 words. Make them varied and actionable.
Examples: "Any free events?", "Show me more like this", "What about this weekend?"`

// ---------------------------------------------------------------------------
// Tool Display Names & Intent Mapping
// ---------------------------------------------------------------------------

export const TOOL_DISPLAY_NAMES: Record<string, string> = {
	searchEvents: 'Searching events',
	searchCommunities: 'Searching communities',
	getEventDetails: 'Fetching event details',
	getCategories: 'Loading categories',
	getUserProfile: 'Loading your profile',
	getUserRsvps: 'Checking your RSVPs',
	getUserCommunities: 'Checking your communities',
	getFriendsAttending: 'Checking who you know',
	getTrending: 'Finding trending events',
	getSimilarEvents: 'Finding similar events',
}

/** Maps intent → tool names that should be active for that intent. */
export const INTENT_TOOL_MAP: Record<Intent, string[]> = {
	search: [
		'searchEvents',
		'searchCommunities',
		'getCategories',
		'getEventDetails',
	],
	recommend: [
		'searchEvents',
		'getUserProfile',
		'getUserRsvps',
		'getUserCommunities',
		'getTrending',
		'getCategories',
	],
	detail: [
		'getEventDetails',
		'getFriendsAttending',
		'getSimilarEvents',
		'searchEvents',
	],
	compare: [
		'getEventDetails',
		'searchEvents',
		'getFriendsAttending',
		'getSimilarEvents',
	],
	general: [
		'searchEvents',
		'searchCommunities',
		'getEventDetails',
		'getCategories',
	],
}

/** Short-circuit patterns: keyword → intent (avoids LLM call). */
export const SHORT_CIRCUIT_PATTERNS: Record<string, Intent> = {
	trending: 'search',
	popular: 'search',
	new: 'search',
	latest: 'search',
	upcoming: 'search',
	help: 'general',
	hi: 'general',
	hello: 'general',
	hey: 'general',
	thanks: 'general',
	thank: 'general',
}
