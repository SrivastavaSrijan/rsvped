/**
 * Event Enhancement Actions
 *
 * Server actions for AI-powered event content enhancement.
 * Refactored to use centralized prompts, schemas, and utilities.
 */

'use server'

import { redirect } from 'next/navigation'
import { llm } from '@/lib/ai/llm'
import { Routes } from '@/lib/config/routes'
import { getAPI } from '@/server/api'
import { EnhancementPrompts } from '../prompts'
import { InputSchemas, ResponseSchemas } from '../schemas'
import type { AIActionState } from '../types'
import { AIActionErrorCodeMap } from '../types'
import {
	ErrorUtils,
	OperationUtils,
	ResponseUtils,
	ValidationUtils,
} from '../utils'

/**
 * Enhance event description using AI
 */
export async function enhanceEventDescription(
	_prevState: AIActionState,
	formData: FormData
): Promise<AIActionState> {
	try {
		// Process and validate form data
		const validation = ValidationUtils.processFormData(
			formData,
			InputSchemas.EnhanceEventDescription
		)
		if (!validation.success) {
			return ResponseUtils.createValidationErrorResponse(validation.errors)
		}

		const {
			eventSlug,
			currentDescription,
			enhancementType,
			additionalContext,
		} = validation.data

		// Validate prompt content
		const promptError = ValidationUtils.validatePrompt(currentDescription)
		if (promptError) {
			return ResponseUtils.createValidationErrorResponse({
				currentDescription: [AIActionErrorCodeMap[promptError]],
			})
		}

		// Check LLM availability
		const availabilityCheck = OperationUtils.checkLLMAvailability(llm)
		if (availabilityCheck) return availabilityCheck

		// Verify user has access to this event (business logic)
		const api = await getAPI()
		const event = await api.event.get.enhanced({ slug: eventSlug })
		if (!event) {
			return ResponseUtils.createValidationErrorResponse({
				eventSlug: ['Event not found'],
			})
		}

		// Generate enhanced description using centralized prompts
		const systemPrompt =
			EnhancementPrompts.EventDescription.system(enhancementType)
		const userPrompt = EnhancementPrompts.EventDescription.user(
			event.title,
			currentDescription,
			enhancementType,
			additionalContext
		)
		const operationName = OperationUtils.createOperationName(
			'enhance',
			'event-description',
			eventSlug
		)

		const result = await llm.generate(
			userPrompt,
			systemPrompt,
			ResponseSchemas.EventDescriptionEnhancement,
			operationName
		)

		return ResponseUtils.createSuccessResponse(
			result,
			result.enhancedDescription,
			'Event description enhanced successfully'
		)
	} catch (error) {
		return ErrorUtils.createErrorResponse(error, 'enhanceEventDescription')
	}
}

/**
 * Apply enhanced description to event
 * TODO: This needs to be updated when we have proper event update endpoints
 */
export async function applyEnhancedDescription(
	_prevState: AIActionState,
	formData: FormData
): Promise<AIActionState> {
	try {
		// Process and validate form data
		const validation = ValidationUtils.processFormData(
			formData,
			InputSchemas.ApplyEnhancedDescription
		)
		if (!validation.success) {
			return ResponseUtils.createValidationErrorResponse(validation.errors)
		}

		const { eventSlug } = validation.data

		// TODO: Apply the enhancedDescription to the event
		// Currently blocked by API limitations

		// TODO: Update the event with enhanced description
		// This is currently blocked by the event update API requiring all fields
		// const api = await getAPI()
		// await api.event.update({
		//   slug: eventSlug,
		//   description: enhancedDescription,
		// })

		// For now, redirect to the event page
		// TODO: Implement proper partial update or create a dedicated description update endpoint
		redirect(Routes.Main.Events.ViewBySlug(eventSlug))
	} catch (error) {
		return ErrorUtils.createErrorResponse(error, 'applyEnhancedDescription')
	}
}
