/**
 * AI Server Actions - Types and Constants
 *
 * Shared types, error handling, and constants for AI-powered server actions.
 */

import type { ServerActionResponse } from '../types'

/**
 * AI-specific error codes
 */
export enum AIActionErrorCode {
	// LLM Service Errors
	LLM_UNAVAILABLE = 'LLM_UNAVAILABLE',
	LLM_GENERATION_FAILED = 'LLM_GENERATION_FAILED',
	LLM_TIMEOUT = 'LLM_TIMEOUT',
	LLM_RATE_LIMIT = 'LLM_RATE_LIMIT',

	// Input Validation Errors
	INVALID_PROMPT = 'INVALID_PROMPT',
	PROMPT_TOO_LONG = 'PROMPT_TOO_LONG',
	UNSAFE_CONTENT = 'UNSAFE_CONTENT',
	VALIDATION_ERROR = 'VALIDATION_ERROR',

	// Business Logic Errors
	INSUFFICIENT_CONTEXT = 'INSUFFICIENT_CONTEXT',
	UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
	NOT_FOUND = 'NOT_FOUND',

	// General Errors
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * User-friendly error messages for AI operations
 */
export const AIActionErrorCodeMap: Record<AIActionErrorCode, string> = {
	[AIActionErrorCode.LLM_UNAVAILABLE]:
		'AI features are temporarily unavailable. Please try again later.',
	[AIActionErrorCode.LLM_GENERATION_FAILED]:
		'Failed to generate AI response. Please try again.',
	[AIActionErrorCode.LLM_TIMEOUT]:
		'AI request timed out. Please try again with a shorter prompt.',
	[AIActionErrorCode.LLM_RATE_LIMIT]:
		'AI service rate limit reached. Please wait a moment and try again.',

	[AIActionErrorCode.INVALID_PROMPT]:
		'Please provide a valid prompt for AI processing.',
	[AIActionErrorCode.PROMPT_TOO_LONG]:
		'Your prompt is too long. Please shorten it and try again.',
	[AIActionErrorCode.UNSAFE_CONTENT]:
		'Content violates our safety guidelines. Please modify your request.',
	[AIActionErrorCode.VALIDATION_ERROR]:
		'Please correct the form errors and try again.',

	[AIActionErrorCode.INSUFFICIENT_CONTEXT]:
		'Not enough information provided for AI processing.',
	[AIActionErrorCode.UNSUPPORTED_OPERATION]:
		'This AI operation is not currently supported.',
	[AIActionErrorCode.NOT_FOUND]: 'The requested resource was not found.',

	[AIActionErrorCode.UNKNOWN_ERROR]:
		'An unexpected error occurred. Please try again.',
}

/**
 * AI Action State interface
 */
export interface AIActionState extends ServerActionResponse {
	errorCode: AIActionErrorCode | null
	isGenerating?: boolean
	generatedContent?: string
}

/**
 * Initial state for AI actions
 */
export const initialAIActionState: AIActionState = {
	success: false,
	fieldErrors: {},
	errorCode: null,
	isGenerating: false,
}

/**
 * AI operation configuration
 */
export const AI_CONFIG = {
	MAX_PROMPT_LENGTH: 5000,
	TIMEOUT_MS: 30000,
	MAX_RETRIES: 2,
} as const

/**
 * Helper to create AI error response
 */
export function createAIErrorResponse(
	errorCode: AIActionErrorCode,
	fieldErrors: Record<string, string[]> = {}
): AIActionState {
	return {
		success: false,
		fieldErrors,
		errorCode,
		isGenerating: false,
	}
}
