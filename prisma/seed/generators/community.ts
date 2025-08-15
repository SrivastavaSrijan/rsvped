/**
 * Community Generator
 *
 * Professional LLM-based community data generation.
 */

import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { config } from '../config'
import { logger } from '../logger'
import { CommunityPrompts } from '../prompts/llm'
import { type LLMCommunity, LLMCommunityBatchSchema } from '../schemas'
import { cache } from './cache'
import { llm } from './llm'

export class CommunityGenerator {
	private prisma: PrismaClient

	constructor() {
		this.prisma = new PrismaClient()
	}

	/**
	 * Generate communities using LLM with intelligent caching
	 */
	async generate(): Promise<LLMCommunity[]> {
		logger.info('Starting community generation', {
			target: config.NUM_COMMUNITIES,
			useLLM: config.USE_LLM,
		})

		// Check existing cache
		const existingCommunities = cache.loadCachedCommunities()
		logger.info('Loaded cached communities', {
			count: existingCommunities.length,
		})

		if (existingCommunities.length >= config.NUM_COMMUNITIES) {
			logger.info('Sufficient cached communities found')
			return existingCommunities.slice(0, config.NUM_COMMUNITIES)
		}

		if (!config.USE_LLM || !llm.isAvailable()) {
			logger.warn('LLM unavailable, returning cached data only')
			return existingCommunities.slice(0, config.NUM_COMMUNITIES)
		}

		// Generate remaining communities
		const remaining = config.NUM_COMMUNITIES - existingCommunities.length
		const newCommunities = await this.generateBatches(remaining)

		// Combine and deduplicate
		const allCommunities = [...existingCommunities, ...newCommunities]
		const final = this.deduplicate(allCommunities).slice(
			0,
			config.NUM_COMMUNITIES
		)

		logger.info('Community generation complete', {
			cached: existingCommunities.length,
			generated: newCommunities.length,
			final: final.length,
		})

		return final
	}

	/**
	 * Generate communities in optimized batches
	 */
	private async generateBatches(targetCount: number): Promise<LLMCommunity[]> {
		const batchSize = Math.min(config.BATCH_SIZE, 8) // Reduced for richer content
		const batches = Math.ceil(targetCount / batchSize)
		const locations = await this.loadLocations()
		const locationNames = locations.map((l) => l.name)

		const allCommunities: LLMCommunity[] = []

		for (let i = 0; i < batches; i++) {
			const currentBatchSize = Math.min(
				batchSize,
				targetCount - allCommunities.length
			)
			if (currentBatchSize <= 0) break

			logger.info(`Generating community batch ${i + 1}/${batches}`, {
				size: currentBatchSize,
			})

			try {
				const batchCommunities = await this.generateSingleBatch(
					currentBatchSize,
					locationNames
				)

				if (batchCommunities.length > 0) {
					cache.saveCommunityBatch(batchCommunities, `gen-${Date.now()}-${i}`)
					allCommunities.push(...batchCommunities)
					logger.info(`Batch ${i + 1} completed`, {
						generated: batchCommunities.length,
					})
				} else {
					logger.warn(`Batch ${i + 1} generated no communities`)
				}

				// Rate limiting between batches
				if (i < batches - 1) {
					await new Promise((resolve) => setTimeout(resolve, 1500))
				}
			} catch (error) {
				logger.error(`Batch ${i + 1} failed`, { error })
				// Continue with next batch
			}
		}

		return allCommunities
	}

	/**
	 * Generate a single batch of communities
	 */
	private async generateSingleBatch(
		batchSize: number,
		locationNames: string[]
	): Promise<LLMCommunity[]> {
		// Select diverse locations for this batch
		const batchLocations = faker.helpers.arrayElements(
			locationNames,
			Math.min(batchSize * 2, locationNames.length)
		)

		const prompt = CommunityPrompts.user(batchSize, batchLocations)
		const result = await llm.generate(
			prompt,
			CommunityPrompts.system,
			LLMCommunityBatchSchema,
			`community-batch-${batchSize}`
		)

		return (result as { communities: LLMCommunity[] }).communities || []
	}

	/**
	 * Load location data from database or fallback
	 */
	private async loadLocations(): Promise<Array<{ name: string }>> {
		try {
			const locations = await this.prisma.location.findMany({
				select: { name: true },
				orderBy: { name: 'asc' },
			})

			if (locations.length > 0) {
				logger.debug('Loaded locations from database', {
					count: locations.length,
				})
				return locations
			}
		} catch (error) {
			logger.warn('Failed to load locations from database', { error })
		}

		// Fallback to static locations
		const fallback = [
			{ name: 'New York City' },
			{ name: 'San Francisco' },
			{ name: 'London' },
			{ name: 'Berlin' },
			{ name: 'Tokyo' },
			{ name: 'Sydney' },
			{ name: 'Toronto' },
			{ name: 'Paris' },
			{ name: 'Singapore' },
			{ name: 'Amsterdam' },
		]

		logger.info('Using fallback locations', { count: fallback.length })
		return fallback
	}

	/**
	 * Deduplicate communities by name and location
	 */
	private deduplicate(communities: LLMCommunity[]): LLMCommunity[] {
		const seen = new Set<string>()
		const deduplicated: LLMCommunity[] = []

		for (const community of communities) {
			if (!community?.name || !community?.homeLocation) continue

			const key = `${community.name.toLowerCase().trim()}|${community.homeLocation.toLowerCase().trim()}`
			if (seen.has(key)) continue

			seen.add(key)
			deduplicated.push(community)
		}

		return deduplicated
	}

	async cleanup(): Promise<void> {
		await this.prisma.$disconnect()
	}
}

// Export singleton
export const communityGenerator = new CommunityGenerator()
