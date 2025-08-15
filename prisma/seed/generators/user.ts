/**
 * User Generator
 *
 * Professional LLM-based user persona generation.
 */

import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { config } from '../config'
import { logger } from '../logger'
import { UserPrompts } from '../prompts/llm'
import { LLMUserBatchSchema, type LLMUserPersona } from '../schemas'
import { cache } from './cache'
import { llm } from './llm'

export class UserGenerator {
	private prisma: PrismaClient

	constructor() {
		this.prisma = new PrismaClient()
	}

	/**
	 * Generate user personas using LLM with intelligent caching
	 */
	async generate(
		targetCount: number = config.NUM_USERS
	): Promise<LLMUserPersona[]> {
		logger.info('Starting user generation', {
			target: targetCount,
			useLLM: config.USE_LLM,
		})

		// Check existing cache
		const existingUsers = cache.loadCachedUsers()
		logger.info('Loaded cached users', {
			count: existingUsers.length,
		})

		if (existingUsers.length >= targetCount) {
			logger.info('Sufficient cached users found')
			return existingUsers.slice(0, targetCount)
		}

		if (!config.USE_LLM || !llm.isAvailable()) {
			logger.warn('LLM unavailable, returning cached data only')
			return existingUsers.slice(0, targetCount)
		}

		// Generate remaining users
		const remaining = targetCount - existingUsers.length
		const newUsers = await this.generateBatches(remaining)

		// Combine and deduplicate
		const allUsers = [...existingUsers, ...newUsers]
		const final = this.deduplicate(allUsers).slice(0, targetCount)

		logger.info('User generation complete', {
			cached: existingUsers.length,
			generated: newUsers.length,
			final: final.length,
		})

		return final
	}

	/**
	 * Generate users in optimized batches
	 */
	private async generateBatches(
		targetCount: number
	): Promise<LLMUserPersona[]> {
		const batchSize = Math.min(50, Math.max(10, targetCount)) // Optimal batch size for users
		const batches = Math.ceil(targetCount / batchSize)
		const locations = await this.loadLocations()
		const locationNames = locations.map((l) => l.name)

		const allUsers: LLMUserPersona[] = []

		for (let i = 0; i < batches; i++) {
			const currentBatchSize = Math.min(
				batchSize,
				targetCount - allUsers.length
			)
			if (currentBatchSize <= 0) break

			logger.info(`Generating user batch ${i + 1}/${batches}`, {
				size: currentBatchSize,
			})

			try {
				const batchUsers = await this.generateSingleBatch(
					currentBatchSize,
					locationNames
				)

				if (batchUsers.length > 0) {
					cache.saveUserBatch(batchUsers, `gen-${Date.now()}-${i}`)
					allUsers.push(...batchUsers)
					logger.info(`Batch ${i + 1} completed`, {
						generated: batchUsers.length,
					})
				} else {
					logger.warn(`Batch ${i + 1} generated no users`)
				}

				// Rate limiting between batches
				if (i < batches - 1) {
					await new Promise((resolve) => setTimeout(resolve, 1000))
				}
			} catch (error) {
				logger.error(`Batch ${i + 1} failed`, { error })
				// Continue with next batch
			}
		}

		return allUsers
	}

	/**
	 * Generate a single batch of users
	 */
	private async generateSingleBatch(
		batchSize: number,
		locationNames: string[]
	): Promise<LLMUserPersona[]> {
		// Select diverse locations for this batch
		const batchLocations = faker.helpers.arrayElements(
			locationNames,
			Math.min(10, locationNames.length)
		)

		const prompt = UserPrompts.user(batchSize, batchLocations)
		const result = await llm.generate(
			prompt,
			UserPrompts.system,
			LLMUserBatchSchema,
			`user-batch-${batchSize}`
		)

		return (result as { users: LLMUserPersona[] }).users || []
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
			{ name: 'Los Angeles' },
			{ name: 'Chicago' },
			{ name: 'Boston' },
			{ name: 'London' },
			{ name: 'Berlin' },
			{ name: 'Paris' },
			{ name: 'Tokyo' },
			{ name: 'Sydney' },
			{ name: 'Toronto' },
			{ name: 'Vancouver' },
			{ name: 'Singapore' },
			{ name: 'Amsterdam' },
			{ name: 'Stockholm' },
		]

		logger.info('Using fallback locations', { count: fallback.length })
		return fallback
	}

	/**
	 * Deduplicate users by name and location
	 */
	private deduplicate(users: LLMUserPersona[]): LLMUserPersona[] {
		const seen = new Set<string>()
		const deduplicated: LLMUserPersona[] = []

		for (const user of users) {
			if (!user?.firstName || !user?.lastName || !user?.location) continue

			const key = `${user.firstName.toLowerCase().trim()} ${user.lastName.toLowerCase().trim()}|${user.location.toLowerCase().trim()}`
			if (seen.has(key)) continue

			seen.add(key)
			deduplicated.push(user)
		}

		return deduplicated
	}

	async cleanup(): Promise<void> {
		await this.prisma.$disconnect()
	}
}

// Export singleton
export const userGenerator = new UserGenerator()
