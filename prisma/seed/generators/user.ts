/**
 * User Generator
 *
 * Professional LLM-based user persona generation.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { UserPrompts } from '../prompts/llm'
import {
	type Category,
	LLMUserBatchSchema,
	type LLMUserPersona,
	logger,
} from '../utils'
import { config, paths } from '../utils/config'
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
		const categories = this.loadCategories()
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
					locationNames,
					categories,
					i
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
		locationNames: string[],
		categories: Category[],
		batchIndex: number
	): Promise<LLMUserPersona[]> {
		// Select diverse locations for this batch
		const batchLocations = faker.helpers.arrayElements(
			locationNames,
			Math.min(10, locationNames.length)
		)

		// Get categories for this batch to ensure diversity
		const batchCategories = this.getCategoriesForBatch(
			categories,
			batchIndex,
			batchSize
		)
		const categoryNames = batchCategories.map((cat: Category) => cat.name)

		const prompt = UserPrompts.user(batchSize, batchLocations, categoryNames)
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
	 * Load categories from static data file
	 */
	private loadCategories(): Category[] {
		try {
			const categoriesPath = path.join(paths.staticDir, 'categories.json')
			const categoriesData = JSON.parse(readFileSync(categoriesPath, 'utf8'))
			return categoriesData as Category[]
		} catch (error) {
			logger.warn('Failed to load categories from static file', { error })
			// Return a minimal fallback set of categories
			return [
				{
					name: 'Technology & Programming',
					slug: 'technology-programming',
				},
				{
					name: 'Business & Entrepreneurship',
					slug: 'business-entrepreneurship',
					subcategories: [
						'Startup Incubation',
						'Business Strategy',
						'Leadership',
					],
				},
				{
					name: 'Design & Creativity',
					slug: 'design-creativity',
				},
			] as Category[]
		}
	}

	/**
	 * Get categories for a specific batch to ensure diversity
	 */
	private getCategoriesForBatch(
		categories: Category[],
		batchIndex: number,
		batchSize: number
	): Category[] {
		// For users, we want to distribute categories more broadly
		// So we take a subset of categories per batch
		const categoriesPerBatch = Math.min(
			Math.ceil(categories.length / 2),
			batchSize
		)
		const startIndex = (batchIndex * categoriesPerBatch) % categories.length
		const result: Category[] = []

		for (let i = 0; i < categoriesPerBatch; i++) {
			const index = (startIndex + i) % categories.length
			result.push(categories[index])
		}

		return result
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
