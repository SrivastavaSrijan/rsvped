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
