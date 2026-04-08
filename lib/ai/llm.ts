/**
 * LLM Service - Application Level
 *
 * Uses Vercel AI SDK with Anthropic Claude for structured output,
 * text generation, and streaming.
 */

import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText, Output } from 'ai'
import type { z } from 'zod'
import type { ModelTier } from './agent/constants'
import { MODEL_OPTIONS } from './agent/constants'

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

export type { ModelTier }

function getProvider() {
	const apiKey = process.env.ANTHROPIC_API_KEY
	if (!apiKey) return null
	return createAnthropic({ apiKey })
}

/**
 * Generate structured output from LLM using a Zod schema.
 * Uses generateText with Output.object for structured output.
 */
export async function generate<T>(
	prompt: string,
	systemPrompt: string,
	schema: z.ZodSchema<T>,
	operation: string,
	tier: ModelTier = 'quality'
): Promise<T> {
	const provider = getProvider()
	if (!provider) {
		throw new LLMError('Anthropic API key not configured', operation)
	}

	try {
		const { output: object } = await generateText({
			model: provider(MODEL_OPTIONS[tier].id),
			output: Output.object({ schema }),
			system: systemPrompt,
			prompt,
		})
		if (object === undefined) {
			throw new Error('No structured output generated')
		}
		return object
	} catch (error) {
		const cause = error instanceof Error ? error : new Error(String(error))
		throw new LLMError(
			`LLM generation failed: ${cause.message}`,
			operation,
			true,
			cause
		)
	}
}

/**
 * Generate plain text from LLM (for streaming fallback / simple cases).
 */
export async function generatePlainText(
	prompt: string,
	systemPrompt: string,
	operation: string,
	tier: ModelTier = 'quality'
): Promise<string> {
	const provider = getProvider()
	if (!provider) {
		throw new LLMError('Anthropic API key not configured', operation)
	}

	try {
		const { text } = await generateText({
			model: provider(MODEL_OPTIONS[tier].id),
			system: systemPrompt,
			prompt,
		})
		return text
	} catch (error) {
		const cause = error instanceof Error ? error : new Error(String(error))
		throw new LLMError(
			`LLM generation failed: ${cause.message}`,
			operation,
			true,
			cause
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
 * Get the Anthropic model instance for streaming.
 */
export function getModel(tier: ModelTier = 'quality') {
	const provider = getProvider()
	if (!provider) {
		throw new LLMError('Anthropic API key not configured', 'getModel')
	}
	return provider(MODEL_OPTIONS[tier].id)
}
