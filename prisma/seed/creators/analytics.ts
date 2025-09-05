/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import type { PrismaClient } from '@prisma/client'
import { logger } from '../utils'

export async function createEventReferrals(
	prisma: PrismaClient,
	events: any[],
	users: any[]
) {
	const operation = logger.startOperation('create_event_referrals')
	const { faker } = await import('@faker-js/faker')

	try {
		const referralRows: any[] = []

		for (const event of events) {
			// Some events have referral tracking
			if (faker.datatype.boolean({ probability: 0.3 })) {
				const referrerCount = faker.number.int({ min: 1, max: 5 })
				const referrers = faker.helpers.arrayElements(users, referrerCount)

				for (const referrer of referrers) {
					const referralCode = `${event.slug}-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`
					const clicksCount = faker.number.int({ min: 0, max: 50 })

					referralRows.push({
						eventId: event.id,
						referrerId: (referrer as any).id,
						code: referralCode,
						url: `${faker.internet.domainName()}/events/${event.slug}?ref=${referralCode}`,
						clickCount: clicksCount,
						conversionCount: Math.floor(
							clicksCount * faker.number.float({ min: 0.1, max: 0.4 })
						),
						createdAt: faker.date.recent({ days: 60 }),
					})
				}
			}
		}

		if (referralRows.length > 0) {
			await createMany(prisma.eventReferral, referralRows)
		}

		operation.complete({ referrals: referralRows.length })
		logger.info(`Created ${referralRows.length} event referrals`)
	} catch (error) {
		operation.fail(error)
		throw error
	}
}

export async function createEventMessages(
	prisma: PrismaClient,
	events: any[],
	_users: any[]
) {
	const operation = logger.startOperation('create_event_messages')
	const { faker } = await import('@faker-js/faker')

	try {
		const messageRows: any[] = []

		for (const event of events) {
			// Some events have messages/announcements
			if (faker.datatype.boolean({ probability: 0.4 })) {
				const messageCount = faker.number.int({ min: 1, max: 3 })

				for (let i = 0; i < messageCount; i++) {
					const messageTypes = ['ANNOUNCEMENT', 'UPDATE', 'REMINDER']

					messageRows.push({
						eventId: event.id,
						senderId: event.hostId, // Messages typically from host
						subject: faker.lorem.sentence(),
						content: faker.lorem.paragraphs(2),
						type: faker.helpers.arrayElement(messageTypes),
						audienceType: faker.helpers.arrayElement([
							'ALL_ATTENDEES',
							'CONFIRMED_ONLY',
							'WAITLIST_ONLY',
						]),
						scheduledFor: null, // Immediate send
						sentAt: faker.date.recent({ days: 30 }),
						openCount: faker.number.int({ min: 0, max: 100 }),
						clickCount: faker.number.int({ min: 0, max: 20 }),
					})
				}
			}
		}

		if (messageRows.length > 0) {
			await createMany(prisma.eventMessage, messageRows)
		}

		operation.complete({ messages: messageRows.length })
		logger.info(`Created ${messageRows.length} event messages`)
	} catch (error) {
		operation.fail(error)
		throw error
	}
}

export async function backfillDailyStats(prisma: PrismaClient, events: any[]) {
	const operation = logger.startOperation('backfill_daily_stats')
	const { faker } = await import('@faker-js/faker')

	try {
		const statsRows: any[] = []
		const now = new Date()
		const daysBack = 90 // Generate stats for last 90 days

		for (const event of events) {
			// Only generate stats for events that existed during the period
			const eventCreated = new Date(event.createdAt)
			const startDate =
				eventCreated > new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
					? eventCreated
					: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

			// Generate daily stats from event creation to now (or event date if past)
			const eventDate = new Date(event.startDate)
			const endDate = eventDate < now ? eventDate : now

			const currentDate = new Date(startDate)
			while (currentDate <= endDate) {
				// Simulate realistic daily metrics
				const baseViews = faker.number.int({ min: 1, max: 20 })
				const baseRegistrations = faker.number.int({
					min: 0,
					max: Math.floor(baseViews * 0.3),
				})

				// Spike in metrics closer to event date
				const daysToEvent = Math.max(
					0,
					Math.floor(
						(eventDate.getTime() - currentDate.getTime()) /
							(24 * 60 * 60 * 1000)
					)
				)
				const proximityMultiplier =
					daysToEvent < 7 ? 2 : daysToEvent < 30 ? 1.5 : 1

				const dailyViews = Math.floor(baseViews * proximityMultiplier)
				const dailyRegistrations = Math.floor(
					baseRegistrations * proximityMultiplier
				)

				statsRows.push({
					eventId: event.id,
					date: new Date(currentDate),
					views: dailyViews,
					rsvps: dailyRegistrations,
					paidRsvps: faker.number.int({
						min: 0,
						max: dailyRegistrations,
					}),
					uniqueViews: Math.floor(dailyViews * 0.8), // ~80% unique
				})

				currentDate.setDate(currentDate.getDate() + 1)
			}
		}

		if (statsRows.length > 0) {
			// Batch insert for performance
			const batchSize = 1000
			for (let i = 0; i < statsRows.length; i += batchSize) {
				const batch = statsRows.slice(i, i + batchSize)
				await createMany(prisma.eventDailyStat, batch)
			}
		}

		operation.complete({ statsRecords: statsRows.length })
		logger.info(
			`Created ${statsRows.length} daily stats records across ${events.length} events`
		)
	} catch (error) {
		operation.fail(error)
		throw error
	}
}

async function createMany(model: any, data: any[]) {
	if (model.createMany) {
		await model.createMany({ data, skipDuplicates: true })
	} else {
		const { PrismaClient } = await import('@prisma/client')
		const prisma = new PrismaClient()
		await prisma.$transaction(data.map((item) => model.create({ data: item })))
	}
}
