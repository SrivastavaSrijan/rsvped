/**
 * Multi-Pass Data Generator (Batch API)
 *
 * Submits all generation requests via the Claude Batch API for:
 * - 50% cost savings over real-time API
 * - Zero rate limit pressure
 * - Reliable bulk processing
 *
 * Pipeline:
 *   Pass 1: Communities (single batch, ~140 requests)
 *   Digest: Group communities by location
 *   Pass 2: Users (single batch, ~69 requests)
 *   Pass 3: Venues (single batch, ~69 requests)
 */

import {
	existsSync,
	mkdirSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs'
import { faker } from '@faker-js/faker'
import { z } from 'zod'
import {
	type BatchRequest,
	getBatchTotalCost,
	resetBatchCost,
	submitBatch,
} from './generators/batch'
import { CommunityPrompts, UserPrompts, VenuePrompts } from './prompts/llm'
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
import { config, paths } from './utils/config'
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
// Venue Schema
// ---------------------------------------------------------------------------

const VenueBatchSchema = z.object({
	venues: z.array(z.string().min(1)).min(5).max(20),
})

// ---------------------------------------------------------------------------
// Pass 1: Community Generation (Batch API)
// ---------------------------------------------------------------------------

async function generateCommunities(
	targetCount: number,
	categories: Category[]
): Promise<LLMCommunity[]> {
	const batchSize = 3
	const batches = Math.ceil(targetCount / batchSize)
	const categoryNames = categories.map((c) => c.name)

	// Build all batch requests upfront
	const requests: BatchRequest[] = Array.from({ length: batches }, (_, i) => {
		const currentBatchSize = Math.min(batchSize, targetCount - i * batchSize)
		const batchLocationSlugs = faker.helpers.arrayElements(
			[...LOCATION_SLUGS],
			Math.min(currentBatchSize * 2, LOCATION_SLUGS.length)
		)
		const startIdx = (i * batchSize) % categoryNames.length
		const batchCategories = Array.from(
			{ length: currentBatchSize },
			(_, j) => categoryNames[(startIdx + j) % categoryNames.length]
		)

		return {
			customId: `communities-batch-${i + 1}`,
			system: CommunityPrompts.system,
			prompt: CommunityPrompts.user(
				currentBatchSize,
				batchLocationSlugs,
				batchCategories,
				LOCATION_SLUG_TO_NAME
			),
		}
	}).filter((_, i) => Math.min(batchSize, targetCount - i * batchSize) > 0)

	const results = await submitBatch(
		requests,
		LLMCommunityBatchSchema,
		'communities'
	)

	// Save batch results in the format process.ts expects
	mkdirSync(paths.batchesDir, { recursive: true })
	const allCommunities: LLMCommunity[] = []
	for (const r of results) {
		if (r.data) {
			allCommunities.push(...r.data.communities)
			writeFileSync(
				`${paths.batchesDir}/${r.customId}.json`,
				JSON.stringify({ communities: r.data.communities }, null, 2)
			)
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
// Pass 2: User Generation (Batch API, location-grouped)
// ---------------------------------------------------------------------------

async function generateUsers(
	targetCount: number,
	communities: LLMCommunity[],
	categories: Category[]
): Promise<LLMUserPersona[]> {
	const digest = buildCommunityDigest(communities)
	const categoryNames = categories.map((c) => c.name)

	const locationsWithCommunities = Object.keys(digest)
	const allLocations = [...LOCATION_SLUGS]
	const usersPerLocation = Math.max(
		1,
		Math.ceil(targetCount / allLocations.length)
	)

	// Prioritize locations with communities
	const sortedLocations = [
		...locationsWithCommunities,
		...allLocations.filter((s) => !locationsWithCommunities.includes(s)),
	]

	const requests: BatchRequest[] = sortedLocations.map((slug) => {
		const batchSize = Math.min(usersPerLocation, 15)
		const locationDigest = digest[slug]
			? digest[slug]
			: `No communities yet in ${LOCATION_SLUG_TO_NAME[slug] ?? slug} — generate users with general interests.`

		return {
			customId: `users-batch-${slug}`,
			system: UserPrompts.system,
			prompt: UserPrompts.user(
				batchSize,
				[slug],
				categoryNames,
				LOCATION_SLUG_TO_NAME,
				locationDigest
			),
		}
	})

	const results = await submitBatch(requests, LLMUserBatchSchema, 'users')

	// Save batch results in the format process.ts expects
	const allUsers: LLMUserPersona[] = []
	for (const r of results) {
		if (r.data) {
			allUsers.push(...r.data.users)
			writeFileSync(
				`${paths.batchesDir}/${r.customId}.json`,
				JSON.stringify({ users: r.data.users }, null, 2)
			)
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
// Pass 3: Venue Generation (Batch API)
// ---------------------------------------------------------------------------

async function generateVenues(): Promise<Record<string, string[]>> {
	const requests: BatchRequest[] = LOCATION_SLUGS.map((slug) => {
		const cityName = LOCATION_SLUG_TO_NAME[slug] ?? slug
		return {
			customId: `venue-${slug}`,
			system: VenuePrompts.system,
			prompt: VenuePrompts.user(cityName, slug),
		}
	})

	const results = await submitBatch(requests, VenueBatchSchema, 'venues')

	const venues: Record<string, string[]> = {}
	for (const r of results) {
		if (r.data) {
			const slug = r.customId.replace('venue-', '')
			const cityName = LOCATION_SLUG_TO_NAME[slug] ?? slug
			venues[cityName] = r.data.venues
		}
	}

	// Save to cache for process.ts to pick up
	mkdirSync(paths.cacheDir, { recursive: true })
	writeFileSync(
		`${paths.cacheDir}/venues.json`,
		JSON.stringify(venues, null, 2)
	)
	logger.info(`Saved ${Object.keys(venues).length} city venues to cache`)

	return venues
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export class DataGenerator {
	async generateAll(): Promise<{
		communities: LLMCommunity[]
		users: LLMUserPersona[]
		venues: Record<string, string[]>
	}> {
		logger.info('Starting batch data generation', {
			communities: config.NUM_COMMUNITIES,
			users: config.NUM_USERS,
			useLLM: config.USE_LLM,
			budget: `$${config.SEED_BUDGET_USD}`,
		})

		if (!config.USE_LLM || !process.env.ANTHROPIC_API_KEY) {
			logger.warn('LLM disabled or no API key — skipping generation')
			return { communities: [], users: [], venues: {} }
		}

		resetBatchCost()

		// Clear stale batch files from previous runs to prevent mixing
		if (existsSync(paths.batchesDir)) {
			const stale = readdirSync(paths.batchesDir).filter((f) =>
				f.endsWith('.json')
			)
			for (const f of stale) rmSync(`${paths.batchesDir}/${f}`)
			if (stale.length > 0) {
				logger.info(`Cleared ${stale.length} stale batch files`)
			}
		}

		const categories = loadCategorySlugs()

		// Pass 1: Communities
		logger.info('=== Pass 1: Community Generation (Batch API) ===')
		const communities = await generateCommunities(
			config.NUM_COMMUNITIES,
			categories
		)
		logger.info('Pass 1 complete', {
			communities: communities.length,
			cost: `$${getBatchTotalCost().toFixed(4)}`,
		})

		// Pass 2: Users (with community digest context)
		logger.info('=== Pass 2: User Generation (Batch API) ===')
		const users = await generateUsers(config.NUM_USERS, communities, categories)
		logger.info('Pass 2 complete', {
			users: users.length,
			cost: `$${getBatchTotalCost().toFixed(4)}`,
		})

		// Pass 3: Venues
		logger.info('=== Pass 3: Venue Generation (Batch API) ===')
		const venues = await generateVenues()
		logger.info('Pass 3 complete', {
			cities: Object.keys(venues).length,
			totalCost: `$${getBatchTotalCost().toFixed(4)}`,
		})

		logger.info('All passes complete', {
			communities: communities.length,
			users: users.length,
			venues: Object.keys(venues).length,
			totalCost: `$${getBatchTotalCost().toFixed(4)}`,
		})

		return { communities, users, venues }
	}

	async generateCommunities() {
		const categories = loadCategorySlugs()
		return generateCommunities(config.NUM_COMMUNITIES, categories)
	}

	async generateUsers(communities: LLMCommunity[], count?: number) {
		const categories = loadCategorySlugs()
		return generateUsers(count ?? config.NUM_USERS, communities, categories)
	}

	async generateVenues() {
		return generateVenues()
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
