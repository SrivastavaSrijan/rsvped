/**
 * LLM Service
 *
 * Claude Haiku integration via Vercel AI SDK with structured output,
 * self-healing retries, and cost tracking.
 */

import { anthropic } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import type { z } from 'zod'
import { logger } from '../utils'
import { config } from '../utils/config'
import { SeedError } from '../utils/errors'

// ---------------------------------------------------------------------------
// Cost tracking
// ---------------------------------------------------------------------------

/** Anthropic Haiku pricing (per 1M tokens) */
const HAIKU_INPUT_COST_PER_M = 0.8 // $0.80 / 1M input tokens
const HAIKU_OUTPUT_COST_PER_M = 4.0 // $4.00 / 1M output tokens

export interface CostEntry {
	operation: string
	inputTokens: number
	outputTokens: number
	costUsd: number
}

let totalCostUsd = 0
const costLog: CostEntry[] = []

function trackCost(
	operation: string,
	inputTokens: number | undefined,
	outputTokens: number | undefined
): CostEntry {
	const inp = inputTokens ?? 0
	const out = outputTokens ?? 0
	const cost =
		(inp / 1_000_000) * HAIKU_INPUT_COST_PER_M +
		(out / 1_000_000) * HAIKU_OUTPUT_COST_PER_M

	totalCostUsd += cost
	const entry: CostEntry = {
		operation,
		inputTokens: inp,
		outputTokens: out,
		costUsd: cost,
	}
	costLog.push(entry)
	return entry
}

export function getTotalCostUsd(): number {
	return totalCostUsd
}

export function getCostLog(): readonly CostEntry[] {
	return costLog
}

export function resetCostTracking(): void {
	totalCostUsd = 0
	costLog.length = 0
}

// ---------------------------------------------------------------------------
// Budget gate
// ---------------------------------------------------------------------------

function checkBudget(operation: string): void {
	const budget = config.SEED_BUDGET_USD
	if (totalCostUsd >= budget) {
		throw new SeedError(
			`Seed budget exhausted: spent $${totalCostUsd.toFixed(4)} of $${budget} budget. Stopping before ${operation}.`,
			operation
		)
	}
}

// ---------------------------------------------------------------------------
// LLM Service
// ---------------------------------------------------------------------------

const MODEL_ID = 'claude-haiku-4-5-20251001'
const MAX_SELF_HEAL_ATTEMPTS = 3

export class LLMService {
	/**
	 * Generate a structured object using Claude Haiku via Vercel AI SDK.
	 *
	 * Includes self-healing: if validation fails, the error details are
	 * injected into the next prompt for up to MAX_SELF_HEAL_ATTEMPTS.
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

		checkBudget(operation)

		let lastError: string | undefined
		for (let attempt = 1; attempt <= MAX_SELF_HEAL_ATTEMPTS; attempt++) {
			try {
				const healingContext =
					attempt > 1 && lastError
						? `\n\nPREVIOUS ATTEMPT FAILED WITH ERROR:\n${lastError}\nPlease fix the issue and try again.`
						: ''

				const result = await generateObject({
					model: anthropic(MODEL_ID),
					schema,
					system: systemPrompt,
					prompt: `${prompt}${healingContext}`,
					maxRetries: 2,
				})

				// Track cost from usage metadata
				const costEntry = trackCost(
					operation,
					result.usage.inputTokens,
					result.usage.outputTokens
				)

				logger.info(`LLM generation successful`, {
					operation,
					attempt,
					inputTokens: costEntry.inputTokens,
					outputTokens: costEntry.outputTokens,
					costUsd: `$${costEntry.costUsd.toFixed(4)}`,
					totalCostUsd: `$${totalCostUsd.toFixed(4)}`,
				})

				return result.object
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error)
				lastError = message

				logger.warn(`LLM attempt ${attempt}/${MAX_SELF_HEAL_ATTEMPTS} failed`, {
					operation,
					error: message,
				})

				if (attempt === MAX_SELF_HEAL_ATTEMPTS) {
					logger.error(
						`LLM generation failed after ${MAX_SELF_HEAL_ATTEMPTS} attempts`,
						{ operation }
					)
					throw new SeedError(
						`LLM generation failed after ${MAX_SELF_HEAL_ATTEMPTS} self-healing attempts: ${message}`,
						operation
					)
				}
			}
		}

		// TypeScript exhaustiveness — unreachable
		throw new SeedError('Unreachable', operation)
	}

	/**
	 * Check if LLM is available and configured
	 */
	isAvailable(): boolean {
		return config.USE_LLM && !!process.env.ANTHROPIC_API_KEY
	}
}

// Export singleton instance
export const llm = new LLMService()
