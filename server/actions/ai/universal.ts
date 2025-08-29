'use server'

import { z } from 'zod'
import { llm } from '@/lib/ai/llm'
import { AIErrorCodes } from '../types'
import { Prompts } from './prompts'

const SuggestionsSchema = z.object({
	suggestions: z.array(z.string().min(1).max(200)).min(1).max(5),
})

const TextResponseSchema = z.object({
	text: z.string().min(1),
})

type AIContext = {
	// Must-have context - simplified to strings
	domain: string
	page: string
	field: string
	location?: string
	category?: string
	// Additional flexible metadata
	metadata?: Record<string, unknown>
}

/**
 * Generate suggestions based on user-provided prompt with context
 */
export async function generateSuggestions(
	userPrompt: string,
	context: AIContext
) {
	try {
		if (!userPrompt?.trim()) {
			return {
				success: false,
				error: AIErrorCodes.INVALID_INPUT,
			}
		}

		if (!llm.isAvailable()) {
			return {
				success: false,
				error: AIErrorCodes.AI_UNAVAILABLE,
			}
		}

		// Build contextual prompt with context info
		const contextualPrompt = `${userPrompt}

Context:
- Domain: ${context.domain}
- Page: ${context.page}
- Field: ${context.field}
${context.location ? `- Location: ${context.location}` : ''}
${context.category ? `- Category: ${context.category}` : ''}
${context.metadata ? `- Additional context: ${JSON.stringify(context.metadata)}` : ''}`

		const systemPrompt = Prompts.System.suggestions(context.domain)

		const result = await llm.generate(
			contextualPrompt,
			systemPrompt,
			SuggestionsSchema,
			'generate-custom-suggestions'
		)

		return {
			success: true,
			data: { suggestions: result.suggestions },
		}
	} catch (error) {
		console.error('generateCustomSuggestions error:', error)
		return {
			success: false,
			error: AIErrorCodes.SERVER_ERROR,
		}
	}
}

/**
 * Enhance text using predefined enhancement prompts
 */
export async function enhanceText(
	text: string,
	type: string,
	context?: AIContext | Record<string, unknown>,
	customPrompt?: string
) {
	try {
		if (!text?.trim()) {
			return {
				success: false,
				error: AIErrorCodes.INVALID_INPUT,
			}
		}

		if (!type?.trim()) {
			return {
				success: false,
				error: AIErrorCodes.INVALID_INPUT,
			}
		}

		if (!llm.isAvailable()) {
			return {
				success: false,
				error: AIErrorCodes.AI_UNAVAILABLE,
			}
		}

		// Map enhancement types to prompts
		const promptFn =
			Prompts.Enhancements[type as keyof typeof Prompts.Enhancements]
		if (!promptFn) {
			return {
				success: false,
				error: AIErrorCodes.INVALID_TYPE,
			}
		}

		// Generate the prompt using our templates
		const prompt =
			type === 'custom' && customPrompt
				? (promptFn as typeof Prompts.Enhancements.custom)(
						text,
						customPrompt,
						context
					)
				: (promptFn as typeof Prompts.Enhancements.concise)(text, context)

		const domain = (context as AIContext)?.domain || 'content'
		const systemPrompt = Prompts.System.enhancement(domain)

		const result = await llm.generate(
			prompt,
			systemPrompt,
			TextResponseSchema,
			'enhance-text'
		)

		return {
			success: true,
			data: { text: result.text },
		}
	} catch (error) {
		console.error('Error enhancing text:', error)
		return {
			success: false,
			error: AIErrorCodes.SERVER_ERROR,
		}
	}
}
