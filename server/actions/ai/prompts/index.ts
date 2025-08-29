/**
 * AI Prompts - System prompts and domain-specific prompt builders
 *
 * Main system prompts for enhancements, plus domain-specific prompt builders
 * that follow the Routes pattern for parent components to use.
 */

export const Prompts = {
	/**
	 * Text enhancement prompts - for WritingAssistant buttons
	 */
	Enhancements: {
		proofread: (text: string, context?: Record<string, unknown>) =>
			`Proofread and fix grammar, spelling, punctuation, and clarity issues in this text: "${text}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the corrected version.`,

		rewrite: (text: string, context?: Record<string, unknown>) =>
			`Rewrite this text to improve clarity, engagement, and quality: "${text}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the improved version.`,

		friendly: (text: string, context?: Record<string, unknown>) =>
			`Make this text more friendly, welcoming, and approachable: "${text}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the friendly version.`,

		professional: (text: string, context?: Record<string, unknown>) =>
			`Make this text more professional, polished, and business-appropriate: "${text}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the professional version.`,

		concise: (text: string, context?: Record<string, unknown>) =>
			`Make this text more concise while preserving all important information: "${text}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the concise version.`,

		keypoints: (text: string, context?: Record<string, unknown>) =>
			`Convert this text into clear, well-organized bullet points: "${text}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the bullet points.`,

		summary: (text: string, context?: Record<string, unknown>) =>
			`Create a concise summary that captures the main points: "${text}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the summary.`,

		table: (text: string, context?: Record<string, unknown>) =>
			`Organize this information into a clear table format: "${text}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the table in markdown format.`,

		custom: (
			text: string,
			customPrompt: string,
			context?: Record<string, unknown>
		) =>
			`Apply this change: "${customPrompt}"

Original text: "${text}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Return as JSON with "text" field containing the modified text.`,
	},

	/**
	 * Generic system prompts for different contexts
	 */
	System: {
		suggestions: (domain: string) =>
			`You are an AI assistant helping users with ${domain} in RSVP'd - an event management and community platform. 
			
Users create events, manage RSVPs, and build communities around shared interests. 
Generate specific, actionable suggestions based on the user's request. 
Always return structured JSON with a "suggestions" array containing 3-5 suggestion strings.`,

		enhancement: (domain: string) =>
			`You are an AI writing assistant helping users improve their ${domain} content in RSVP'd - an event management and community platform.
			
Users write event descriptions, community posts, and other content to engage their audience.
Return enhanced text as JSON with a "text" field containing the improved content.`,
	},
}

/**
 * Event-specific prompts - follows Routes pattern
 */
export const EventPrompts = {
	title(
		currentValue: string,
		options?: {
			description?: string
			locationType?: string
			category?: string
			startDate?: string
		}
	) {
		const { description, locationType, category, startDate } = options || {}

		return `Generate 3-5 creative event title alternatives for:
Current title: "${currentValue}"
${description ? `Description: "${description}"` : ''}
${locationType ? `Location type: ${locationType}` : ''}
${category ? `Category: ${category}` : ''}
${startDate ? `Date: ${startDate}` : ''}

Make titles specific, engaging, and appropriate for the event type and location.
Focus on clarity and appeal to the target audience.
Avoid generic phrases like "amazing" or "incredible".`
	},

	description(
		currentValue: string,
		options?: {
			title?: string
			locationType?: string
			category?: string
			startDate?: string
		}
	) {
		const { title, locationType, category, startDate } = options || {}

		return `Generate 3-5 compelling event description alternatives for${title ? `: "${title}"` : ' this event'}
Current description: "${currentValue}"
${locationType ? `Location type: ${locationType}` : ''}
${category ? `Category: ${category}` : ''}
${startDate ? `Date: ${startDate}` : ''}

Create descriptions that:
- Are 2-3 sentences long
- Clearly explain what attendees can expect
- Include relevant details about format/activities
- Are appropriate for the event category and location type
- Encourage registration`
	},

	venueName(
		currentValue: string,
		options?: {
			title?: string
			venueAddress?: string
			locationType?: string
		}
	) {
		const { title, venueAddress, locationType } = options || {}

		return `Generate 3-5 venue name alternatives for:
Current venue name: "${currentValue}"
${title ? `Event title: "${title}"` : ''}
${venueAddress ? `Address: "${venueAddress}"` : ''}
${locationType ? `Location type: ${locationType}` : ''}

Suggest venue names that are:
- Appropriate for the event type
- Professional and clear
- Suitable for the location/address provided`
	},
}

/**
 * Community-specific prompts - follows Routes pattern
 */
export const CommunityPrompts = {
	name(
		currentValue: string,
		options?: {
			description?: string
			category?: string
			location?: string
		}
	) {
		const { description, category, location } = options || {}

		return `Generate 3-5 memorable community name alternatives for:
Current name: "${currentValue}"
${description ? `Description: "${description}"` : ''}
${category ? `Focus area: ${category}` : ''}
${location ? `Location: ${location}` : ''}

Create names that are:
- Memorable and brandable
- Relevant to the community focus
- Appropriate for the location/region
- Not too generic or common`
	},

	description(
		currentValue: string,
		options?: {
			name?: string
			category?: string
			location?: string
		}
	) {
		const { name, category, location } = options || {}

		return `Generate 3-5 welcoming community description alternatives for:
${name ? `Community name: "${name}"` : 'This community'}
Current description: "${currentValue}"
${category ? `Focus area: ${category}` : ''}
${location ? `Location: ${location}` : ''}

Create descriptions that:
- Welcome new members clearly
- Explain the community's purpose and activities
- Are 2-3 sentences long
- Encourage participation
- Reflect the community's focus area`
	},
}

export type PromptType = (typeof Prompts)[keyof typeof Prompts]
