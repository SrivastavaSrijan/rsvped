/**
 * Main Generator Orchestrator
 *
 * Production-ready LLM data generation system.
 */

import { cache } from './generators/cache'
import { communityGenerator } from './generators/community'
import { userGenerator } from './generators/user'
import { logger } from './utils'
import { config } from './utils/config'

export class DataGenerator {
	/**
	 * Generate all required data for seeding
	 */
	async generateAll(): Promise<{
		communities: Awaited<ReturnType<typeof communityGenerator.generate>>
		users: Awaited<ReturnType<typeof userGenerator.generate>>
	}> {
		logger.info('Starting data generation', {
			communities: config.NUM_COMMUNITIES,
			users: config.NUM_USERS,
			useLLM: config.USE_LLM,
		})

		// Show cache stats
		const stats = cache.getCacheStats()
		logger.info('Cache statistics', stats)

		try {
			// Generate communities and users in parallel
			const [communities, users] = await Promise.all([
				communityGenerator.generate(),
				userGenerator.generate(),
			])

			// Save final processed data
			cache.saveFinalData(communities, users)

			logger.info('Data generation completed successfully', {
				communities: communities.length,
				users: users.length,
			})

			return { communities, users }
		} catch (error) {
			logger.error('Data generation failed', { error })
			throw error
		} finally {
			await this.cleanup()
		}
	}

	/**
	 * Generate only communities
	 */
	async generateCommunities() {
		logger.info('Generating communities only')
		try {
			const communities = await communityGenerator.generate()
			logger.info('Community generation completed', {
				count: communities.length,
			})
			return communities
		} finally {
			await communityGenerator.cleanup()
		}
	}

	/**
	 * Generate only users
	 */
	async generateUsers(count?: number) {
		logger.info('Generating users only', { count })
		try {
			const users = await userGenerator.generate(count)
			logger.info('User generation completed', { count: users.length })
			return users
		} finally {
			await userGenerator.cleanup()
		}
	}

	private async cleanup(): Promise<void> {
		await Promise.all([communityGenerator.cleanup(), userGenerator.cleanup()])
	}
}

// Export functions for backward compatibility
export async function generateCommunitiesWithLLM() {
	const generator = new DataGenerator()
	return generator.generateCommunities()
}

export async function generateUsersWithLLM(count?: number) {
	const generator = new DataGenerator()
	return generator.generateUsers(count)
}

export function loadAllCachedCommunities() {
	return cache.loadCachedCommunities()
}

export function loadAllCachedUsers() {
	return cache.loadCachedUsers()
}

// Main execution
async function main() {
	const generator = new DataGenerator()
	await generator.generateAll()
}

// Run if executed directly
if (require.main === module) {
	main().catch((error) => {
		logger.error('Generator failed', { error })
		process.exit(1)
	})
}
