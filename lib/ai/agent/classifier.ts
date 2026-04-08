import { generateText, Output } from 'ai'
import { getModel } from '@/lib/ai'
import {
	CLASSIFIER_CONFIG,
	CLASSIFIER_SYSTEM_PROMPT,
	SHORT_CIRCUIT_PATTERNS,
} from './constants'
import type { IntentClassification, PageContext } from './types'
import { intentSchema } from './types'

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
				intent: match,
				reasoning: `Short-circuit: "${words[0]}" matches ${match} pattern`,
			}
		}
	}

	// Truncate very long queries before sending to LLM
	const truncated =
		trimmed.length > CLASSIFIER_CONFIG.maxQueryLength
			? trimmed.slice(0, CLASSIFIER_CONFIG.maxQueryLength)
			: trimmed

	// LLM classification with timeout
	try {
		const result = await Promise.race([
			generateText({
				model: getModel('fast'),
				output: Output.object({ schema: intentSchema }),
				system: CLASSIFIER_SYSTEM_PROMPT,
				prompt: truncated,
			}),
			new Promise<never>((_, reject) =>
				setTimeout(
					() => reject(new Error('Classification timeout')),
					CLASSIFIER_CONFIG.timeoutMs
				)
			),
		])

		if (result.output === undefined) {
			return {
				intent: 'general',
				reasoning: 'Fallback: no structured output',
			}
		}
		return result.output
	} catch (error) {
		console.error('[stir-classifier] Classification failed:', error)
		return { intent: 'general', reasoning: 'Fallback: classification failed' }
	}
}
