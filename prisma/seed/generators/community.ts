/**
 * Community Generator
 *
 * Simplified: batch orchestration moved to generator.ts.
 * This module provides faker-based fallback generation for USE_LLM=false.
 */

import { faker } from '@faker-js/faker'
import type { Category, LLMCommunity } from '../utils'
import { logger } from '../utils'
import { LOCATION_SLUG_TO_NAME, LOCATION_SLUGS } from '../utils/schemas'

/**
 * Generate a batch of communities using faker (no LLM).
 */
export function generateFakerCommunities(
	count: number,
	categories: Category[]
): LLMCommunity[] {
	logger.info('Generating communities with faker', { count })

	const communities: LLMCommunity[] = []
	const membershipStyles = ['open', 'invite-only', 'application-based'] as const

	for (let i = 0; i < count; i++) {
		const category = categories[i % categories.length]
		const slug = faker.helpers.arrayElement([...LOCATION_SLUGS])
		const cityName = LOCATION_SLUG_TO_NAME[slug] ?? slug

		const name = `${cityName} ${category.name} ${faker.word.adjective()} ${faker.helpers.arrayElement(['Society', 'Network', 'Guild', 'Collective', 'Circle', 'Club', 'League'])}`

		const events = Array.from(
			{ length: faker.number.int({ min: 2, max: 4 }) },
			() => ({
				title: `${faker.word.adjective()} ${category.name} ${faker.helpers.arrayElement(['Workshop', 'Meetup', 'Conference', 'Social', 'Hackathon', 'Summit'])}`,
				subtitle: faker.company.catchPhrase(),
				description: faker.lorem.sentences(2),
				eventType: faker.helpers.arrayElement([
					'workshop',
					'meetup',
					'conference',
					'social',
					'hackathon',
				]),
				targetCapacity: faker.number.int({ min: 20, max: 200 }),
				isPaid: faker.datatype.boolean(),
				ticketTiers: [
					{
						name: 'General Admission',
						description: 'Standard entry',
						priceCents: faker.number.int({ min: 0, max: 5000 }),
						capacity: null,
					},
				],
				promoCodes: faker.datatype.boolean()
					? [
							{
								code: faker.string.alphanumeric(8).toUpperCase(),
								description: 'Early bird discount',
								discountPercent: faker.number.int({ min: 10, max: 30 }),
							},
						]
					: [],
			})
		)

		communities.push({
			name,
			description: `${faker.lorem.sentences(2)} Based in ${cityName}.`,
			focusArea: category.name,
			targetAudience: faker.company.buzzPhrase(),
			membershipStyle: faker.helpers.arrayElement(membershipStyles),
			homeLocation: slug,
			membershipTiers: [
				{
					name: 'Free',
					description: 'Basic membership',
					priceCents: null,
					benefits: ['Access to events', 'Community chat'],
				},
			],
			eventTypes: ['meetup', 'workshop'],
			categories: [category.name],
			events,
		})
	}

	return communities
}

// Backward-compatible export
export class CommunityGenerator {
	async generate(): Promise<LLMCommunity[]> {
		const { loadCategorySlugs } = await import('../utils/data-loaders')
		const categories = loadCategorySlugs()
		return generateFakerCommunities(10, categories)
	}

	async cleanup(): Promise<void> {
		// no-op
	}
}

export const communityGenerator = new CommunityGenerator()
