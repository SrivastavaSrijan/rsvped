import { generateObject } from 'ai'
import { z } from 'zod'
import { getModel } from '@/lib/ai'
import { SHORT_CIRCUIT_PATTERNS } from './constants'
import type { IntentClassification, PageContext } from './types'
import { INTENTS } from './types'

const CLASSIFIER_TIMEOUT_MS = 3000
const MAX_QUERY_LENGTH = 500

const intentSchema = z.object({
	intent: z.enum(INTENTS),
	reasoning: z.string(),
})

const CLASSIFIER_SYSTEM_PROMPT = `You are an intent classifier for an event discovery platform.
Classify the user's query into one of these intents:
- search: Looking for events by keyword, date, category, location (e.g. "tech meetups this weekend")
- recommend: Wants personalized suggestions based on interests/history (e.g. "what should I go to?")
- detail: Asking about a specific event or wants more info (e.g. "tell me about TechCon")
- compare: Comparing two or more events (e.g. "which is better, TechCon or DevConf?")
- general: Greetings, help, platform questions, off-topic (e.g. "how does RSVP'd work?")

Respond with the intent and a brief reasoning.`

/**
 * Classify user intent from query text.
 * Uses short-circuit patterns for common single-word queries,
 * falls back to LLM classification with a timeout.
 */
export async function classifyIntent(
	query: string,
	_pageContext?: PageContext
): Promise<IntentClassification> {
	const trimmed = query.trim()

	// Empty or whitespace-only → general
	if (trimmed.length === 0) {
		return { intent: 'general', reasoning: 'Empty query' }
	}

	// Short-circuit: single-word or very short queries matching known patterns
	const words = trimmed.toLowerCase().split(/\s+/)
	if (words.length <= 2) {
		const match = SHORT_CIRCUIT_PATTERNS[words[0]]
		if (match) {
			return {
				intent: match as IntentClassification['intent'],
				reasoning: `Short-circuit: "${words[0]}" matches ${match} pattern`,
			}
		}
	}

	// Truncate very long queries before sending to LLM
	const truncated =
		trimmed.length > MAX_QUERY_LENGTH
			? trimmed.slice(0, MAX_QUERY_LENGTH)
			: trimmed

	// LLM classification with timeout
	try {
		const result = await Promise.race([
			generateObject({
				model: getModel(),
				schema: intentSchema,
				system: CLASSIFIER_SYSTEM_PROMPT,
				prompt: truncated,
			}),
			new Promise<never>((_, reject) =>
				setTimeout(
					() => reject(new Error('Classification timeout')),
					CLASSIFIER_TIMEOUT_MS
				)
			),
		])

		return result.object
	} catch (error) {
		console.error('[stir-classifier] Classification failed:', error)
		return { intent: 'general', reasoning: 'Fallback: classification failed' }
	}
}
