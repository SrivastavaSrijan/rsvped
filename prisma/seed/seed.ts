/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
/** biome-ignore-all lint/suspicious/noConsole: its fine */
// prisma/seed/seed-new.ts

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
// Import utilities and creators
import {
	fetchUnsplashImages,
	loadProcessedBatchData,
	logger,
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

	try {
		logger.info('Starting database seeding')
		logger.stats({
			'Target users': config.NUM_USERS,
			'Target communities': config.NUM_COMMUNITIES,
			'Extra events': config.EXTRA_STANDALONE_EVENTS,
			'Should wipe': config.SHOULD_WIPE ? 'Yes' : 'No',
		})

		if (config.SHOULD_WIPE) {
			logger.info('Wiping existing database data')
			await wipeDb(prisma)
		}

		logger.info('Fetching images from Unsplash')
		const images = await fetchUnsplashImages()
		logger.success(`Images ready: ${images.length} available`)

		logger.info('Loading processed batch data')
		const batchData = loadProcessedBatchData()
		// Get categories from database (like locations)
		logger.info('Loading locations, categories from database')
		const allCategories = await prisma.category.findMany()
		logger.info('Categories ready', { count: allCategories.length })
		const allLocations = await prisma.location.findMany()
		logger.info('Locations ready', { count: allLocations.length })

		logger.info('Creating users')
		const users = await createUsers(
			prisma,
			config.NUM_USERS,
			allCategories,
			allLocations,
			batchData
		)

		logger.info('Assigning user category interests')

		logger.info('Creating communities')
		const { communities } = await createCommunities(
			prisma,
			users,
			images,
			allLocations,
			batchData
		)

		logger.info('Creating events')
		const events = await createEventsFromBatchData(
			prisma,
			batchData,
			communities,
			allCategories,
			users,
			images,
			allLocations
		)

		logger.info('Assigning categories to events')

		logger.info('Creating ticket tiers')
		const ticketTiers = await createTicketTiers(prisma, events)

		logger.info('Creating promo codes')
		const promoCodes = await createPromoCodes(prisma, events, ticketTiers)

		logger.info('Creating registration questions')
		const questions = await createRegistrationQuestions(prisma, events)

		logger.info(
			'Creating orders, payments, RSVPs, and collaborators (intelligent matching)'
		)
		const { orders, rsvps, payments } = await createOrdersAndRSVPs(
			prisma,
			events,
			users,
			ticketTiers,
			questions
		)

		logger.info('Backfilling daily stats')
		await backfillDailyStats(prisma, events)

		logger.timeEnd('Complete seed operation')
		logger.stats(
			{
				'Total users': users.length,
				'Total communities': communities.length,
				'Total categories': allCategories.length,
				'Total events': events.length,
				'Ticket tiers': ticketTiers.length,
				'Promo codes': promoCodes.length,
				Orders: orders.length,
				RSVPs: rsvps.length,
				Payments: payments.length,
			},
			'Final seed results'
		)

		logger.success('Database seeding completed successfully!')
	} catch (error) {
		logger.timeEnd('Complete seed operation')
		logger.error('Database seeding failed:', error)
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
