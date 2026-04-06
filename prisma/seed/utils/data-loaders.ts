/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { logger, processedDataSchema } from '../utils'
import { paths } from './config'
import type { Category } from './schemas'

/**
 * Load category data from the static categories.json (single source of truth).
 */
export function loadCategorySlugs(): Category[] {
	const jsonPath = path.join(__dirname, '..', 'data', 'categories.json')
	try {
		const categories = JSON.parse(readFileSync(jsonPath, 'utf8')) as Array<{
			name: string
			slug: string
		}>
		return categories
			.map((c) => ({ name: c.name, slug: c.slug }) as Category)
			.filter((c) => c.name && c.slug)
	} catch {
		logger.warn('Failed to load categories from JSON, using fallback')
		return [
			{ name: 'Tech & Startups', slug: 'tech-startups' },
			{ name: 'Arts & Culture', slug: 'arts-culture' },
			{ name: 'Food & Drinks', slug: 'food-drinks' },
			{ name: 'Sports & Fitness', slug: 'sports-fitness' },
			{ name: 'Music & Concerts', slug: 'music-concerts' },
			{ name: 'Networking & Career', slug: 'networking-career' },
		]
	}
}

export function loadProcessedBatchData() {
	const operation = logger.startOperation('load_batch_data')

	try {
		// Load processed data (get latest by filename)
		const processedDir = `${paths.dataDir}/processed`

		if (!existsSync(processedDir)) {
			logger.warn('No processed directory found. Run: yarn workflow process')
			operation.complete({ loaded: false })
			return null
		}

		const processedFiles = readdirSync(processedDir)
			.filter((f) => f.endsWith('.json'))
			.sort()
			.reverse()

		const communitiesFile = processedFiles.find((f) =>
			f.startsWith('communities-final-')
		)
		const usersFile = processedFiles.find((f) => f.startsWith('users-final-'))
		const eventsFile = processedFiles.find((f) =>
			f.startsWith('events-distributed-')
		)

		if (!communitiesFile || !usersFile || !eventsFile) {
			logger.warn('Missing processed files. Run: yarn workflow process')
			operation.complete({ loaded: false })
			return null
		}

		logger.info('Loading processed batch files', {
			communities: communitiesFile,
			users: usersFile,
			events: eventsFile,
		})

		const venues = JSON.parse(
			readFileSync(`${paths.cacheDir}/venues.json`, 'utf8')
		)
		const communitiesData = JSON.parse(
			readFileSync(`${processedDir}/${communitiesFile}`, 'utf8')
		)
		const usersData = JSON.parse(
			readFileSync(`${processedDir}/${usersFile}`, 'utf8')
		)
		const eventsData = JSON.parse(
			readFileSync(`${processedDir}/${eventsFile}`, 'utf8')
		)

		const result = {
			venues: processedDataSchema.pick({ venues: true }).parse({ venues }),
			communities: processedDataSchema
				.pick({ communities: true })
				.parse(communitiesData)?.communities,
			users: processedDataSchema.pick({ users: true }).parse(usersData)?.users,
			eventsByCity: processedDataSchema
				.pick({ eventsByCity: true })
				.parse(eventsData)?.eventsByCity,
			metadata: {
				communities: communitiesData.metadata,
				users: usersData.metadata,
				events: eventsData.metadata,
			},
		}

		operation.complete({
			loaded: true,
			communities: result.communities.length,
			users: result.users.length,
			totalEvents: Object.values(result.eventsByCity).reduce(
				(sum: any, events: any) => sum + events.length,
				0
			),
		})

		return result
	} catch (error) {
		operation.fail(error)
		logger.error('Failed to load batch data. Run: yarn workflow process')
		return null
	}
}
