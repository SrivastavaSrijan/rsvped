/**
 * LLM Prompts
 *
 * Centralized prompt templates for LLM data generation.
 */

export const CommunityPrompts = {
	system: `You are an expert event organizer who understands different community types across the world.
Only respond with a valid JSON object matching the required schema.
Create realistic, diverse communities with appropriate events, pricing, and membership structures.
Each community should feel distinct and authentic to its location and focus area.
Do not use generic placeholder names like "Tech Hub" or "Creative Space".`,

	user: (batchSize: number, locationNames: string[]) =>
		`Generate exactly ${batchSize} DIVERSE and REALISTIC communities for an event management platform.

REQUIREMENTS:
1. Each community MUST have a unique name and focus area
2. Each community must be based in one of these locations: ${locationNames.join(', ')}
3. Create 2-5 events for each community that make sense for their location and focus area
4. Events should have realistic venue names for their cities
5. Include realistic ticket pricing and membership tiers appropriate for the community type
6. Ensure descriptions are detailed but concise (2-3 sentences)

CREATE DIVERSE COMMUNITY TYPES LIKE:
- Professional networks for specific industries
- Hobby and interest groups (art, music, coding, gaming)
- Educational communities (workshops, courses)
- Cultural/language exchange groups
- Networking groups for specific demographics
- Industry associations and professional development

The response should be a valid JSON object following the provided schema.`,
}

export const UserPrompts = {
	system: `You are generating diverse, realistic user personas for an event platform. 
Only respond with a valid JSON object matching the provided schema.`,

	user: (batchSize: number, locationNames: string[]) =>
		`Generate exactly ${batchSize} realistic professional personas for an event platform.

REQUIREMENTS:
1. Each person MUST have their location selected from this list: ${locationNames.join(', ')}
2. Create DIVERSE profiles across industries, experiences (junior/mid/senior/executive), and networking styles
3. Use realistic first and last names for the specified locations
4. Keep bio to a single concise sentence

Return a JSON object with a "users" array following the provided schema.`,
}
