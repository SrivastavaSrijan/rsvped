/**
 * Seed Error Handling
 *
 * Production-ready error handling with recovery strategies and validation.
 */

import { z } from 'zod'
import { logger } from './logger'

// Custom error classes
export class SeedError extends Error {
	constructor(
		message: string,
		public operation: string,
		public recoverable: boolean = false,
		public originalError?: unknown
	) {
		super(message)
		this.name = 'SeedError'
	}
}

export class ValidationError extends SeedError {
	constructor(
		message: string,
		public field: string,
		originalError?: unknown
	) {
		super(
			`Validation failed for ${field}: ${message}`,
			'validation',
			false,
			originalError
		)
		this.name = 'ValidationError'
	}
}

export class FileSystemError extends SeedError {
	constructor(
		message: string,
		public filePath: string,
		originalError?: unknown
	) {
		super(
			`File system error at ${filePath}: ${message}`,
			'filesystem',
			true,
			originalError
		)
		this.name = 'FileSystemError'
	}
}

export class DatabaseError extends SeedError {
	constructor(
		message: string,
		public query?: string,
		originalError?: unknown
	) {
		super(`Database error: ${message}`, 'database', true, originalError)
		this.name = 'DatabaseError'
	}
}

export class ExternalAPIError extends SeedError {
	constructor(
		message: string,
		public service: string,
		public statusCode?: number,
		originalError?: unknown
	) {
		super(
			`External API error (${service}): ${message}`,
			'external_api',
			true,
			originalError
		)
		this.name = 'ExternalAPIError'
	}
}

// Error recovery strategies
interface RecoveryStrategy {
	maxRetries: number
	backoffMs: number
	shouldRetry: (error: unknown, attempt: number) => boolean
}

const defaultStrategy: RecoveryStrategy = {
	maxRetries: 3,
	backoffMs: 1000,
	shouldRetry: (error, attempt) => {
		if (error instanceof SeedError) {
			return error.recoverable && attempt < 3
		}
		return attempt < 2 // Be more conservative with unknown errors
	},
}

// Retry wrapper with exponential backoff
export async function withRetry<T>(
	operation: () => Promise<T>,
	operationName: string,
	strategy: Partial<RecoveryStrategy> = {}
): Promise<T> {
	const { maxRetries, backoffMs, shouldRetry } = {
		...defaultStrategy,
		...strategy,
	}

	let lastError: unknown

	for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
		try {
			if (attempt > 1) {
				const delay = backoffMs * Math.pow(2, attempt - 2)
				logger.debug(
					`Retrying ${operationName} (attempt ${attempt}) after ${delay}ms delay`
				)
				await new Promise((resolve) => setTimeout(resolve, delay))
			}

			return await operation()
		} catch (error) {
			lastError = error

			if (attempt > maxRetries || !shouldRetry(error, attempt)) {
				break
			}

			logger.warn(
				`${operationName} failed (attempt ${attempt}), retrying...`,
				error
			)
		}
	}

	// All retries exhausted
	logger.error(
		`${operationName} failed after ${maxRetries + 1} attempts`,
		lastError
	)
	throw lastError
}

// Safe file operations
export function safeReadJSON<T = unknown>(
	filePath: string,
	schema?: z.ZodSchema<T>
): T | null {
	try {
		const fs = require('node:fs')
		const content = fs.readFileSync(filePath, 'utf8')
		const data = JSON.parse(content)

		if (schema) {
			return schema.parse(data)
		}

		return data as T
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new ValidationError(
				`Invalid JSON structure in ${filePath}`,
				'file_content',
				error
			)
		}

		throw new FileSystemError(`Failed to read JSON file`, filePath, error)
	}
}

export function safeWriteJSON(filePath: string, data: unknown): void {
	try {
		const fs = require('node:fs')
		const path = require('node:path')

		// Ensure directory exists
		const dir = path.dirname(filePath)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true })
		}

		const content = JSON.stringify(data, null, 2)
		fs.writeFileSync(filePath, content, 'utf8')
	} catch (error) {
		throw new FileSystemError(`Failed to write JSON file`, filePath, error)
	}
}

// Batch processing with error isolation
export async function processBatch<T, R>(
	items: T[],
	processor: (item: T) => Promise<R>,
	batchSize: number = 10,
	operationName: string = 'batch_operation'
): Promise<{ results: R[]; errors: Array<{ item: T; error: unknown }> }> {
	const results: R[] = []
	const errors: Array<{ item: T; error: unknown }> = []

	logger.info(`Starting ${operationName}`, {
		totalItems: items.length,
		batchSize,
	})

	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize)
		const batchNum = Math.floor(i / batchSize) + 1
		const totalBatches = Math.ceil(items.length / batchSize)

		logger.debug(`Processing batch ${batchNum}/${totalBatches}`, {
			items: batch.length,
		})

		const batchPromises = batch.map(async (item) => {
			try {
				const result = await processor(item)
				return { success: true as const, result, item }
			} catch (error) {
				logger.warn(`Item processing failed in ${operationName}`, {
					item,
					error,
				})
				return { success: false as const, error, item }
			}
		})

		const batchResults = await Promise.allSettled(batchPromises)

		for (const result of batchResults) {
			if (result.status === 'fulfilled') {
				if (result.value.success) {
					results.push(result.value.result)
				} else {
					errors.push({ item: result.value.item, error: result.value.error })
				}
			} else {
				// This shouldn't happen since we're catching errors above
				logger.error(
					`Unexpected batch processing error in ${operationName}`,
					result.reason
				)
			}
		}

		// Progress update
		const processed = Math.min(batchNum * batchSize, items.length)
		const percentage = Math.round((processed / items.length) * 100)
		logger.info(`Progress: ${percentage}% (${processed}/${items.length})`)
	}

	logger.info(`Completed ${operationName}`, {
		successful: results.length,
		failed: errors.length,
		successRate: `${Math.round((results.length / items.length) * 100)}%`,
	})

	return { results, errors }
}

// Validation helpers
export function validateRequired<T>(
	value: T | null | undefined,
	fieldName: string
): T {
	if (value === null || value === undefined) {
		throw new ValidationError(`Required field is missing`, fieldName)
	}
	return value
}

export function validateFile(
	filePath: string,
	description: string = 'file'
): void {
	const fs = require('node:fs')

	if (!fs.existsSync(filePath)) {
		throw new FileSystemError(`Required ${description} not found`, filePath)
	}
}

// Global error handler for seed scripts
export function setupGlobalErrorHandler(scriptName: string) {
	process.on('unhandledRejection', (reason, promise) => {
		logger.error(`Unhandled promise rejection in ${scriptName}`, {
			reason,
			promise,
		})
		process.exit(1)
	})

	process.on('uncaughtException', (error) => {
		logger.error(`Uncaught exception in ${scriptName}`, error)
		process.exit(1)
	})
}
