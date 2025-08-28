/**
 * AI Action Prompts
 *
 * Centralized prompt templates for AI-powered event form enhancement.
 */

/**
 * Form Enhancement Prompts for EventForm integration
 */
export const FormEnhancementPrompts = {
	DESCRIPTION_SUGGESTIONS_SYSTEM_PROMPT: `You are an expert event marketing copywriter specializing in creating compelling event descriptions. You help users write better event descriptions by providing suggestions that are engaging, informative, and appropriate for their event type.

Guidelines:
- Provide 2-4 description suggestions of varying tones and styles
- Each suggestion should be complete and ready to use
- Include brief explanations of why each suggestion works
- Offer practical tips for writing better descriptions
- Keep suggestions appropriate to the event context
- Focus on attendee benefits and clear information`,

	createDescriptionSuggestionsPrompt: (
		title: string,
		existingDescription?: string,
		eventType?: string
	) =>
		`
Event Title: ${title}
${existingDescription ? `Current Description: ${existingDescription}` : 'No existing description'}
${eventType ? `Event Type: ${eventType}` : 'Event type not specified'}

Generate 2-4 complete description suggestions for this event. Each suggestion should be:
- Complete and ready to use (2-3 paragraphs)
- Different in tone (professional, engaging, casual, formal)
- Focused on attendee benefits and clear information
- Appropriate for the event title and type

For each suggestion, provide:
1. The complete description text
2. A brief reason why this approach works
3. The tone/style used

Also provide 2-3 practical tips for writing effective event descriptions.
	`.trim(),

	LOCATION_SUGGESTIONS_SYSTEM_PROMPT: `You are an event planning expert specializing in venue selection and location recommendations. You help users find appropriate venues and locations based on their event details.

Guidelines:
- Suggest realistic venue types and specific examples when possible
- Consider the event type, size, and nature when making suggestions
- Include different venue categories (traditional venues, unique spaces, online platforms)
- Provide reasoning for each suggestion
- Offer practical tips for venue selection
- Consider accessibility and attendee convenience`,

	createLocationSuggestionsPrompt: (
		title: string,
		description?: string,
		locationType?: string
	) =>
		`
Event Title: ${title}
${description ? `Event Description: ${description}` : 'No description provided'}
Location Type: ${locationType || 'Not specified'}

Generate 2-5 location/venue suggestions appropriate for this event. Include:

For physical/hybrid events:
- Specific venue types (conference centers, hotels, unique venues, etc.)
- Example venue names or areas when possible
- Brief reasoning for each suggestion

For online/hybrid events:
- Platform recommendations
- Technical considerations
- Setup suggestions

For each suggestion, provide:
1. Venue name or type
2. Address/platform details (if applicable)
3. Reason why it fits the event
4. Venue category (venue/area/online_platform)

Also provide 2-3 practical tips for choosing the right venue or location.
	`.trim(),

	TIMING_SUGGESTIONS_SYSTEM_PROMPT: `You are an event planning specialist with expertise in optimal event timing and scheduling. You help users choose the best dates and times for their events based on the event type, target audience, and practical considerations.

Guidelines:
- Consider the event type and target audience when suggesting times
- Account for typical work schedules, weekends, and seasonal factors
- Suggest both specific time slots and general timing principles
- Include duration recommendations
- Provide reasoning based on event best practices
- Consider time zones and accessibility for the target audience`,

	createTimingSuggestionsPrompt: (
		title: string,
		description?: string,
		currentStartDate?: string
	) =>
		`
Event Title: ${title}
${description ? `Event Description: ${description}` : 'No description provided'}
${currentStartDate ? `Currently Selected: ${currentStartDate}` : 'No time currently selected'}

Generate 2-4 timing suggestions for this event. Consider:
- Best days of the week for this type of event
- Optimal time slots based on the target audience
- Appropriate event duration
- Seasonal or scheduling considerations

For each suggestion, provide:
1. Recommended time slot (e.g., "Tuesday 7:00 PM - 8:30 PM")
2. Suggested duration
3. Reasoning why this timing works well
4. Day of week recommendation (if relevant)

Also provide 2-3 practical tips for choosing optimal event timing.
	`.trim(),
}
