/**
 * User Generator
 *
 * Simplified: batch orchestration moved to generator.ts.
 * This module provides faker-based fallback generation for USE_LLM=false.
 */

import { faker } from '@faker-js/faker'
import type { Category, LLMUserPersona } from '../utils'
import { logger } from '../utils'
import { LOCATION_SLUGS } from '../utils/schemas'

const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior', 'executive'] as const
const NETWORKING_STYLES = ['active', 'selective', 'casual'] as const
const SPENDING_POWERS = ['low', 'medium', 'high'] as const

/**
 * Generate a batch of user personas using faker (no LLM).
 */
export function generateFakerUsers(
	count: number,
	categories: Category[]
): LLMUserPersona[] {
	logger.info('Generating users with faker', { count })

	const users: LLMUserPersona[] = []
	const categoryNames = categories.map((c) => c.name)

	for (let i = 0; i < count; i++) {
		const experienceLevel = faker.helpers.arrayElement(EXPERIENCE_LEVELS)
		const spendingPower =
			experienceLevel === 'executive'
				? 'high'
				: experienceLevel === 'senior'
					? faker.helpers.arrayElement(['medium', 'high'] as const)
					: faker.helpers.arrayElement(SPENDING_POWERS)

		const interestCount = faker.number.int({ min: 1, max: 4 })
		const interests = faker.helpers.arrayElements(
			categoryNames,
			Math.min(interestCount, categoryNames.length)
		)

		users.push({
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			profession: faker.person.jobTitle(),
			industry: faker.person.jobArea(),
			experienceLevel,
			interests,
			location: faker.helpers.arrayElement([...LOCATION_SLUGS]),
			networkingStyle: faker.helpers.arrayElement(NETWORKING_STYLES),
			spendingPower,
			bio: `${faker.person.jobTitle()} passionate about ${interests[0] ?? 'technology'}.`,
		})
	}

	return users
}

// Backward-compatible export
export class UserGenerator {
	async generate(targetCount = 20): Promise<LLMUserPersona[]> {
		const { loadCategorySlugs } = await import('../utils/data-loaders')
		const categories = loadCategorySlugs()
		return generateFakerUsers(targetCount, categories)
	}

	async cleanup(): Promise<void> {
		// no-op
	}
}

export const userGenerator = new UserGenerator()
