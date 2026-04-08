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

					referralRows.push({
						eventId: event.id,
						userId: (referrer as any).id,
						code: referralCode,
						uses: faker.number.int({ min: 0, max: 20 }),
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
		const replyRows: any[] = []

		for (const event of events) {
			// Some events have messages/discussion
			if (faker.datatype.boolean({ probability: 0.4 })) {
				const messageCount = faker.number.int({ min: 1, max: 4 })

				for (let i = 0; i < messageCount; i++) {
					messageRows.push({
						eventId: event.id,
						userId: event.hostId,
						content: faker.lorem.paragraphs({ min: 1, max: 3 }),
						parentId: null,
						createdAt: faker.date.recent({ days: 30 }),
					})
				}
			}
		}

		if (messageRows.length > 0) {
			await createMany(prisma.eventMessage, messageRows)

			// Create replies for some top-level messages
			const topMessages = await prisma.eventMessage.findMany({
				where: { parentId: null },
				select: { id: true, eventId: true, userId: true },
			})

			for (const msg of topMessages) {
				if (faker.datatype.boolean({ probability: 0.4 })) {
					const replyCount = faker.number.int({ min: 1, max: 3 })
					for (let r = 0; r < replyCount; r++) {
						replyRows.push({
							eventId: msg.eventId,
							userId: msg.userId,
							content: faker.lorem.paragraph(),
							parentId: msg.id,
							createdAt: faker.date.recent({ days: 15 }),
						})
					}
				}
			}

			if (replyRows.length > 0) {
				await createMany(prisma.eventMessage, replyRows)
			}
		}

		operation.complete({
			messages: messageRows.length,
			replies: replyRows.length,
		})
		logger.info(
			`Created ${messageRows.length} event messages with ${replyRows.length} replies`
		)
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
