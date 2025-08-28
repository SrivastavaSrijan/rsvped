/**
 * AI Prompts
 *
 * Centralized prompt templates organized by consumer/domain.
 * Similar to Routes pattern - easy to import and maintain.
 */

export const Prompts = {
	/**
	 * Event-related prompts for EventForm and event pages
	 */
	Events: {
		/**
		 * Generate alternative event titles
		 */
		title: (currentTitle: string, description?: string, eventType?: string) =>
			`Generate 3 alternative event titles based on:
Title: "${currentTitle}"
${description ? `Description: "${description}"` : ''}
${eventType ? `Type: ${eventType}` : ''}

Make them engaging and clear. Return as JSON with "suggestions" array containing 3 title strings.`,

		/**
		 * Generate event description suggestions
		 */
		description: (
			title: string,
			currentDescription?: string,
			eventType?: string
		) =>
			`Generate 3 event description suggestions for: "${title}"
${currentDescription ? `Current: "${currentDescription}"` : ''}
${eventType ? `Type: ${eventType}` : ''}

Make them compelling and informative (2-3 sentences each). Return as JSON with "suggestions" array.`,

		/**
		 * Generate location/venue suggestions
		 */
		location: (title: string, description?: string, locationType?: string) =>
			`Suggest 3-5 venues/locations for this event:
Title: "${title}"
${description ? `Description: "${description}"` : ''}
Location Type: ${locationType || 'any'}

Include venue types, specific examples when possible. Return as JSON with "suggestions" array.`,

		/**
		 * Generate timing suggestions
		 */
		timing: (title: string, description?: string) =>
			`Suggest optimal timing for this event:
Title: "${title}"
${description ? `Description: "${description}"` : ''}

Suggest 3 different time slots with reasoning. Return as JSON with "suggestions" array containing time slot strings.`,
	},

	/**
	 * General text enhancement prompts
	 */
	Text: {
		/**
		 * Improve general text
		 */
		improve: (text: string, context?: Record<string, unknown>) =>
			`Improve this text to be clearer and more engaging:
"${text}"
${context ? `\nContext: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the improved version.`,

		/**
		 * Make text more professional
		 */
		professional: (text: string, context?: Record<string, unknown>) =>
			`Make this text more professional and polished:
"${text}"
${context ? `\nContext: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the professional version.`,

		/**
		 * Fix grammar and readability
		 */
		fix: (text: string, context?: Record<string, unknown>) =>
			`Fix grammar, spelling, and improve readability:
"${text}"
${context ? `\nContext: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the corrected version.`,
	},

	/**
	 * Community-related prompts
	 */
	Communities: {
		/**
		 * Generate community name suggestions
		 */
		name: (description: string, interests?: string[]) =>
			`Generate 3 community name suggestions based on:
Description: "${description}"
${interests?.length ? `Interests: ${interests.join(', ')}` : ''}

Make them memorable and relevant. Return as JSON with "suggestions" array.`,

		/**
		 * Generate community description suggestions
		 */
		description: (name: string, currentDescription?: string) =>
			`Generate 3 community description suggestions for: "${name}"
${currentDescription ? `Current: "${currentDescription}"` : ''}

Make them welcoming and clear about purpose. Return as JSON with "suggestions" array.`,
	},
} as const

export type PromptType = (typeof Prompts)[keyof typeof Prompts]
