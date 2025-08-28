/**
 * AI Server Actions - Barrel Export
 *
 * Exports AI-related server actions for EventForm integration.
 * Cleaned up to remove demo-only actions.
 */

// Form Enhancement Actions (actual EventForm integration)
export {
	generateDescriptionSuggestions,
	generateLocationSuggestions,
	generateTimingSuggestions,
} from './actions/formEnhancement'

// Prompts
export { FormEnhancementPrompts } from './prompts'

// Schemas and types
export type {
	DescriptionSuggestionsResponse,
	GenerateDescriptionSuggestionsInput,
	GenerateLocationSuggestionsInput,
	GenerateTimingSuggestionsInput,
	LocationSuggestionsResponse,
	TimingSuggestionsResponse,
} from './schemas'

// Core types and utilities
export type { AIActionState } from './types'
export {
	AI_CONFIG,
	AIActionErrorCode,
	AIActionErrorCodeMap,
	createAIErrorResponse,
	initialAIActionState,
} from './types'

// Utility functions
export {
	ErrorUtils,
	ResponseUtils,
	ValidationUtils,
} from './utils'
