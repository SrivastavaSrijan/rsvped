/**
 * Claude Batch API Client
 *
 * Submits all generation requests in a single batch, polls for completion,
 * and parses structured output via tool_use. 50% cheaper than real-time,
 * no rate limit pressure.
 */

import Anthropic from '@anthropic-ai/sdk'
import { toJSONSchema, type z } from 'zod'
import { logger } from '../utils'

const MODEL_ID = 'claude-haiku-4-5-20251001'
const POLL_INTERVAL_MS = 5_000
const MAX_POLL_MINUTES = 30

// Batch API pricing (50% discount over real-time)
const BATCH_INPUT_COST_PER_M = 0.4
const BATCH_OUTPUT_COST_PER_M = 2.0

export interface BatchRequest {
	customId: string
	system: string
	prompt: string
}

export interface BatchResult<T> {
	customId: string
	data: T | null
	error?: string
	inputTokens: number
	outputTokens: number
}

let totalBatchCostUsd = 0

export function getBatchTotalCost(): number {
	return totalBatchCostUsd
}

export function resetBatchCost(): void {
	totalBatchCostUsd = 0
}

/**
 * Submit a batch of LLM requests, wait for completion, parse results.
 *
 * Each request shares the same output schema (tool definition).
 * Returns parsed results keyed by customId.
 */
export async function submitBatch<T>(
	requests: BatchRequest[],
	schema: z.ZodSchema<T>,
	label: string
): Promise<BatchResult<T>[]> {
	if (requests.length === 0) return []

	const client = new Anthropic()

	// Convert Zod → JSON Schema for tool definition (Zod v4 built-in)
	const rawJsonSchema = toJSONSchema(schema)
	// Strip $schema key — Anthropic doesn't accept it in tool input_schema
	const { $schema: _, ...inputSchema } = rawJsonSchema as Record<
		string,
		unknown
	>

	const batchRequests = requests.map((r) => ({
		custom_id: r.customId,
		params: {
			model: MODEL_ID,
			max_tokens: 8192 as const,
			system: r.system,
			messages: [{ role: 'user' as const, content: r.prompt }],
			tool_choice: { type: 'any' as const },
			tools: [
				{
					name: 'output',
					description: `Generate structured ${label} data`,
					input_schema: inputSchema as Anthropic.Messages.Tool.InputSchema,
				},
			],
		},
	}))

	logger.info(`Submitting batch: ${label}`, { requests: requests.length })

	const batch = await client.messages.batches.create({
		requests: batchRequests,
	})
	logger.info(`Batch created: ${batch.id}`)

	// Poll until complete
	const deadline = Date.now() + MAX_POLL_MINUTES * 60 * 1000
	let status = batch
	while (status.processing_status !== 'ended') {
		if (Date.now() > deadline) {
			await client.messages.batches.cancel(batch.id)
			throw new Error(
				`Batch ${batch.id} timed out after ${MAX_POLL_MINUTES} minutes`
			)
		}
		await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
		status = await client.messages.batches.retrieve(batch.id)
		const c = status.request_counts
		logger.info(
			`[${label}] ${c.succeeded + c.errored}/${requests.length} done (${c.errored} errors)`
		)
	}

	logger.info(`Batch complete: ${batch.id}`, {
		succeeded: status.request_counts.succeeded,
		errored: status.request_counts.errored,
		expired: status.request_counts.expired,
	})

	// Collect results
	const results: BatchResult<T>[] = []
	const decoder = await client.messages.batches.results(batch.id)

	for await (const item of decoder) {
		if (item.result.type === 'succeeded') {
			const msg = item.result.message
			const toolBlock = msg.content.find(
				(b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use'
			)

			const inTok = msg.usage?.input_tokens ?? 0
			const outTok = msg.usage?.output_tokens ?? 0
			const cost =
				(inTok / 1e6) * BATCH_INPUT_COST_PER_M +
				(outTok / 1e6) * BATCH_OUTPUT_COST_PER_M
			totalBatchCostUsd += cost

			if (toolBlock) {
				try {
					const parsed = schema.parse(toolBlock.input)
					results.push({
						customId: item.custom_id,
						data: parsed,
						inputTokens: inTok,
						outputTokens: outTok,
					})
				} catch (e) {
					logger.warn(`Parse failed for ${item.custom_id}`, {
						error: String(e),
					})
					results.push({
						customId: item.custom_id,
						data: null,
						error: String(e),
						inputTokens: inTok,
						outputTokens: outTok,
					})
				}
			} else {
				results.push({
					customId: item.custom_id,
					data: null,
					error: 'No tool_use block in response',
					inputTokens: inTok,
					outputTokens: outTok,
				})
			}
		} else {
			results.push({
				customId: item.custom_id,
				data: null,
				error: item.result.type,
				inputTokens: 0,
				outputTokens: 0,
			})
		}
	}

	const succeeded = results.filter((r) => r.data !== null).length
	logger.info(`[${label}] ${succeeded}/${results.length} parsed successfully`, {
		cost: `$${totalBatchCostUsd.toFixed(4)}`,
	})

	return results
}
