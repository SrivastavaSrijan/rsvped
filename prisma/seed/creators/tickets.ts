/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import {
	DiscountType,
	type PrismaClient,
	TicketVisibility,
} from '@prisma/client'
import { logger, timeOperation } from '../utils'

export async function createTicketTiers(prisma: PrismaClient, events: any[]) {
	return await timeOperation('Creating ticket tiers', async () => {
		const { faker } = await import('@faker-js/faker')

		const ticketRows: any[] = []

		for (const event of events) {
			const llmEvent = event._llmEvent

			if (llmEvent?.ticketTiers && llmEvent.ticketTiers.length > 0) {
				// Use LLM-generated ticket tiers
				for (const llmTier of llmEvent.ticketTiers) {
					ticketRows.push({
						eventId: event.id,
						name: llmTier.name,
						description: llmTier.description,
						priceCents: llmTier.priceCents,
						currency: 'USD',
						quantityTotal: llmTier.capacity,
						quantitySold: 0,
						visibility: TicketVisibility.PUBLIC,
						salesStart: faker.date.past(),
						salesEnd: faker.date.future(),
						_llmTier: llmTier, // Store for later use
					})
				}
			} else {
				// Fallback to faker-generated tiers
				const countTiers = faker.number.int({ min: 1, max: 4 })

				for (let i = 0; i < countTiers; i++) {
					const isFree = faker.datatype.boolean({ probability: 0.3 })
					const basePrice = isFree ? 0 : faker.number.int({ min: 10, max: 500 })

					ticketRows.push({
						eventId: event.id,
						name: faker.helpers.arrayElement([
							'Early Bird',
							'General Admission',
							'VIP',
							'Student',
						]),
						description: faker.lorem.sentence(),
						priceCents: basePrice * 100, // Convert to cents
						currency: 'USD',
						quantityTotal: faker.datatype.boolean()
							? faker.number.int({ min: 10, max: 200 })
							: null,
						quantitySold: 0,
						visibility: faker.helpers.arrayElement([
							TicketVisibility.PUBLIC,
							TicketVisibility.HIDDEN,
						]),
						salesStart: faker.date.past(),
						salesEnd: faker.date.future(),
						_llmTier: null,
					})
				}
			}
		}

		// Create ticket tiers without the _llmTier property
		const tiersToCreate = ticketRows.map(({ _llmTier, ...rest }) => rest)
		const ticketTiers = await createManyWithReturn(
			prisma.ticketTier,
			tiersToCreate
		)

		// Reattach LLM data for promo code creation
		ticketTiers.forEach((tier: any, index: number) => {
			tier._llmTier = ticketRows[index]._llmTier
		})

		logger.success(`Created ${ticketTiers.length} ticket tiers`)

		return ticketTiers
	})
}

export async function createPromoCodes(
	prisma: PrismaClient,
	events: any[],
	ticketTiers: any[]
) {
	return await timeOperation('Creating promo codes', async () => {
		const { faker } = await import('@faker-js/faker')

		const promoRows: any[] = []
		const promoTiersRows: any[] = []
		let llmPromoCount = 0

		// Group ticket tiers by event for easier lookup
		const tiersByEvent = ticketTiers.reduce((acc, tier) => {
			if (!acc[tier.eventId]) acc[tier.eventId] = []
			acc[tier.eventId].push(tier)
			return acc
		}, {})

		for (const event of events) {
			const llmEvent = event._llmEvent
			const eventTiers = tiersByEvent[event.id] || []

			if (llmEvent?.promoCodes && llmEvent.promoCodes.length > 0) {
				// Use LLM-generated promo codes
				llmPromoCount++
				for (const llmPromo of llmEvent.promoCodes) {
					const promoId = `${event.id}_${llmPromo.code}` // Temporary unique ID

					promoRows.push({
						eventId: event.id,
						code: llmPromo.code,
						discountType: DiscountType.PERCENT,
						amountOffCents: null,
						percentOff: llmPromo.discountPercent,
						maxRedemptions: faker.number.int({ min: 10, max: 100 }),
						redeemedCount: 0,
						startsAt: faker.date.past(),
						endsAt: faker.date.future(),
						appliesToAllTiers: true, // LLM promos typically apply to all tiers
						_tempId: promoId,
					})
				}
			} else {
				// Fallback to faker-generated promo codes
				const promoCount = faker.number.int({ min: 0, max: 2 })

				for (let i = 0; i < promoCount; i++) {
					const promoId = `${event.id}_PROMO_${i}` // Temporary ID
					const discountType = faker.helpers.arrayElement([
						DiscountType.AMOUNT,
						DiscountType.PERCENT,
					])

					promoRows.push({
						eventId: event.id,
						code: `${faker.string.alpha({ length: 6, casing: 'upper' })}${faker.number.int({ min: 10, max: 99 })}`,
						discountType: discountType,
						amountOffCents:
							discountType === DiscountType.AMOUNT
								? faker.number.int({ min: 500, max: 10000 }) // $5-$100 in cents
								: null,
						percentOff:
							discountType === DiscountType.PERCENT
								? faker.number.int({ min: 5, max: 50 })
								: null,
						maxRedemptions: faker.datatype.boolean()
							? faker.number.int({ min: 10, max: 100 })
							: null,
						redeemedCount: 0,
						startsAt: faker.date.past(),
						endsAt: faker.date.future(),
						appliesToAllTiers: faker.datatype.boolean({ probability: 0.3 }),
						_tempId: promoId,
					})

					// Associate promo with some ticket tiers for non-LLM promos
					if (
						eventTiers.length > 0 &&
						!promoRows[promoRows.length - 1].appliesToAllTiers
					) {
						const applicableTiers = faker.helpers.arrayElements(
							eventTiers,
							faker.number.int({ min: 1, max: Math.min(3, eventTiers.length) })
						)

						for (const tier of applicableTiers) {
							promoTiersRows.push({
								promoCodeId: promoId, // Will be replaced with actual ID
								ticketTierId: (tier as any).id,
							})
						}
					}
				}
			}
		}

		// Create promo codes if any exist
		if (promoRows.length === 0) {
			logger.debug('No promo codes to create')
			return []
		}

		// Remove _tempId before creating
		const promosToCreate = promoRows.map(({ _tempId, ...rest }) => rest)
		const createdPromoCodes = await createManyWithReturn(
			prisma.promoCode,
			promosToCreate
		)

		// Create promo tier associations for non-LLM promos if needed
		if (promoTiersRows.length > 0) {
			// Update temp IDs with actual promo IDs
			for (let i = 0; i < createdPromoCodes.length; i++) {
				const tempId = promoRows[i]._tempId
				const actualPromoId = createdPromoCodes[i].id

				promoTiersRows
					.filter((row) => row.promoCodeId === tempId)
					.forEach((row) => {
						row.promoCodeId = actualPromoId
					})
			}

			// Create promo tier associations
			await createMany(prisma.promoCodeTier, promoTiersRows)
		}

		logger.success(
			`Created ${createdPromoCodes.length} promo codes with ${promoTiersRows.length} tier associations`
		)

		return createdPromoCodes
	})
}

export async function createRegistrationQuestions(
	prisma: PrismaClient,
	events: any[]
) {
	return await timeOperation('Creating registration questions', async () => {
		const { faker } = await import('@faker-js/faker')
		const questionRows: any[] = []

		for (const event of events) {
			const qCount = faker.number.int({ min: 0, max: 5 })

			for (let i = 0; i < qCount; i++) {
				const questionTypes = [
					'SHORT_TEXT',
					'LONG_TEXT',
					'SINGLE_SELECT',
					'MULTI_SELECT',
					'CHECKBOX',
					'TERMS',
					'SIGNATURE',
				]
				const questionType = faker.helpers.arrayElement(questionTypes)

				let options = null
				if (questionType === 'SELECT' || questionType === 'MULTISELECT') {
					options = Array.from(
						{ length: faker.number.int({ min: 2, max: 5 }) },
						() => faker.lorem.word()
					)
				}

				questionRows.push({
					eventId: event.id,
					label: faker.lorem.sentence().replace('.', '?'),
					type: questionType,
					options: options ? options : [],
					position: i,
					required: faker.datatype.boolean({ probability: 0.7 }),
				})
			}
		}

		if (questionRows.length === 0) {
			logger.debug('No registration questions to create')
			return []
		}

		const questions = await createManyWithReturn(
			prisma.registrationQuestion,
			questionRows
		)

		logger.success(`Created ${questions.length} registration questions`)

		return questions
	})
}

async function createManyWithReturn(model: any, data: any[]) {
	if ('createManyAndReturn' in model) {
		return await model.createManyAndReturn({ data })
	}
	// Fallback for older Prisma versions
	const { PrismaClient } = await import('@prisma/client')
	const prisma = new PrismaClient()
	return prisma.$transaction(data.map((item) => model.create({ data: item })))
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
