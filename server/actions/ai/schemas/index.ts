/**
 * AI Action Schemas
 *
 * Centralized Zod schemas for AI action inputs and responses.
 * Following the pattern established in the seed system.
 */

import { z } from 'zod'

/**
 * Input Schemas for AI Actions
 */
export const InputSchemas = {
	/**
	 * Event Title Generation Input
	 */
	GenerateEventTitles: z.object({
		description: z
			.string()
			.min(10, 'Description must be at least 10 characters'),
		eventType: z.string().optional(),
		tone: z
			.enum(['professional', 'casual', 'creative', 'urgent'])
			.default('professional'),
	}),

	/**
	 * Event Description Generation Input
	 */
	GenerateEventDescription: z.object({
		title: z.string().min(5, 'Title must be at least 5 characters'),
		basicInfo: z.string().min(10, 'Basic info must be at least 10 characters'),
		targetAudience: z.string().optional(),
		tone: z
			.enum(['professional', 'casual', 'creative', 'formal'])
			.default('professional'),
		length: z.enum(['short', 'medium', 'detailed']).default('medium'),
	}),

	/**
	 * Event Description Enhancement Input
	 */
	EnhanceEventDescription: z.object({
		eventSlug: z.string().min(1, 'Event slug is required'),
		currentDescription: z.string().min(1, 'Current description is required'),
		enhancementType: z.enum([
			'professional',
			'engaging',
			'detailed',
			'concise',
			'creative',
		]),
		additionalContext: z.string().optional(),
	}),

	/**
	 * Apply Enhanced Description Input
	 */
	ApplyEnhancedDescription: z.object({
		eventSlug: z.string().min(1, 'Event slug is required'),
		enhancedDescription: z.string().min(1, 'Enhanced description is required'),
	}),
}

/**
 * Response Schemas for LLM API
 */
export const ResponseSchemas = {
	/**
	 * Event Title Suggestions Response
	 */
	EventTitleSuggestions: z.object({
		suggestions: z
			.array(
				z.object({
					title: z.string(),
					reason: z.string(),
				})
			)
			.min(3)
			.max(8),
		bestPick: z.string(),
		tips: z.array(z.string()),
	}),

	/**
	 * Event Description Generation Response
	 */
	EventDescriptionGeneration: z.object({
		description: z.string(),
		keyFeatures: z.array(z.string()),
		callToAction: z.string(),
		tips: z.array(z.string()),
	}),

	/**
	 * Event Description Enhancement Response
	 */
	EventDescriptionEnhancement: z.object({
		enhancedDescription: z.string(),
		improvements: z.array(z.string()),
		tone: z.string(),
	}),
}

/**
 * Type exports for use in actions
 */
export type GenerateEventTitlesInput = z.infer<
	typeof InputSchemas.GenerateEventTitles
>
export type GenerateEventDescriptionInput = z.infer<
	typeof InputSchemas.GenerateEventDescription
>
export type EnhanceEventDescriptionInput = z.infer<
	typeof InputSchemas.EnhanceEventDescription
>
export type ApplyEnhancedDescriptionInput = z.infer<
	typeof InputSchemas.ApplyEnhancedDescription
>

export type EventTitleSuggestionsResponse = z.infer<
	typeof ResponseSchemas.EventTitleSuggestions
>
export type EventDescriptionGenerationResponse = z.infer<
	typeof ResponseSchemas.EventDescriptionGeneration
>
export type EventDescriptionEnhancementResponse = z.infer<
	typeof ResponseSchemas.EventDescriptionEnhancement
>
