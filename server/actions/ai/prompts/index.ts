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

Return structured JSON with a "suggestions" array containing 3-5 suggestion objects.
Each suggestion must have:
- "text": The actual suggestion content (max 500 characters)
- "disposition": A distinct style indicator (capitalize first letter + relevant emoji)

Available dispositions (use EXACTLY these, each suggestion must have a DIFFERENT disposition):
- "🎉 Energetic" - Exciting, high-energy content with enthusiasm
- "💼 Professional" - Formal, business-appropriate, polished tone
- "😊 Friendly" - Warm, welcoming, conversational approach
- "✂️ Concise" - Brief, to-the-point, efficient communication
- "🎨 Creative" - Unique, artistic, innovative approach
- "🌟 Inspiring" - Motivational, uplifting, aspirational tone
- "📚 Informative" - Educational, detailed, fact-focused content
- "💬 Casual" - Relaxed, informal, everyday conversation style
- "🎯 Direct" - Straightforward, clear, no-nonsense approach
- "✨ Elegant" - Sophisticated, refined, tasteful presentation
- "🔥 Bold" - Confident, assertive, attention-grabbing style
- "🤝 Inclusive" - Welcoming, diverse, community-focused tone

Ensure each suggestion has a DIFFERENT disposition. Never repeat dispositions in the same response.`,

		enhancement: (domain: string) =>
			`You are an AI writing assistant helping users improve their ${domain} content in RSVP'd - an event management and community platform.
			
Users write event descriptions, community posts, and other content to engage their audience.
Return enhanced text as JSON with a "text" field containing the improved content.`,
	},
}

export type PromptType = (typeof Prompts)[keyof typeof Prompts]
