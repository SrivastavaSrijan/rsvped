/**
 * AI Action Utilities
 *
 * Centralized utilities for AI actions including error handling, validation, and helpers.
 * Following the pattern established in the seed system.
 */

import type { z } from 'zod'
import { LLMError } from '@/lib/ai/llm'
import type { AIActionState } from '../types'
import { AIActionErrorCode, createAIErrorResponse } from '../types'

/**
 * Validation utilities
 */
export const ValidationUtils = {
	/**
	 * Validate prompt input for safety and length
	 */
	validatePrompt: (prompt: string): AIActionErrorCode | null => {
		if (!prompt || prompt.trim().length === 0) {
			return AIActionErrorCode.INVALID_PROMPT
		}

		if (prompt.length > 5000) {
			// AI_CONFIG.MAX_PROMPT_LENGTH
			return AIActionErrorCode.PROMPT_TOO_LONG
		}

		// Basic content safety checks
		const unsafePatterns = [
			/\b(kill|murder|suicide|bomb|terrorist)\b/i,
			/\b(nude|porn|sexual|explicit)\b/i,
		]

		if (unsafePatterns.some((pattern) => pattern.test(prompt))) {
			return AIActionErrorCode.UNSAFE_CONTENT
		}

		return null
	},

	/**
	 * Process form data with validation
	 */
	processFormData: <T>(
		formData: FormData,
		schema: z.ZodSchema<T>
	):
		| { success: true; data: T }
		| { success: false; errors: Record<string, string[]> } => {
		// Extract data from FormData
		const rawData: Record<string, unknown> = {}

		for (const [key, value] of formData.entries()) {
			if (value === '') {
				continue // Skip empty strings to let schema handle optional fields
			}
			rawData[key] = value
		}

		const validation = schema.safeParse(rawData)

		if (!validation.success) {
			const fieldErrors = validation.error.issues.reduce(
				(acc: Record<string, string[]>, issue: z.ZodIssue) => {
					const field = issue.path[0] as string
					if (!acc[field]) acc[field] = []
					acc[field].push(issue.message)
					return acc
				},
				{}
			)
			return { success: false, errors: fieldErrors }
		}

		return { success: true, data: validation.data }
	},
}

/**
 * Error handling utilities
 */
export const ErrorUtils = {
	/**
	 * Map LLM errors to AI action error codes
	 */
	mapLLMError: (error: LLMError): AIActionErrorCode => {
		const errorCodeMap: Record<string, AIActionErrorCode> = {
			'generate-event-titles': AIActionErrorCode.LLM_GENERATION_FAILED,
			'generate-event-description': AIActionErrorCode.LLM_GENERATION_FAILED,
			'enhance-event-description': AIActionErrorCode.LLM_GENERATION_FAILED,
			LLM_TIMEOUT: AIActionErrorCode.LLM_TIMEOUT,
			LLM_GENERATION_FAILED: AIActionErrorCode.LLM_GENERATION_FAILED,
			LLM_RATE_LIMIT: AIActionErrorCode.LLM_RATE_LIMIT,
		}

		return (
			errorCodeMap[error.operation] || AIActionErrorCode.LLM_GENERATION_FAILED
		)
	},

	/**
	 * Create standardized error response
	 */
	createErrorResponse: (
		error: unknown,
		operation: string,
		fieldErrors?: Record<string, string[]>
	): AIActionState => {
		console.error(`Error in AI operation ${operation}:`, error)

		if (error instanceof LLMError) {
			const errorCode = ErrorUtils.mapLLMError(error)
			return createAIErrorResponse(errorCode, fieldErrors)
		}

		return createAIErrorResponse(AIActionErrorCode.UNKNOWN_ERROR, fieldErrors)
	},
}

/**
 * Response formatting utilities
 */
export const ResponseUtils = {
	/**
	 * Create success response with generated content
	 */
	createSuccessResponse: <T>(
		data: T,
		generatedContent?: string,
		message = 'AI generation completed successfully'
	): AIActionState => ({
		success: true,
		data,
		generatedContent,
		message,
		errorCode: null,
	}),

	/**
	 * Create validation error response
	 */
	createValidationErrorResponse: (
		fieldErrors: Record<string, string[]>
	): AIActionState =>
		createAIErrorResponse(AIActionErrorCode.VALIDATION_ERROR, fieldErrors),
}
