/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import type { PrismaClient } from '@prisma/client'
import { logger, timeOperation } from '../utils'
import {
	createEngagementData,
	createEventCollaborators,
	createIntelligentRSVPs,
	updateEventCounters,
} from './order-helpers'

export async function createOrdersAndRSVPs(
	prisma: PrismaClient,
	events: any[],
	users: any[],
	ticketTiers: any[],
	questions: any[]
) {
	return await timeOperation('Creating orders and RSVPs', async () => {
		const { faker } = await import('@faker-js/faker')

		// Create intelligent RSVPs based on category matching
		const { orders, rsvps, payments } = await createIntelligentRSVPs(
			prisma,
			events,
			users,
			ticketTiers
		)

		// Create event collaborators based on expertise and interests
		await createEventCollaborators(prisma, events, users)

		// Create engagement data (referrals, views, messages)
		await createEngagementData(prisma, events, users)

		// Create RSVP answers for events with questions
		if (questions.length > 0) {
			await createRSVPAnswers(prisma, rsvps, questions, faker)
		}

		// Create check-ins and feedback for past events
		await createCheckInsAndFeedback(prisma, events, rsvps, faker)

		// Update event counters
		await updateEventCounters(prisma, events)

		logger.success(
			`Created complete order ecosystem: ${orders.length} orders, ${rsvps.length} RSVPs, ${payments.length} payments`
		)

		return { orders, rsvps, payments }
	})
}

// Helper functions for supplementary data
async function createRSVPAnswers(
	prisma: PrismaClient,
	rsvps: any[],
	questions: any[],
	faker: any
) {
	return await timeOperation('Creating RSVP answers', async () => {
		// Group questions by event
		const questionsByEvent = questions.reduce(
			(acc, question) => {
				if (!acc[question.eventId]) acc[question.eventId] = []
				acc[question.eventId].push(question)
				return acc
			},
			{} as Record<string, any[]>
		)

		const answerRows: any[] = []

		for (const rsvp of rsvps) {
			const eventQuestions = questionsByEvent[rsvp.eventId] || []

			for (const question of eventQuestions) {
				// 70% response rate for questions
				if (faker.datatype.boolean({ probability: 0.7 })) {
					answerRows.push({
						rsvpId: rsvp.id,
						questionId: question.id,
						value: generateQuestionAnswer(question, faker),
					})
				}
			}
		}

		if (answerRows.length > 0) {
			await prisma.registrationAnswer.createMany({ data: answerRows })
			logger.success(`Created ${answerRows.length} registration answers`)
		}
	})
}

async function createCheckInsAndFeedback(
	prisma: PrismaClient,
	events: any[],
	rsvps: any[],
	faker: any
) {
	return await timeOperation('Creating check-ins and feedback', async () => {
		const checkInRows: any[] = []
		const feedbackRows: any[] = []

		// Only create check-ins and feedback for past events
		const pastEvents = events.filter(
			(event) => new Date(event.endDate) < new Date()
		)

		// Get RSVPs for past events
		const pastRsvps = rsvps.filter((rsvp) =>
			pastEvents.some((event) => event.id === rsvp.eventId)
		)

		// 80% check-in rate for confirmed RSVPs
		for (const rsvp of pastRsvps) {
			if (
				rsvp.status === 'CONFIRMED' &&
				faker.datatype.boolean({ probability: 0.8 })
			) {
				const checkInTime = faker.date.between({
					from: new Date(
						pastEvents.find((e) => e.id === rsvp.eventId)?.startDate ||
							new Date()
					),
					to: new Date(
						pastEvents.find((e) => e.id === rsvp.eventId)?.endDate || new Date()
					),
				})

				checkInRows.push({
					rsvpId: rsvp.id,
					scannedAt: checkInTime,
				})
			}
		}

		// Create feedback for some checked-in attendees
		for (const checkIn of checkInRows) {
			if (faker.datatype.boolean({ probability: 0.4 })) {
				// 40% feedback rate
				const rsvp = pastRsvps.find((r) => r.id === checkIn.rsvpId)
				if (rsvp) {
					feedbackRows.push({
						eventId: rsvp.eventId,
						rsvpId: rsvp.id,
						rating: faker.number.int({ min: 3, max: 5 }), // Positive bias
						comment: faker.datatype.boolean({ probability: 0.6 })
							? faker.lorem.paragraph()
							: null,
						createdAt: faker.date.future({ days: 7 }),
					})
				}
			}
		}

		// Create records
		if (checkInRows.length > 0) {
			await prisma.checkIn.createMany({ data: checkInRows })
			logger.success(`Created ${checkInRows.length} check-ins`)
		}

		if (feedbackRows.length > 0) {
			await prisma.eventFeedback.createMany({ data: feedbackRows })
			logger.success(`Created ${feedbackRows.length} feedback entries`)
		}
	})
}

function generateQuestionAnswer(question: any, faker: any): string {
	switch (question.type) {
		case 'TEXT':
			return faker.lorem.sentence()
		case 'EMAIL':
			return faker.internet.email()
		case 'PHONE':
			return faker.phone.number()
		case 'SELECT':
		case 'RADIO': {
			// Parse options from question text or generate generic ones
			const options = ['Option A', 'Option B', 'Option C']
			return faker.helpers.arrayElement(options)
		}
		case 'CHECKBOX':
			return faker.datatype.boolean().toString()
		case 'TEXTAREA':
			return faker.lorem.paragraph()
		case 'NUMBER':
			return faker.number.int({ min: 1, max: 100 }).toString()
		case 'DATE':
			return faker.date.future().toISOString().split('T')[0]
		case 'URL':
			return faker.internet.url()
		default:
			return faker.lorem.words(3)
	}
}
