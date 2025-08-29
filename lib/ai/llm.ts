/**
 * LLM Service - Application Level
 *
 * Production-ready LLM integration for server actions and application features.
 * Extracted from seed system with enhancements for broader application use.
 */

import { Together } from 'together-ai'
import { z } from 'zod'

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

/**
 * LLM Service configuration
 */
const LLM_CONFIG = {
	model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
	maxTokens: 10000,
	temperature: 0.7,
	maxRetries: 3,
	baseDelayMs: 1000,
} as const

/**
 * Retry utility with exponential backoff
 */
async function withRetry<T>(
	operation: () => Promise<T>,
	operationName: string,
	maxRetries = LLM_CONFIG.maxRetries
): Promise<T> {
	let lastError: Error | undefined

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await operation()
		} catch (error) {
			lastError = error as Error

			if (attempt === maxRetries) break

			// Don't retry on validation errors
			if (error instanceof LLMError && !error.isRetriable) {
				throw error
			}

			const delay = LLM_CONFIG.baseDelayMs * 2 ** attempt
			console.warn(
				`LLM operation ${operationName} failed (attempt ${attempt + 1}), retrying in ${delay}ms`,
				error
			)
			await new Promise((resolve) => setTimeout(resolve, delay))
		}
	}

	throw new LLMError(
		`LLM operation failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
		operationName,
		false,
		lastError
	)
}

/**
 * Convert Zod schema to JSON schema for Together API
 */
function zodToJsonSchema(schema: z.ZodSchema): Record<string, unknown> {
	try {
		return z.toJSONSchema(schema)
	} catch (error) {
		console.error('Error converting Zod schema to JSON schema', error)
		return { type: 'object' }
	}
}

/**
 * LLM Service for application use
 */
export class LLMService {
	private client: Together | null = null
	private apiKey: string | null = null

	constructor() {
		const apiKey = process.env.TOGETHER_API_KEY
		if (apiKey) {
			this.apiKey = apiKey
			this.client = new Together({ apiKey })
		}
	}

	/**
	 * Generate structured content using LLM
	 */
	async generate<T>(
		prompt: string,
		systemPrompt: string,
		schema: z.ZodSchema<T>,
		operation: string
	): Promise<T> {
		const jsonSchema = zodToJsonSchema(schema)

		return withRetry(async () => {
			if (!this.client) {
				throw new LLMError('LLM client is not initialized', operation)
			}
			const response = await this.client.chat.completions.create({
				model: LLM_CONFIG.model,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: prompt },
				],
				response_format: { type: 'json_object', schema: jsonSchema },
				max_tokens: LLM_CONFIG.maxTokens,
				temperature: LLM_CONFIG.temperature,
			})

			const content = response.choices[0]?.message?.content
			if (!content) {
				throw new LLMError('Empty response from LLM', operation)
			}

			let parsed: unknown
			try {
				parsed = JSON.parse(content)
			} catch (error) {
				throw new LLMError(
					'Failed to parse LLM response as JSON',
					operation,
					false,
					error as Error
				)
			}

			const validation = schema.safeParse(parsed)
			if (!validation.success) {
				const errorMessage = validation.error.issues
					.map((i) => `${i.path.join('.')}: ${i.message}`)
					.join(', ')

				throw new LLMError(
					`LLM response validation failed: ${errorMessage}`,
					operation,
					false
				)
			}

			return validation.data
		}, operation)
	}

	/**
	 * Check if LLM is available and configured
	 */
	isAvailable(): boolean {
		return !!process.env.TOGETHER_API_KEY
	}
}

// Export singleton instance
export const llm = new LLMService()
