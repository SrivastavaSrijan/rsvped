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
} from './validation'

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
		const locations = validateBatchFile(
			safeReadJSON(path.join(paths.staticDir, 'locations.json')),
			locationsStaticSchema,
			'locations.json'
		)

		const venues = validateBatchFile(
			safeReadJSON(path.join(paths.staticDir, 'venues.json')),
			venuesStaticSchema,
			'venues.json'
		)

		// Load and validate batch data
		logger.info('Loading batch data files')
		const batchFiles = readdirSync(paths.batchesDir).filter((f) =>
			f.endsWith('.json')
		)
		const communitiesFile = batchFiles.find((f) =>
			f.startsWith('communities-batch-')
		)
		const usersFile = batchFiles.find((f) => f.startsWith('users-batch-'))

		if (!communitiesFile || !usersFile) {
			throw new ValidationError(
				'Missing required batch files. Expected communities-batch-*.json and users-batch-*.json',
				'batch_files'
			)
		}

		const communities = validateBatchFile(
			safeReadJSON(path.join(paths.batchesDir, communitiesFile)),
			communitiesBatchSchema,
			communitiesFile
		)

		const users = validateBatchFile(
			safeReadJSON(path.join(paths.batchesDir, usersFile)),
			usersBatchSchema,
			usersFile
		)

		logger.info('Successfully loaded and validated data', {
			communities: communities.communities.length,
			users: users.users.length,
			locations: locations.length,
			venues: venues.length,
		})

		// Create event distribution
		logger.info('Creating event distribution system')
		const eventsByCity: Record<string, any[]> = {}
		locations.forEach((location) => {
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
