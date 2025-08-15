/**
 * LLM Service
 *
 * Production-ready LLM integration with proper error handling and retry logic.
 */

import { Together } from 'together-ai'
import { z } from 'zod'
import { config } from '../config'
import { SeedError, withRetry } from '../errors'
import { logger } from '../logger'

export class LLMService {
	private client?: Together
	private model = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
	private maxTokens = 8000 // Increased for richer data
	private temperature = 0.7

	constructor() {
		if (!config.USE_LLM) {
			logger.warn('LLM is disabled via configuration')
			return
		}

		const apiKey = process.env.TOGETHER_API_KEY
		if (!apiKey) {
			throw new SeedError(
				'TOGETHER_API_KEY environment variable is required',
				'llm-init'
			)
		}

		this.client = new Together({ apiKey })
	}

	/**
	 * Convert Zod schema to JSON schema for Together API
	 */
	private zodToJsonSchema(schema: z.ZodSchema): Record<string, unknown> {
		if (!schema) return {}

		try {
			// Use built-in Zod function if available
			// biome-ignore lint/suspicious/noExplicitAny: checking for zod extension
			if (typeof (z as any).toJSONSchema === 'function') {
				// biome-ignore lint/suspicious/noExplicitAny: calling zod extension
				return (z as any).toJSONSchema(schema)
			}

			// Simplified implementation for basic schemas
			return { type: 'object' }
		} catch (error) {
			logger.error('Error converting Zod schema to JSON schema', { error })
			return { type: 'object' }
		}
	}

	/**
	 * Call LLM with retry logic and proper error handling
	 */
	async generate<T>(
		prompt: string,
		systemPrompt: string,
		schema: z.ZodSchema<T>,
		operation: string
	): Promise<T> {
		if (!config.USE_LLM) {
			throw new SeedError('LLM is disabled via configuration', operation)
		}

		if (!this.client) {
			throw new SeedError('LLM client not initialized', operation)
		}

		const jsonSchema = this.zodToJsonSchema(schema)

		return withRetry(
			async () => {
				logger.debug('LLM generation attempt', { operation })

				if (!this.client) {
					throw new SeedError('LLM client not initialized', operation)
				}

				const response = await this.client.chat.completions.create({
					model: this.model,
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: prompt },
					],
					response_format: { type: 'json_object', schema: jsonSchema },
					max_tokens: this.maxTokens,
					temperature: this.temperature,
				})

				const content = response.choices[0]?.message?.content
				if (!content) {
					throw new SeedError('Empty response from LLM', operation)
				}

				let parsed: unknown
				try {
					parsed = JSON.parse(content)
				} catch (error) {
					throw new SeedError(
						'Failed to parse LLM response as JSON',
						operation,
						false,
						error
					)
				}

				const validation = schema.safeParse(parsed)
				if (!validation.success) {
					logger.warn('LLM response validation failed', {
						operation,
						errors: validation.error.issues,
					})
					throw new SeedError(
						`LLM response validation failed: ${validation.error.issues
							.map((i) => `${i.path.join('.')}: ${i.message}`)
							.join(', ')}`,
						operation
					)
				}

				logger.info('LLM generation successful', { operation })
				return validation.data
			},
			operation,
			{
				maxRetries: 3,
				backoffMs: 2000,
			}
		)
	}

	/**
	 * Check if LLM is available and configured
	 */
	isAvailable(): boolean {
		return config.USE_LLM && !!process.env.TOGETHER_API_KEY
	}
}

// Export singleton instance
export const llm = new LLMService()
