/**
 * Form Enhancement Actions
 *
 * Server actions for AI-powered form field suggestions and enhancements
 * specifically designed for EventForm integration.
 */

'use server'

import { llm } from '@/lib/ai/llm'
import { FormEnhancementPrompts } from '../prompts'
import { InputSchemas, ResponseSchemas } from '../schemas'
import type { AIActionState } from '../types'
import { AIActionErrorCode, createAIErrorResponse } from '../types'
import { ErrorUtils, ResponseUtils, ValidationUtils } from '../utils'

/**
 * Generate description suggestions based on event title and context
 */
export async function generateDescriptionSuggestions(
	_prevState: AIActionState,
	formData: FormData
): Promise<AIActionState> {
	try {
		const validation = ValidationUtils.processFormData(
			formData,
			InputSchemas.GenerateDescriptionSuggestions
		)
		if (!validation.success) {
			return ResponseUtils.createValidationErrorResponse(validation.errors)
		}

		const { title, existingDescription, eventType } = validation.data

		// Check LLM availability
		if (!llm.isAvailable()) {
			return createAIErrorResponse(AIActionErrorCode.LLM_UNAVAILABLE)
		}

		// Generate suggestions
		const result = await llm.generate(
			FormEnhancementPrompts.createDescriptionSuggestionsPrompt(
				title,
				existingDescription,
				eventType
			),
			FormEnhancementPrompts.DESCRIPTION_SUGGESTIONS_SYSTEM_PROMPT,
			ResponseSchemas.DescriptionSuggestions,
			'generate-description-suggestions'
		)

		return ResponseUtils.createSuccessResponse(result)
	} catch (error) {
		return ErrorUtils.createErrorResponse(
			error,
			'generate-description-suggestions'
		)
	}
}

/**
 * Suggest venue/location based on event details
 */
export async function generateLocationSuggestions(
	_prevState: AIActionState,
	formData: FormData
): Promise<AIActionState> {
	try {
		const validation = ValidationUtils.processFormData(
			formData,
			InputSchemas.GenerateLocationSuggestions
		)
		if (!validation.success) {
			return ResponseUtils.createValidationErrorResponse(validation.errors)
		}

		const { title, description, locationType } = validation.data

		if (!llm.isAvailable()) {
			return createAIErrorResponse(AIActionErrorCode.LLM_UNAVAILABLE)
		}

		const result = await llm.generate(
			FormEnhancementPrompts.createLocationSuggestionsPrompt(
				title,
				description,
				locationType
			),
			FormEnhancementPrompts.LOCATION_SUGGESTIONS_SYSTEM_PROMPT,
			ResponseSchemas.LocationSuggestions,
			'generate-location-suggestions'
		)

		return ResponseUtils.createSuccessResponse(result)
	} catch (error) {
		return ErrorUtils.createErrorResponse(
			error,
			'generate-location-suggestions'
		)
	}
}

/**
 * Suggest optimal event timing based on event details
 */
export async function generateTimingSuggestions(
	_prevState: AIActionState,
	formData: FormData
): Promise<AIActionState> {
	try {
		const validation = ValidationUtils.processFormData(
			formData,
			InputSchemas.GenerateTimingSuggestions
		)
		if (!validation.success) {
			return ResponseUtils.createValidationErrorResponse(validation.errors)
		}

		const { title, description, currentStartDate } = validation.data

		if (!llm.isAvailable()) {
			return createAIErrorResponse(AIActionErrorCode.LLM_UNAVAILABLE)
		}

		const result = await llm.generate(
			FormEnhancementPrompts.createTimingSuggestionsPrompt(
				title,
				description,
				currentStartDate
			),
			FormEnhancementPrompts.TIMING_SUGGESTIONS_SYSTEM_PROMPT,
			ResponseSchemas.TimingSuggestions,
			'generate-timing-suggestions'
		)

		return ResponseUtils.createSuccessResponse(result)
	} catch (error) {
		return ErrorUtils.createErrorResponse(error, 'generate-timing-suggestions')
	}
}
