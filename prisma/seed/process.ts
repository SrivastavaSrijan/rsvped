#!/usr/bin/env tsx
/**
 * Process Batch Data
 *
 * Validates, transforms, and distributes batch data for seeding.
 * With enum-enforced location slugs, fuzzy location matching is no longer needed.
 */

/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */

import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import {
	categoriesStaticSchema,
	LLMCommunityBatchSchema,
	LLMUserBatchSchema,
	LOCATION_SLUG_TO_NAME,
	locationsStaticSchema,
	logger,
	validateBatchFile,
	venuesStaticSchema,
} from './utils'
import { config, paths } from './utils/config'
import {
	safeReadJSON,
	safeWriteJSON,
	setupGlobalErrorHandler,
	ValidationError,
	validateFile,
} from './utils/errors'

// Setup error handling
setupGlobalErrorHandler('process')

function getTimestamp(): string {
	const now = new Date()
	return (
		now.toISOString().replace(/[:.]/g, '-').split('T')[0] +
		'_' +
		now.toISOString().split('T')[1].substring(0, 8).replace(/:/g, '-')
	)
}

async function processData() {
	const operation = logger.startOperation('process_batch_data')

	try {
		logger.info('Starting batch data processing', {
			minEventsPerCity: config.MIN_EVENTS_PER_CITY,
			paths: paths,
		})

		// Validate required directories exist
		validateFile(paths.batchesDir, 'batches directory')
		validateFile(paths.staticDir, 'static directory')

		// Load and validate static data
		logger.info('Loading static data files')

		let locations: any, venues: any, categories: any
		try {
			const locationsPath = path.join(paths.staticDir, 'locations.json')
			logger.debug('Reading locations file', { path: locationsPath })

			if (!existsSync(locationsPath)) {
				throw new Error(`Locations file does not exist at: ${locationsPath}`)
			}

			const locationsData = safeReadJSON(locationsPath)
			if (!locationsData) {
				throw new Error('Locations file returned null data')
			}

			locations = validateBatchFile(
				locationsData,
				locationsStaticSchema,
				'locations.json'
			)
			logger.debug('Locations loaded successfully', { count: locations.length })
		} catch (error) {
			logger.error('Failed to load locations.json', {
				error: error instanceof Error ? error.message : error,
				stack: error instanceof Error ? error.stack : undefined,
			})
			throw error
		}

		try {
			const venuesPath = path.join(paths.staticDir, 'venues.json')
			logger.debug('Reading venues file', { path: venuesPath })
			const venuesData = safeReadJSON(venuesPath)

			if (!venuesData) {
				throw new Error('Venues file returned null data')
			}

			venues = validateBatchFile(venuesData, venuesStaticSchema, 'venues.json')
			logger.debug('Venues loaded successfully', { count: venues.length })
		} catch (error) {
			logger.error('Failed to load venues.json', error)
			throw error
		}

		try {
			const categoriesPath = path.join(paths.staticDir, 'categories.json')
			logger.debug('Reading categories file', { path: categoriesPath })
			const categoriesData = safeReadJSON(categoriesPath)

			if (!categoriesData) {
				throw new Error('Categories file returned null data')
			}

			categories = validateBatchFile(
				categoriesData,
				categoriesStaticSchema,
				'categories.json'
			)
			logger.debug('Categories loaded successfully', {
				count: categories.length,
			})
		} catch (error) {
			logger.error('Failed to load categories.json', error)
			throw error
		}

		// Load and validate batch data
		logger.info('Loading batch data files')
		const batchFiles = readdirSync(paths.batchesDir).filter((f) =>
			f.endsWith('.json')
		)
		logger.debug('Found batch files', { files: batchFiles })

		const communitiesFiles = batchFiles.filter((f) =>
			f.startsWith('communities-batch-')
		)
		const usersFiles = batchFiles.filter((f) => f.startsWith('users-batch-'))

		if (communitiesFiles.length === 0 || usersFiles.length === 0) {
			throw new ValidationError(
				'Missing required batch files. Expected communities-batch-*.json and users-batch-*.json',
				'batch_files'
			)
		}

		// Load and combine all communities batch files
		const allCommunities: any[] = []
		for (const communitiesFile of communitiesFiles) {
			try {
				const communitiesData = safeReadJSON(
					path.join(paths.batchesDir, communitiesFile)
				)
				const validatedData = validateBatchFile(
					communitiesData,
					LLMCommunityBatchSchema,
					communitiesFile
				)
				allCommunities.push(...validatedData.communities)
			} catch (error) {
				logger.error('Failed to load communities batch - discarding file', {
					file: communitiesFile,
					error: error instanceof Error ? error.message : error,
				})
			}
		}

		// Load and combine all users batch files
		const allUsers: any[] = []
		for (const usersFile of usersFiles) {
			try {
				const usersData = safeReadJSON(path.join(paths.batchesDir, usersFile))
				const validatedData = validateBatchFile(
					usersData,
					LLMUserBatchSchema,
					usersFile
				)
				allUsers.push(...validatedData.users)
			} catch (error) {
				logger.error('Failed to load users batch - discarding file', {
					file: usersFile,
					error: error instanceof Error ? error.message : error,
				})
			}
		}

		if (allCommunities.length === 0) {
			throw new ValidationError(
				'No valid communities found in any batch file',
				'communities_validation'
			)
		}

		if (allUsers.length === 0) {
			throw new ValidationError(
				'No valid users found in any batch file',
				'users_validation'
			)
		}

		const communities = { communities: allCommunities }
		const users = { users: allUsers }

		logger.info('Successfully loaded and validated data', {
			communities: communities.communities.length,
			users: users.users.length,
			locations: locations.length,
			venues: venues.length,
		})

		// Create event distribution
		// With enum-enforced location slugs, communities already have valid slugs.
		// Use the slug-to-name map to distribute events by city name.
		logger.info('Creating event distribution system')
		const eventsByCity: Record<string, any[]> = {}
		locations.forEach((location: any) => {
			eventsByCity[location.name] = []
		})

		// Place community events in their cities — direct slug lookup, no fuzzy matching
		communities.communities.forEach((community: any) => {
			const slug = community.homeLocation
			const cityName = LOCATION_SLUG_TO_NAME[slug]

			if (!cityName || !eventsByCity[cityName]) {
				logger.warn('Unknown location slug, skipping community events', {
					slug,
					community: community.name,
				})
				return
			}

			community.events?.forEach((event: any) => {
				eventsByCity[cityName].push({
					...event,
					communityName: community.name,
					communityFocusArea: community.focusArea,
					homeLocation: cityName,
					categories: community.categories,
				})
			})
		})

		logger.info('Direct location mapping complete', {
			totalCommunities: communities.communities.length,
		})

		// Ensure minimum events per city
		const allEventTemplates = Object.values(eventsByCity).flat()
		Object.keys(eventsByCity).forEach((cityName) => {
			const cityEvents = eventsByCity[cityName]
			while (
				cityEvents.length < config.MIN_EVENTS_PER_CITY &&
				allEventTemplates.length > 0
			) {
				const template =
					allEventTemplates[cityEvents.length % allEventTemplates.length]
				cityEvents.push({
					...template,
					title: `${template.title} - ${cityName} Edition`,
					homeLocation: cityName,
				})
			}
		})

		const totalEvents = Object.values(eventsByCity).reduce(
			(sum, events) => sum + events.length,
			0
		)
		const citiesWithEvents = Object.keys(eventsByCity).filter(
			(city) => eventsByCity[city].length > 0
		)

		logger.info('Event distribution complete', {
			totalEvents,
			citiesWithEvents: citiesWithEvents.length,
			averageEventsPerCity: Math.round(totalEvents / citiesWithEvents.length),
		})

		// Create processed directory if it doesn't exist
		if (!existsSync(paths.processedDir)) {
			mkdirSync(paths.processedDir, { recursive: true })
		}

		// Save processed files
		const timestamp = getTimestamp()

		const communitiesOutputFile = path.join(
			paths.processedDir,
			`communities-final-${timestamp}.json`
		)
		safeWriteJSON(communitiesOutputFile, {
			metadata: {
				generatedAt: new Date().toISOString(),
				totalCommunities: communities.communities.length,
				processor: 'batch-processor',
			},
			communities: communities.communities,
		})

		const usersOutputFile = path.join(
			paths.processedDir,
			`users-final-${timestamp}.json`
		)
		safeWriteJSON(usersOutputFile, {
			metadata: {
				generatedAt: new Date().toISOString(),
				totalUsers: users.users.length,
				processor: 'batch-processor',
			},
			users: users.users,
		})

		const eventsFile = path.join(
			paths.processedDir,
			`events-distributed-${timestamp}.json`
		)
		safeWriteJSON(eventsFile, {
			metadata: {
				generatedAt: new Date().toISOString(),
				minEventsPerCity: config.MIN_EVENTS_PER_CITY,
				totalCities: Object.keys(eventsByCity).length,
				totalEvents,
				citiesWithEvents: citiesWithEvents.length,
				processor: 'batch-processor',
			},
			eventsByCity,
		})

		logger.info('Processing completed successfully', {
			processedFiles: 3,
			outputDirectory: paths.processedDir,
		})

		operation.complete({
			totalEvents,
			citiesWithEvents: citiesWithEvents.length,
			filesCreated: 3,
		})
	} catch (error) {
		operation.fail(error)
		throw error
	}
}

async function main() {
	try {
		await processData()
		logger.info('Data is ready for seeding. Run: yarn workflow seed')
		process.exit(0)
	} catch (error) {
		logger.error('Processing failed', error)
		process.exit(1)
	}
}

// Run the processor
if (require.main === module) {
	main()
}
