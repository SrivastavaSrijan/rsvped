/**
 * Multi-Pass Data Generator
 *
 * Sequential generation pipeline:
 * Pass 1: Communities (batches of 3) with location + category enum constraints
 * Digest: Group communities by location into compact summaries
 * Pass 2: Users per-location batch with community digest in prompt
 */

import { faker } from '@faker-js/faker'
import { getTotalCostUsd, llm } from './generators/llm'
import { CommunityPrompts, UserPrompts } from './prompts/llm'
import {
	type Category,
	type LLMCommunity,
	LLMCommunityBatchSchema,
	LLMUserBatchSchema,
	type LLMUserPersona,
	LOCATION_SLUG_TO_NAME,
	LOCATION_SLUGS,
	logger,
} from './utils'
import { config } from './utils/config'
import { loadCategorySlugs } from './utils/data-loaders'

// ---------------------------------------------------------------------------
// Community Digest — compact summaries grouped by location
// ---------------------------------------------------------------------------

function buildCommunityDigest(
	communities: LLMCommunity[]
): Record<string, string> {
	const byLocation: Record<string, LLMCommunity[]> = {}
	for (const c of communities) {
		const loc = c.homeLocation
		if (!byLocation[loc]) byLocation[loc] = []
		byLocation[loc].push(c)
	}

	const digest: Record<string, string> = {}
	for (const [slug, comms] of Object.entries(byLocation)) {
		const cityName = LOCATION_SLUG_TO_NAME[slug] ?? slug
		const summaries = comms
			.map(
				(c) => `  - ${c.name} (${c.focusArea}, ${c.categories[0] ?? 'general'})`
			)
			.join('\n')
		digest[slug] = `${cityName}:\n${summaries}`
	}
	return digest
}

// ---------------------------------------------------------------------------
// Pass 1: Community Generation
// ---------------------------------------------------------------------------

async function generateCommunities(
	targetCount: number,
	categories: Category[]
): Promise<LLMCommunity[]> {
	if (!config.USE_LLM || !llm.isAvailable()) {
		logger.warn('LLM unavailable, skipping community generation')
		return []
	}

	const batchSize = 3
	const batches = Math.ceil(targetCount / batchSize)
	const allCommunities: LLMCommunity[] = []
	const categoryNames = categories.map((c) => c.name)

	for (let i = 0; i < batches; i++) {
		const currentBatchSize = Math.min(
			batchSize,
			targetCount - allCommunities.length
		)
		if (currentBatchSize <= 0) break

		logger.info(`Community batch ${i + 1}/${batches}`, {
			size: currentBatchSize,
			totalSoFar: allCommunities.length,
		})

		// Select diverse locations for this batch
		const batchLocationSlugs = faker.helpers.arrayElements(
			[...LOCATION_SLUGS],
			Math.min(currentBatchSize * 2, LOCATION_SLUGS.length)
		)

		// Cycle through categories for diversity
		const startIdx = (i * batchSize) % categoryNames.length
		const batchCategories: string[] = []
		for (let j = 0; j < currentBatchSize; j++) {
			batchCategories.push(categoryNames[(startIdx + j) % categoryNames.length])
		}

		try {
			const prompt = CommunityPrompts.user(
				currentBatchSize,
				batchLocationSlugs,
				batchCategories,
				LOCATION_SLUG_TO_NAME
			)

			const result = await llm.generate(
				prompt,
				CommunityPrompts.system,
				LLMCommunityBatchSchema,
				`community-batch-${i + 1}`
			)

			const batchCommunities =
				(result as { communities: LLMCommunity[] }).communities ?? []
			allCommunities.push(...batchCommunities)

			logger.info(`Community batch ${i + 1} done`, {
				generated: batchCommunities.length,
				total: allCommunities.length,
				costSoFar: `$${getTotalCostUsd().toFixed(4)}`,
			})

			// Rate limiting between batches
			if (i < batches - 1) {
				await new Promise((resolve) => setTimeout(resolve, 500))
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			if (message.includes('budget exhausted')) {
				logger.warn('Budget exhausted during community generation', {
					generated: allCommunities.length,
				})
				break
			}
			logger.error(`Community batch ${i + 1} failed`, { error: message })
			// Continue with next batch
		}
	}

	// Deduplicate by name + location
	const seen = new Set<string>()
	return allCommunities.filter((c) => {
		if (!c?.name || !c?.homeLocation) return false
		const key = `${c.name.toLowerCase().trim()}|${c.homeLocation}`
		if (seen.has(key)) return false
		seen.add(key)
		return true
	})
}

// ---------------------------------------------------------------------------
// Pass 2: User Generation (location-grouped, community-aware)
// ---------------------------------------------------------------------------

async function generateUsers(
	targetCount: number,
	communities: LLMCommunity[],
	categories: Category[]
): Promise<LLMUserPersona[]> {
	if (!config.USE_LLM || !llm.isAvailable()) {
		logger.warn('LLM unavailable, skipping user generation')
		return []
	}

	const digest = buildCommunityDigest(communities)
	const categoryNames = categories.map((c) => c.name)

	// Group generation by location for coherence
	const locationsWithCommunities = Object.keys(digest)
	const allLocations = [...LOCATION_SLUGS]
	const usersPerLocation = Math.max(
		1,
		Math.ceil(targetCount / allLocations.length)
	)

	const allUsers: LLMUserPersona[] = []
	let batchIndex = 0

	// Generate users for locations with communities first (more context)
	const sortedLocations = [
		...locationsWithCommunities,
		...allLocations.filter((s) => !locationsWithCommunities.includes(s)),
	]

	for (const slug of sortedLocations) {
		if (allUsers.length >= targetCount) break

		const remaining = targetCount - allUsers.length
		const batchSize = Math.min(usersPerLocation, remaining, 15)
		if (batchSize <= 0) break

		batchIndex++
		logger.info(
			`User batch ${batchIndex} for ${LOCATION_SLUG_TO_NAME[slug] ?? slug}`,
			{ size: batchSize, totalSoFar: allUsers.length }
		)

		// Build location-specific community digest
		const locationDigest = digest[slug]
			? digest[slug]
			: `No communities yet in ${LOCATION_SLUG_TO_NAME[slug] ?? slug} — generate users with general interests.`

		try {
			const prompt = UserPrompts.user(
				batchSize,
				[slug],
				categoryNames,
				LOCATION_SLUG_TO_NAME,
				locationDigest
			)

			const result = await llm.generate(
				prompt,
				UserPrompts.system,
				LLMUserBatchSchema,
				`user-batch-${slug}`
			)

			const batchUsers = (result as { users: LLMUserPersona[] }).users ?? []
			allUsers.push(...batchUsers)

			logger.info(`User batch for ${slug} done`, {
				generated: batchUsers.length,
				total: allUsers.length,
				costSoFar: `$${getTotalCostUsd().toFixed(4)}`,
			})

			// Rate limiting
			await new Promise((resolve) => setTimeout(resolve, 300))
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			if (message.includes('budget exhausted')) {
				logger.warn('Budget exhausted during user generation', {
					generated: allUsers.length,
				})
				break
			}
			logger.error(`User batch for ${slug} failed`, { error: message })
		}
	}

	// Deduplicate
	const seen = new Set<string>()
	return allUsers.filter((u) => {
		if (!u?.firstName || !u?.lastName || !u?.location) return false
		const key = `${u.firstName.toLowerCase().trim()} ${u.lastName.toLowerCase().trim()}|${u.location}`
		if (seen.has(key)) return false
		seen.add(key)
		return true
	})
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export class DataGenerator {
	/**
	 * Multi-pass generation: communities first, then users with community context.
	 */
	async generateAll(): Promise<{
		communities: LLMCommunity[]
		users: LLMUserPersona[]
	}> {
		logger.info('Starting multi-pass data generation', {
			communities: config.NUM_COMMUNITIES,
			users: config.NUM_USERS,
			useLLM: config.USE_LLM,
			budget: `$${config.SEED_BUDGET_USD}`,
		})

		const categories = loadCategorySlugs()

		// Pass 1: Communities
		logger.info('=== Pass 1: Community Generation ===')
		const communities = await generateCommunities(
			config.NUM_COMMUNITIES,
			categories
		)
		logger.info('Pass 1 complete', {
			communities: communities.length,
			cost: `$${getTotalCostUsd().toFixed(4)}`,
		})

		// Pass 2: Users (with community digest context)
		logger.info('=== Pass 2: User Generation ===')
		const users = await generateUsers(config.NUM_USERS, communities, categories)
		logger.info('Pass 2 complete', {
			users: users.length,
			totalCost: `$${getTotalCostUsd().toFixed(4)}`,
		})

		logger.info('Multi-pass generation complete', {
			communities: communities.length,
			users: users.length,
			totalCost: `$${getTotalCostUsd().toFixed(4)}`,
		})

		return { communities, users }
	}

	/**
	 * Generate only communities
	 */
	async generateCommunities() {
		const categories = loadCategorySlugs()
		return generateCommunities(config.NUM_COMMUNITIES, categories)
	}

	/**
	 * Generate only users (requires existing communities for context)
	 */
	async generateUsers(communities: LLMCommunity[], count?: number) {
		const categories = loadCategorySlugs()
		return generateUsers(count ?? config.NUM_USERS, communities, categories)
	}
}

// Backward-compatible exports
export async function generateCommunitiesWithLLM() {
	const generator = new DataGenerator()
	return generator.generateCommunities()
}

export async function generateUsersWithLLM(count?: number) {
	const generator = new DataGenerator()
	return generator.generateUsers([], count)
}

// Main execution
async function main() {
	const generator = new DataGenerator()
	await generator.generateAll()
}

if (require.main === module) {
	main().catch((error) => {
		logger.error('Generator failed', { error })
		process.exit(1)
	})
}
