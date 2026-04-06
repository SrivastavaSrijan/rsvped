/**
 * LLM Prompts
 *
 * Coherence-focused prompt templates for multi-pass LLM data generation.
 * Pass 1: communities (with location slug + category constraints)
 * Pass 2: users (with community digest for coherent matching)
 */

export const CommunityPrompts = {
	system: `You are an expert community organizer and event planner with deep knowledge of cities worldwide.

CRITICAL RULES:
- The "homeLocation" field MUST be one of the provided location slugs EXACTLY as written.
- The "categories" field MUST include at least one of the provided category names.
- Each community must feel authentic to its city — use real neighborhood names, local cultural references, and venue styles appropriate to that location.
- Do NOT use generic names like "Tech Hub" or "Creative Space". Be specific and evocative.
- Create communities that real people would actually join.
- Events should have realistic venue names for their specific cities.
- Only respond with valid JSON matching the required schema.`,

	user: (
		batchSize: number,
		locationSlugs: string[],
		categoryNames: string[],
		slugToName: Record<string, string>
	) => {
		const locationList = locationSlugs
			.map((slug) => `  "${slug}" (${slugToName[slug] ?? slug})`)
			.join('\n')

		return `Generate exactly ${batchSize} DIVERSE and REALISTIC communities for an event management platform.

LOCATION SLUGS (use EXACTLY one of these for homeLocation):
${locationList}

CATEGORIES (each community must relate to at least one):
${categoryNames.join(', ')}

REQUIREMENTS:
1. Each community MUST have a unique name — no two communities should share similar names
2. homeLocation MUST be one of the exact slugs listed above (e.g., "nyc", "sf", "london")
3. Categories array must include the main category and 1-2 relevant subcategories
4. Create 2-4 events per community with realistic venue names for that city
5. Events should have realistic ticket pricing appropriate for the city and community type
6. Descriptions should be 2-3 vivid sentences that convey the community's personality
7. Membership tiers should make sense for the community type (free meetups vs. premium networks)

DIVERSITY REQUIREMENTS:
- Mix professional networks, hobby groups, educational communities, cultural exchanges, and social clubs
- Vary membership styles (open, invite-only, application-based) based on community type
- Include both free/casual and premium/exclusive communities
- Make event types varied: workshops, meetups, conferences, social gatherings, hackathons`
	},
}

export const VenuePrompts = {
	system: `You are a local city expert with deep knowledge of real venues, event spaces, and gathering places worldwide.

CRITICAL RULES:
- Generate REAL venue names that actually exist or are highly plausible for the given city.
- Include a mix of venue types: conference centers, restaurants, parks, coworking spaces, hotels, cultural venues, rooftops, and unique local spots.
- Each venue should feel authentic to the city — use real neighborhood character and local flavor.
- Only respond with valid JSON matching the required schema.`,

	user: (cityName: string, locationSlug: string) =>
		`Generate 10-15 realistic event venues for ${cityName} (slug: "${locationSlug}").

REQUIREMENTS:
1. Mix of venue types: conference/event spaces, restaurants/bars, parks/outdoor, cultural venues, hotels, coworking spaces
2. Include well-known real venues AND plausible local spots
3. Names should feel authentic — a local would recognize the style
4. Vary capacity: intimate (20-50), medium (50-200), large (200+)

Return a JSON object with a "venues" array of venue name strings.`,
}

export const UserPrompts = {
	system: `You are generating diverse, realistic user personas for an event platform.

CRITICAL RULES:
- The "location" field MUST be one of the provided location slugs EXACTLY as written.
- Interests MUST align with the categories and communities available in that location.
- Use culturally appropriate names for each location.
- Each persona should feel like a real person with coherent professional background, interests, and networking style.
- Only respond with valid JSON matching the provided schema.`,

	user: (
		batchSize: number,
		locationSlugs: string[],
		categoryNames: string[],
		slugToName: Record<string, string>,
		communityDigest: string
	) => {
		const locationList = locationSlugs
			.map((slug) => `  "${slug}" (${slugToName[slug] ?? slug})`)
			.join('\n')

		return `Generate exactly ${batchSize} realistic professional personas for an event platform.

LOCATION SLUGS (use EXACTLY one of these for location):
${locationList}

CATEGORIES:
${categoryNames.join(', ')}

COMMUNITIES AVAILABLE IN THESE LOCATIONS:
${communityDigest}

REQUIREMENTS:
1. Each person's location MUST be one of the exact slugs listed above
2. Interests should align with communities available in their location
3. Use culturally appropriate first and last names for each location
4. Create DIVERSE profiles across industries, experience levels, and networking styles
5. Bio should be a single vivid sentence that captures who they are
6. Spending power should correlate with experience level and profession
7. Networking style should match their profession and personality

DIVERSITY REQUIREMENTS:
- Junior through executive experience levels
- Mix of active networkers, selective attendees, and casual participants
- Various industries: tech, finance, creative, healthcare, education, etc.
- Include both local residents and transplants to each city`
	},
}
