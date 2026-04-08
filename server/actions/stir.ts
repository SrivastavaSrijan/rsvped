'use server'

import { generateText, Output } from 'ai'
import { getModel, isAvailable } from '@/lib/ai'
import {
	AGENT_CONFIG,
	SUGGESTIONS_SYSTEM_PROMPT,
} from '@/lib/ai/agent/constants'
import {
	PAGE_CONTEXT_PAGES,
	type PageContext,
	suggestionsSchema,
} from '@/lib/ai/agent/types'
import { getAPI } from '@/server/api'

export async function getAutocompleteAction(query: string, limit = 8) {
	if (!query.trim()) return []
	const api = await getAPI()
	return api.stir.autocomplete({ query, limit })
}

function buildFallbackSuggestions(
	context: string,
	pageContext?: PageContext
): string[] {
	const text = context.toLowerCase()
	const suggestions: string[] = []

	switch (pageContext?.page) {
		case PAGE_CONTEXT_PAGES.EVENT_DETAIL:
			suggestions.push('Show similar events')
			suggestions.push('Any free options like this?')
			break
		case PAGE_CONTEXT_PAGES.COMMUNITY:
			suggestions.push('What other communities are similar?')
			suggestions.push('Any events from this community?')
			break
		default:
			break
	}

	if (text.includes('weekend') || text.includes('tonight')) {
		suggestions.push('What about next weekend?')
	}

	if (text.includes('free') || text.includes('budget')) {
		suggestions.push('Any popular free events?')
	}

	if (text.includes('community')) {
		suggestions.push('Show communities hosting these events')
	}

	if (text.includes('trending') || text.includes('popular')) {
		suggestions.push('What is trending this weekend?')
	}

	if (suggestions.length === 0) {
		suggestions.push('Show me more like this')
		suggestions.push('Any free events?')
		suggestions.push('What is happening this weekend?')
	}

	return Array.from(new Set(suggestions)).slice(0, 3)
}

function buildSuggestionsPrompt(
	context: string,
	pageContext?: PageContext
): string {
	const parts: string[] = []

	if (pageContext && pageContext.page !== PAGE_CONTEXT_PAGES.GENERAL) {
		let pageHint: string
		switch (pageContext.page) {
			case PAGE_CONTEXT_PAGES.EVENT_DETAIL:
				pageHint = `User is viewing event: ${pageContext.eventSlug}`
				break
			case PAGE_CONTEXT_PAGES.COMMUNITY:
				pageHint = `User is viewing community: ${pageContext.communitySlug}`
				break
			case PAGE_CONTEXT_PAGES.USER_PROFILE:
				pageHint = `User is viewing profile: ${pageContext.username}`
				break
			case PAGE_CONTEXT_PAGES.FEED:
				pageHint = 'User is on their activity feed'
				break
			case PAGE_CONTEXT_PAGES.STIR_HOME:
				pageHint = 'User is on the Stir AI chat page'
				break
			default:
				pageHint = `User is on: ${pageContext.path}`
		}

		parts.push(`[Page context: ${pageHint}]`)
	}

	parts.push(context.slice(0, AGENT_CONFIG.maxSuggestionsContext))
	return parts.join('\n\n')
}

function normalizeSuggestion(value: string): string {
	return value
		.trim()
		.replace(/^[-*\d.)\s]+/, '')
		.replace(/^"|"$/g, '')
}

function parseSuggestionsFromText(text: string): string[] {
	return text
		.split('\n')
		.map((line) => normalizeSuggestion(line))
		.filter((line) => line.length > 0)
		.slice(0, 3)
}

export async function getSuggestionsAction(
	context: string,
	pageContext?: PageContext
): Promise<string[]> {
	if (!context.trim()) return []
	if (!isAvailable()) return buildFallbackSuggestions(context, pageContext)

	try {
		const { output, text } = await generateText({
			model: getModel('fast'),
			output: Output.object({ schema: suggestionsSchema }),
			system: SUGGESTIONS_SYSTEM_PROMPT,
			prompt: buildSuggestionsPrompt(context, pageContext),
		})

		const parsedSuggestionsFromObject =
			output?.suggestions
				.map((suggestion) => normalizeSuggestion(suggestion))
				.filter((suggestion) => suggestion.length > 0)
				.slice(0, 3) ?? []

		const parsedSuggestions =
			parsedSuggestionsFromObject.length > 0
				? parsedSuggestionsFromObject
				: parseSuggestionsFromText(text)

		if (parsedSuggestions.length > 0) {
			return Array.from(new Set(parsedSuggestions)).slice(0, 3)
		}

		return []
	} catch (error) {
		console.error('getSuggestionsAction failed:', error)
		return buildFallbackSuggestions(context, pageContext)
	}
}
