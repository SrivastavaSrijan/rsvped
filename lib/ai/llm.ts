/**
 * LLM Service - Application Level
 *
 * Uses Vercel AI SDK with Anthropic Claude for structured output,
 * text generation, and streaming.
 */

import { createAnthropic } from '@ai-sdk/anthropic'
import { generateObject, generateText } from 'ai'
import type { z } from 'zod'

/**
 * Application-specific error for LLM operations
 */
export class LLMError extends Error {
	constructor(
		message: string,
		public operation: string,
		public isRetriable = true,
		public cause?: Error
	) {
		super(message)
		this.name = 'LLMError'
	}
}

const MODEL_ID = 'claude-sonnet-4-20250514'

function getProvider() {
	const apiKey = process.env.ANTHROPIC_API_KEY
	if (!apiKey) return null
	return createAnthropic({ apiKey })
}

/**
 * Generate structured output from LLM using a Zod schema.
 * The AI SDK handles JSON parsing and validation automatically.
 */
export async function generate<T>(
	prompt: string,
	systemPrompt: string,
	schema: z.ZodSchema<T>,
	operation: string
): Promise<T> {
	const provider = getProvider()
	if (!provider) {
		throw new LLMError('Anthropic API key not configured', operation)
	}

	try {
		const { object } = await generateObject({
			model: provider(MODEL_ID),
			schema,
			system: systemPrompt,
			prompt,
		})
		return object
	} catch (error) {
		throw new LLMError(
			`LLM generation failed: ${(error as Error).message}`,
			operation,
			true,
			error as Error
		)
	}
}

/**
 * Generate plain text from LLM (for streaming fallback / simple cases).
 */
export async function generatePlainText(
	prompt: string,
	systemPrompt: string,
	operation: string
): Promise<string> {
	const provider = getProvider()
	if (!provider) {
		throw new LLMError('Anthropic API key not configured', operation)
	}

	try {
		const { text } = await generateText({
			model: provider(MODEL_ID),
			system: systemPrompt,
			prompt,
		})
		return text
	} catch (error) {
		throw new LLMError(
			`LLM generation failed: ${(error as Error).message}`,
			operation,
			true,
			error as Error
		)
	}
}

/**
 * Check if LLM is available and configured
 */
export function isAvailable(): boolean {
	return !!process.env.ANTHROPIC_API_KEY
}

/**
 * Get the Anthropic provider instance (for route handlers that need streaming).
 */
export function getModel() {
	const provider = getProvider()
	if (!provider) {
		throw new LLMError('Anthropic API key not configured', 'getModel')
	}
	return provider(MODEL_ID)
}
