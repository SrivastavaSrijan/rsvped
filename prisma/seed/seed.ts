/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
/** biome-ignore-all lint/suspicious/noConsole: its fine */

import { PrismaClient } from '@prisma/client'
import {
	backfillDailyStats,
	createCommunities,
	createEventsFromBatchData,
	createOrdersAndRSVPs,
	createPromoCodes,
	createRegistrationQuestions,
	createTicketTiers,
	createUsers,
} from './creators'
import { seedDemoUser } from './demo'
import { loadStaticData } from './load-static'
import {
	fetchUnsplashImages,
	loadProcessedBatchData,
	logger,
	PipelineRunner,
	wipeDb,
} from './utils'
import { config } from './utils/config'
import { setupGlobalErrorHandler } from './utils/errors'

const prisma = new PrismaClient()

// Setup error handling
setupGlobalErrorHandler('seed')

// --- SEED MAIN -------------------------------------------------
async function main() {
	logger.time('Complete seed operation')
	const pipeline = new PipelineRunner()

	try {
		logger.info('Starting database seeding')
		logger.stats({
			'Target users': config.NUM_USERS,
			'Target communities': config.NUM_COMMUNITIES,
			'Extra events': config.EXTRA_STANDALONE_EVENTS,
			'Should wipe': config.SHOULD_WIPE ? 'Yes' : 'No',
			'Pipeline mode': pipeline.shouldSkipWipe ? 'resume' : 'fresh',
			'Dry run': config.SEED_DRY_RUN ? 'Yes' : 'No',
		})

		// Dry run mode — validate without DB writes
		if (config.SEED_DRY_RUN) {
			logger.info('DRY RUN MODE — validating output without DB writes')
			const batchData = loadProcessedBatchData()
			if (batchData) {
				logger.success('Batch data validated successfully')
				logger.stats({
					Communities: batchData.communities?.length ?? 0,
					Users: batchData.users?.length ?? 0,
				})
			} else {
				logger.warn('No batch data found. Run generation first.')
			}
			logger.timeEnd('Complete seed operation')
			return
		}

		// Wipe DB — only on fresh runs (not resume)
		await pipeline.runStage('wipe-db', async () => {
			if (config.SHOULD_WIPE && !pipeline.shouldSkipWipe) {
				logger.info('Wiping existing database data')
				await wipeDb(prisma)
			} else {
				logger.info('Skipping database wipe', {
					shouldWipe: config.SHOULD_WIPE,
					isResume: pipeline.shouldSkipWipe,
				})
			}
		})

		// Load static data (locations + categories) into DB
		await pipeline.runStage('load-static', async () => {
			logger.info('Loading static data (locations, categories)')
			await loadStaticData(prisma)
		})

		// Shared state — always loaded (even on resume) since these are in-memory
		let users: any[] = []
		let communities: any[] = []
		let events: any[] = []
		let ticketTiers: any[] = []

		logger.info('Fetching images from Unsplash')
		const images = await fetchUnsplashImages()
		logger.success(`Images ready: ${images.length} available`)

		logger.info('Loading processed batch data')
		const batchData = loadProcessedBatchData()

		logger.info('Loading locations, categories from database')
		const allCategories = await prisma.category.findMany()
		logger.info('Categories ready', { count: allCategories.length })
		const allLocations = await prisma.location.findMany()
		logger.info('Locations ready', { count: allLocations.length })

		await pipeline.runStage('create-users', async () => {
			logger.info('Creating users')
			users = await createUsers(
				prisma,
				config.NUM_USERS,
				allCategories,
				allLocations,
				batchData
			)
		})

		await pipeline.runStage('create-communities', async () => {
			logger.info('Creating communities')
			const result = await createCommunities(
				prisma,
				users,
				images,
				allLocations,
				batchData
			)
			communities = result.communities
		})

		await pipeline.runStage('create-events', async () => {
			logger.info('Creating events')
			events = await createEventsFromBatchData(
				prisma,
				batchData,
				communities,
				allCategories,
				users,
				images,
				allLocations
			)
		})

		await pipeline.runStage('create-tickets', async () => {
			logger.info('Creating ticket tiers')
			ticketTiers = await createTicketTiers(prisma, events)

			logger.info('Creating promo codes')
			await createPromoCodes(prisma, events, ticketTiers)

			logger.info('Creating registration questions')
			await createRegistrationQuestions(prisma, events)
		})

		await pipeline.runStage('create-orders', async () => {
			logger.info(
				'Creating orders, payments, RSVPs, and collaborators (intelligent matching)'
			)
			await createOrdersAndRSVPs(
				prisma,
				events,
				users,
				ticketTiers,
				[] // questions loaded in previous stage
			)
		})

		await pipeline.runStage('analytics', async () => {
			logger.info('Backfilling daily stats')
			await backfillDailyStats(prisma, events)
		})

		await pipeline.runStage('demo-user', async () => {
			logger.info('Creating demo user')
			await seedDemoUser(prisma)
			logger.success('Demo user created')
		})

		logger.timeEnd('Complete seed operation')
		logger.stats(
			{
				'Total users': users.length,
				'Total communities': communities.length,
				'Total categories': allCategories.length,
				'Total events': events.length,
				'Ticket tiers': ticketTiers.length,
			},
			'Final seed results'
		)

		logger.success('Database seeding completed successfully!')
	} catch (error) {
		logger.timeEnd('Complete seed operation')
		logger.error('Database seeding failed:', error)
		logger.info('Pipeline state saved. Re-run to resume from last checkpoint.')
		throw error
	}
}

// --- RUN -------------------------------------------------------
main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
