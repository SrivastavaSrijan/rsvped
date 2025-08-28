/**
 * AI Server Actions - Barrel Export
 *
 * Exports all AI-related server actions and types.
 * Organized structure following seed system patterns.
 */

// Action implementations
export {
	generateEventDescription,
	generateEventTitles,
} from './actions/contentGeneration'
export {
	applyEnhancedDescription,
	enhanceEventDescription,
} from './actions/eventEnhancement'
// Prompts (for potential customization/extension)
export { ContentGenerationPrompts, EnhancementPrompts } from './prompts'
// Centralized schemas and types
export type {
	EnhanceEventDescriptionInput,
	EventDescriptionEnhancementResponse,
	EventDescriptionGenerationResponse,
	EventTitleSuggestionsResponse,
	GenerateEventDescriptionInput,
	GenerateEventTitlesInput,
} from './schemas'
// Types and core utilities
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
	OperationUtils,
	ResponseUtils,
	ValidationUtils,
} from './utils'
