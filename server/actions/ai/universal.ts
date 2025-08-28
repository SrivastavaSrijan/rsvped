'use server'

import { z } from 'zod'
import { llm } from '@/lib/ai/llm'

// Simple schemas for unstructured text responses
const SuggestionsSchema = z.object({
	suggestions: z.array(z.string()).max(5),
})

const TextResponseSchema = z.object({
	text: z.string(),
})

const RecommendationSchema = z.object({
	response: z.string(),
})

/**
 * Universal suggestion generation for AIChips component
 * Parent provides complete prompt with context
 */
export async function generateSuggestions(
	_prevState: unknown,
	formData: FormData
): Promise<{ success: boolean; suggestions?: string[]; error?: string }> {
	try {
		const prompt = formData.get('prompt') as string

		if (!prompt?.trim()) {
			return { success: false, error: 'Prompt is required' }
		}

		if (!llm.isAvailable()) {
			return { success: false, error: 'AI service unavailable' }
		}

		const result = await llm.generate(
			prompt,
			'You are a helpful writing assistant. Return suggestions as a JSON object with a "suggestions" array containing up to 5 strings.',
			SuggestionsSchema,
			'generate-suggestions'
		)

		return { success: true, suggestions: result.suggestions }
	} catch (error) {
		console.error('generateSuggestions error:', error)
		return { success: false, error: 'Failed to generate suggestions' }
	}
}

/**
 * Universal text enhancement for LLMWritingAssistant component
 * Receives text + context object, returns enhanced text
 */
export async function enhanceText(
	_prevState: unknown,
	formData: FormData
): Promise<{ success: boolean; text?: string; error?: string }> {
	try {
		const text = formData.get('text') as string
		const contextString = formData.get('context') as string
		const enhancementType = (formData.get('type') as string) || 'improve'
		const userPrompt = formData.get('userPrompt') as string

		if (!text?.trim()) {
			return { success: false, error: 'Text is required' }
		}

		if (!llm.isAvailable()) {
			return { success: false, error: 'AI service unavailable' }
		}

		let context = {}
		try {
			context = contextString ? JSON.parse(contextString) : {}
		} catch {
			// Invalid JSON, ignore context
		}

		// Build prompt based on enhancement type and optional user prompt
		let prompt = ''
		if (userPrompt) {
			prompt = `${userPrompt}\n\nText to enhance: "${text}"\n\nContext: ${JSON.stringify(context)}`
		} else {
			const enhancementMap: Record<string, string> = {
				improve: 'Improve this text to make it clearer and more engaging',
				professional: 'Make this text more professional and polished',
				casual: 'Make this text more casual and conversational',
				shorter: 'Make this text more concise while keeping the key message',
				longer: 'Expand this text with more detail and context',
				fix: 'Fix grammar, spelling, and improve readability',
			}

			const instruction =
				enhancementMap[enhancementType] || enhancementMap.improve
			prompt = `${instruction}: "${text}"\n\nContext: ${JSON.stringify(context)}\n\nReturn the enhanced text only.`
		}

		const result = await llm.generate(
			prompt,
			'You are a helpful writing assistant. Return the enhanced text as a JSON object with a "text" field.',
			TextResponseSchema,
			'enhance-text'
		)

		return { success: true, text: result.text }
	} catch (error) {
		console.error('enhanceText error:', error)
		return { success: false, error: 'Failed to enhance text' }
	}
}

/**
 * Context-aware recommendations for page-level AI assistant
 */
export async function getRecommendations(
	_prevState: unknown,
	formData: FormData
): Promise<{ success: boolean; response?: string; error?: string }> {
	try {
		const userQuestion = formData.get('question') as string
		const contextString = formData.get('context') as string

		if (!userQuestion?.trim()) {
			return { success: false, error: 'Question is required' }
		}

		if (!llm.isAvailable()) {
			return { success: false, error: 'AI service unavailable' }
		}

		let context = {}
		try {
			context = contextString ? JSON.parse(contextString) : {}
		} catch {
			// Invalid JSON, ignore context
		}

		const prompt = `User Question: ${userQuestion}\n\nPage Context: ${JSON.stringify(context)}\n\nProvide helpful recommendations based on the current page context. Be specific and actionable.`

		const result = await llm.generate(
			prompt,
			'You are a helpful assistant that provides contextual recommendations for event planning and management. Return your response as a JSON object with a "response" field.',
			RecommendationSchema,
			'get-recommendations'
		)

		return { success: true, response: result.response }
	} catch (error) {
		console.error('getRecommendations error:', error)
		return { success: false, error: 'Failed to get recommendations' }
	}
}
