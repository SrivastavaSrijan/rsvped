#!/usr/bin/env tsx
/**
 * Process Batch Data
 *
 * Production-ready processor that validates, transforms, and distributes
 * batch data for seeding with proper error handling and logging.
 */

/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */

import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { config, paths } from './config'
import {
	safeReadJSON,
	safeWriteJSON,
	setupGlobalErrorHandler,
	ValidationError,
	validateFile,
} from './errors'
import { logger } from './logger'
import {
	communitiesBatchSchema,
	locationsStaticSchema,
	usersBatchSchema,
	validateBatchFile,
	venuesStaticSchema,
} from './schemas'

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

		let locations: any, venues: any
		try {
			const locationsPath = path.join(paths.staticDir, 'locations.json')
			logger.debug('Reading locations file', { path: locationsPath })

			// Check if file exists
			if (!existsSync(locationsPath)) {
				throw new Error(`Locations file does not exist at: ${locationsPath}`)
			}

			const locationsData = safeReadJSON(locationsPath)
			logger.debug('Raw locations data loaded', {
				type: typeof locationsData,
				isArray: Array.isArray(locationsData),
				keys: locationsData ? Object.keys(locationsData) : 'null',
			})

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

		// Load and validate batch data
		logger.info('Loading batch data files')
		const batchFiles = readdirSync(paths.batchesDir).filter((f) =>
			f.endsWith('.json')
		)
		logger.debug('Found batch files', { files: batchFiles })

		const communitiesFile = batchFiles.find((f) =>
			f.startsWith('communities-batch-')
		)
		const usersFile = batchFiles.find((f) => f.startsWith('users-batch-'))

		logger.debug('Identified batch files', {
			communitiesFile,
			usersFile,
		})

		if (!communitiesFile || !usersFile) {
			throw new ValidationError(
				'Missing required batch files. Expected communities-batch-*.json and users-batch-*.json',
				'batch_files'
			)
		}

		let communities: any, users: any
		try {
			logger.debug('Loading communities batch file', { file: communitiesFile })
			const communitiesData = safeReadJSON(
				path.join(paths.batchesDir, communitiesFile)
			)
			communities = validateBatchFile(
				communitiesData,
				communitiesBatchSchema,
				communitiesFile
			)
			logger.debug('Communities loaded successfully', {
				count: communities.communities?.length,
			})
		} catch (error) {
			logger.error('Failed to load communities batch', {
				file: communitiesFile,
				error: error instanceof Error ? error.message : error,
			})
			throw error
		}

		try {
			logger.debug('Loading users batch file', { file: usersFile })
			const usersData = safeReadJSON(path.join(paths.batchesDir, usersFile))
			users = validateBatchFile(usersData, usersBatchSchema, usersFile)
			logger.debug('Users loaded successfully', { count: users.users?.length })
		} catch (error) {
			logger.error('Failed to load users batch', {
				file: usersFile,
				error: error instanceof Error ? error.message : error,
			})
			throw error
		}

		logger.info('Successfully loaded and validated data', {
			communities: communities.communities.length,
			users: users.users.length,
			locations: locations.length,
			venues: venues.length,
		})

		// Create event distribution
		logger.info('Creating event distribution system')
		const eventsByCity: Record<string, any[]> = {}
		locations.forEach((location: any) => {
			eventsByCity[location.name] = []
		})

		// Place community events in their cities
		communities.communities.forEach((community: any) => {
			const cityName = community.homeLocation
			if (eventsByCity[cityName]) {
				community.events?.forEach((event: any) => {
					eventsByCity[cityName].push({
						...event,
						communityName: community.name,
						communityFocusArea: community.focusArea,
						homeLocation: cityName,
					})
				})
			}
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

		// Save processed files with timestamps
		const timestamp = getTimestamp()

		// 1. Save communities
		const communitiesOutputFile = path.join(
			paths.processedDir,
			`communities-final-${timestamp}.json`
		)
		const communitiesData = {
			metadata: {
				generatedAt: new Date().toISOString(),
				totalCommunities: communities.communities.length,
				processor: 'batch-processor',
			},
			communities: communities.communities,
		}
		safeWriteJSON(communitiesOutputFile, communitiesData)
		logger.debug('Saved communities file', {
			file: path.basename(communitiesOutputFile),
		})

		// 2. Save users
		const usersOutputFile = path.join(
			paths.processedDir,
			`users-final-${timestamp}.json`
		)
		const usersData = {
			metadata: {
				generatedAt: new Date().toISOString(),
				totalUsers: users.users.length,
				processor: 'batch-processor',
			},
			users: users.users,
		}
		safeWriteJSON(usersOutputFile, usersData)
		logger.debug('Saved users file', { file: path.basename(usersOutputFile) })

		// 3. Save distributed events
		const eventsFile = path.join(
			paths.processedDir,
			`events-distributed-${timestamp}.json`
		)
		const eventsData = {
			metadata: {
				generatedAt: new Date().toISOString(),
				minEventsPerCity: config.MIN_EVENTS_PER_CITY,
				totalCities: Object.keys(eventsByCity).length,
				totalEvents,
				citiesWithEvents: citiesWithEvents.length,
				processor: 'batch-processor',
			},
			eventsByCity,
		}
		safeWriteJSON(eventsFile, eventsData)
		logger.debug('Saved events file', { file: path.basename(eventsFile) })

		logger.info('Processing completed successfully', {
			processedFiles: 3,
			outputDirectory: paths.processedDir,
			filesCreated: [
				path.basename(communitiesOutputFile),
				path.basename(usersOutputFile),
				path.basename(eventsFile),
			],
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
