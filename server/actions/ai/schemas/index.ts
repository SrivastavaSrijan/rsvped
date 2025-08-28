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
	 * Form Enhancement Schemas for EventForm integration
	 */
	GenerateDescriptionSuggestions: z.object({
		title: z.string().min(3, 'Title must be at least 3 characters'),
		existingDescription: z.string().optional(),
		eventType: z.string().optional(),
	}),

	GenerateLocationSuggestions: z.object({
		title: z.string().min(3, 'Title must be at least 3 characters'),
		description: z.string().optional(),
		locationType: z.enum(['PHYSICAL', 'ONLINE', 'HYBRID']),
	}),

	GenerateTimingSuggestions: z.object({
		title: z.string().min(3, 'Title must be at least 3 characters'),
		description: z.string().optional(),
		currentStartDate: z.string().optional(),
	}),
}

/**
 * Response Schemas for LLM API
 */
export const ResponseSchemas = {
	/**
	 * Form Enhancement Response Schemas
	 */
	DescriptionSuggestions: z.object({
		suggestions: z
			.array(
				z.object({
					text: z.string(),
					reason: z.string(),
					tone: z.enum(['professional', 'casual', 'engaging', 'formal']),
				})
			)
			.min(2)
			.max(4),
		tips: z.array(z.string()),
	}),

	LocationSuggestions: z.object({
		suggestions: z
			.array(
				z.object({
					venueName: z.string(),
					venueAddress: z.string().optional(),
					reason: z.string(),
					type: z.enum(['venue', 'area', 'online_platform']),
				})
			)
			.min(2)
			.max(5),
		tips: z.array(z.string()),
	}),

	TimingSuggestions: z.object({
		suggestions: z
			.array(
				z.object({
					timeSlot: z.string(),
					duration: z.string(),
					reason: z.string(),
					dayOfWeek: z.string().optional(),
				})
			)
			.min(2)
			.max(4),
		tips: z.array(z.string()),
	}),
}

/**
 * Type exports for use in actions
 */
export type GenerateDescriptionSuggestionsInput = z.infer<
	typeof InputSchemas.GenerateDescriptionSuggestions
>
export type GenerateLocationSuggestionsInput = z.infer<
	typeof InputSchemas.GenerateLocationSuggestions
>
export type GenerateTimingSuggestionsInput = z.infer<
	typeof InputSchemas.GenerateTimingSuggestions
>

export type DescriptionSuggestionsResponse = z.infer<
	typeof ResponseSchemas.DescriptionSuggestions
>
export type LocationSuggestionsResponse = z.infer<
	typeof ResponseSchemas.LocationSuggestions
>
export type TimingSuggestionsResponse = z.infer<
	typeof ResponseSchemas.TimingSuggestions
>
