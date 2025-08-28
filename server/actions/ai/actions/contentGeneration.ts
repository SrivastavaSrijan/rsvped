/**
 * Content Generation Actions
 *
 * Server actions for AI-powered content generation without database updates.
 * Refactored to use centralized prompts, schemas, and utilities.
 */

'use server'

import { llm } from '@/lib/ai/llm'
import { ContentGenerationPrompts } from '../prompts'
import { InputSchemas, ResponseSchemas } from '../schemas'
import type { AIActionState } from '../types'
import {
	ErrorUtils,
	OperationUtils,
	ResponseUtils,
	ValidationUtils,
} from '../utils'

/**
 * Generate event title suggestions using AI
 */
export async function generateEventTitles(
	_prevState: AIActionState,
	formData: FormData
): Promise<AIActionState> {
	try {
		// Process and validate form data
		const validation = ValidationUtils.processFormData(
			formData,
			InputSchemas.GenerateEventTitles
		)
		if (!validation.success) {
			return ResponseUtils.createValidationErrorResponse(validation.errors)
		}

		const { description, eventType, tone } = validation.data

		// Validate prompt content
		const promptError = ValidationUtils.validatePrompt(description)
		if (promptError) {
			return ResponseUtils.createValidationErrorResponse({
				description: [promptError],
			})
		}

		// Check LLM availability
		const availabilityCheck = OperationUtils.checkLLMAvailability(llm)
		if (availabilityCheck) return availabilityCheck

		// Generate content using centralized prompts
		const systemPrompt = ContentGenerationPrompts.EventTitles.system(tone)
		const userPrompt = ContentGenerationPrompts.EventTitles.user(
			description,
			eventType,
			tone
		)
		const operationName = OperationUtils.createOperationName(
			'generate',
			'event-titles'
		)

		const result = await llm.generate(
			userPrompt,
			systemPrompt,
			ResponseSchemas.EventTitleSuggestions,
			operationName
		)

		return ResponseUtils.createSuccessResponse(
			result,
			undefined,
			'Event title suggestions generated successfully'
		)
	} catch (error) {
		return ErrorUtils.createErrorResponse(error, 'generateEventTitles')
	}
}

/**
 * Generate event description using AI
 */
export async function generateEventDescription(
	_prevState: AIActionState,
	formData: FormData
): Promise<AIActionState> {
	try {
		// Process and validate form data
		const validation = ValidationUtils.processFormData(
			formData,
			InputSchemas.GenerateEventDescription
		)
		if (!validation.success) {
			return ResponseUtils.createValidationErrorResponse(validation.errors)
		}

		const { title, basicInfo, targetAudience, tone, length } = validation.data

		// Validate prompt content
		const promptError = ValidationUtils.validatePrompt(basicInfo)
		if (promptError) {
			return ResponseUtils.createValidationErrorResponse({
				basicInfo: [promptError],
			})
		}

		// Check LLM availability
		const availabilityCheck = OperationUtils.checkLLMAvailability(llm)
		if (availabilityCheck) return availabilityCheck

		// Generate content using centralized prompts
		const systemPrompt = ContentGenerationPrompts.EventDescription.system(
			tone,
			length
		)
		const userPrompt = ContentGenerationPrompts.EventDescription.user(
			title,
			basicInfo,
			targetAudience,
			tone,
			length
		)
		const operationName = OperationUtils.createOperationName(
			'generate',
			'event-description'
		)

		const result = await llm.generate(
			userPrompt,
			systemPrompt,
			ResponseSchemas.EventDescriptionGeneration,
			operationName
		)

		return ResponseUtils.createSuccessResponse(
			result,
			result.description,
			'Event description generated successfully'
		)
	} catch (error) {
		return ErrorUtils.createErrorResponse(error, 'generateEventDescription')
	}
}
