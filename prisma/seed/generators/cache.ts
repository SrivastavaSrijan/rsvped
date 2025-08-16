/**
 * Cache Manager
 *
 * Handles cached data loading and saving for LLM-generated content.
 */

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { LLMCommunity, LLMUserPersona } from '../utils'
import { logger } from '../utils'
import { paths } from '../utils/config'
import { safeReadJSON } from '../utils/errors'

export class CacheManager {
	constructor() {
		// Ensure cache directories exist
		this.ensureDir(paths.dataDir)
		this.ensureDir(paths.batchesDir)
		this.ensureDir(paths.processedDir)
	}

	private ensureDir(dirPath: string): void {
		if (!existsSync(dirPath)) {
			mkdirSync(dirPath, { recursive: true })
		}
	}

	/**
	 * Load all cached communities
	 */
	loadCachedCommunities(): LLMCommunity[] {
		const communities: LLMCommunity[] = []

		try {
			for (const dir of [paths.batchesDir, paths.processedDir]) {
				if (!existsSync(dir)) continue

				const files = readdirSync(dir)
				for (const file of files) {
					if (file.startsWith('communities-batch-') && file.endsWith('.json')) {
						const filePath = path.join(dir, file)
						const data = safeReadJSON(filePath)

						if (data && typeof data === 'object' && 'communities' in data) {
							const record = data as Record<string, unknown>
							const batchCommunities = record.communities
							if (Array.isArray(batchCommunities)) {
								communities.push(...(batchCommunities as LLMCommunity[]))
							}
						}
					}
				}
			}
		} catch (error) {
			logger.warn('Error loading cached communities', { error })
		}

		return this.deduplicateCommunities(communities)
	}

	/**
	 * Load all cached users
	 */
	loadCachedUsers(): LLMUserPersona[] {
		const users: LLMUserPersona[] = []

		try {
			for (const dir of [paths.batchesDir, paths.processedDir]) {
				if (!existsSync(dir)) continue

				const files = readdirSync(dir)
				for (const file of files) {
					if (file.startsWith('users-batch-') && file.endsWith('.json')) {
						const filePath = path.join(dir, file)
						const data = safeReadJSON(filePath)

						if (data && typeof data === 'object' && 'users' in data) {
							const record = data as Record<string, unknown>
							const batchUsers = record.users
							if (Array.isArray(batchUsers)) {
								users.push(...(batchUsers as LLMUserPersona[]))
							}
						}
					}
				}
			}
		} catch (error) {
			logger.warn('Error loading cached users', { error })
		}

		return this.deduplicateUsers(users)
	}

	/**
	 * Save community batch to cache
	 */
	saveCommunityBatch(communities: LLMCommunity[], batchId?: string): string {
		const filename = `communities-batch-${batchId || Date.now()}.json`
		const filePath = path.join(paths.batchesDir, filename)

		const data = { communities }
		writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')

		logger.debug('Saved community batch', {
			filePath,
			count: communities.length,
		})
		return filePath
	}

	/**
	 * Save user batch to cache
	 */
	saveUserBatch(users: LLMUserPersona[], batchId?: string): string {
		const filename = `users-batch-${batchId || Date.now()}.json`
		const filePath = path.join(paths.batchesDir, filename)

		const data = { users }
		writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')

		logger.debug('Saved user batch', { filePath, count: users.length })
		return filePath
	}

	/**
	 * Save final processed data
	 */
	saveFinalData(communities: LLMCommunity[], users: LLMUserPersona[]): void {
		const communityFile = path.join(paths.processedDir, 'all-communities.json')
		const userFile = path.join(paths.processedDir, 'all-users.json')

		writeFileSync(
			communityFile,
			JSON.stringify({ communities }, null, 2),
			'utf8'
		)
		writeFileSync(userFile, JSON.stringify({ users }, null, 2), 'utf8')

		logger.info('Saved final processed data', {
			communityFile,
			userFile,
			communityCount: communities.length,
			userCount: users.length,
		})
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): {
		communities: number
		users: number
		communityFiles: number
		userFiles: number
	} {
		const communities = this.loadCachedCommunities()
		const users = this.loadCachedUsers()

		const communityFiles = this.countFiles('communities-batch-')
		const userFiles = this.countFiles('users-batch-')

		return {
			communities: communities.length,
			users: users.length,
			communityFiles,
			userFiles,
		}
	}

	private countFiles(prefix: string): number {
		let count = 0
		for (const dir of [paths.batchesDir, paths.processedDir]) {
			if (!existsSync(dir)) continue
			const files = readdirSync(dir)
			count += files.filter(
				(f) => f.startsWith(prefix) && f.endsWith('.json')
			).length
		}
		return count
	}

	private deduplicateCommunities(communities: LLMCommunity[]): LLMCommunity[] {
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

	private deduplicateUsers(users: LLMUserPersona[]): LLMUserPersona[] {
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
}

// Export singleton
export const cache = new CacheManager()
