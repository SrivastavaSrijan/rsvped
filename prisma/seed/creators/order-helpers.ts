/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import {
	EventRole,
	OrderStatus,
	PaymentState,
	PaymentStatus,
	type PrismaClient,
	RsvpStatus,
} from '@prisma/client'
import { logger, timeOperation } from '../utils'
import { config } from '../utils/config'

/**
 * Enhanced orders and RSVPs system with intelligent category-based matching
 */

interface EventWithCategories {
	id: string
	title: string
	capacity?: number | null
	startDate: Date
	endDate: Date
	categories?: Array<{
		categoryId: string
		category: { id: string; name: string }
	}>
}

interface UserWithCategories {
	id: string
	name?: string | null
	email?: string | null
	profession?: string | null
	spendingPower?: string | null
	networkingStyle?: string | null
	categoryInterests?: Array<{
		categoryId: string
		interestLevel: number
		category: { id: string; name: string }
	}>
}

/**
 * Create intelligent RSVPs based on category matching and user personas
 */
export async function createIntelligentRSVPs(
	prisma: PrismaClient,
	events: any[],
	users: any[],
	ticketTiers: any[]
): Promise<{ orders: any[]; rsvps: any[]; payments: any[] }> {
	return await timeOperation('Creating intelligent RSVPs', async () => {
		const { faker } = await import('@faker-js/faker')

		// Fetch events with their categories
		const eventsWithCategories = (await prisma.event.findMany({
			where: { id: { in: events.map((e) => e.id) } },
			include: {
				categories: {
					include: { category: true },
				},
			},
		})) as EventWithCategories[]

		// Fetch users with their category interests
		const usersWithInterests = (await prisma.user.findMany({
			where: { id: { in: users.map((u) => u.id) } },
			include: {
				categoryInterests: {
					include: { category: true },
				},
			},
		})) as UserWithCategories[]

		// Group ticket tiers by event
		const tiersByEvent = new Map<string, any[]>(
			Object.entries(
				ticketTiers.reduce(
					(acc, tier) => {
						if (!acc[tier.eventId]) acc[tier.eventId] = []
						acc[tier.eventId].push(tier)
						return acc
					},
					{} as Record<string, any[]>
				)
			)
		)

		logger.info(
			`🎯 Generating intelligent RSVPs for ${eventsWithCategories.length} events`
		)

		const orderRows: any[] = []
		const orderItemRows: any[] = []
		const paymentRows: any[] = []
		const rsvpRows: any[] = []

		let totalMatches = 0
		let categoryBasedRsvps = 0

		for (const event of eventsWithCategories) {
			const eventTiers = tiersByEvent.get(event.id) || []
			if (eventTiers.length === 0) {
				logger.debug(`No ticket tiers found for event: ${event.title}`)
				continue
			}

			// Calculate target attendance based on event capacity and tier popularity
			const baseAttendance = event.capacity
				? Math.min(event.capacity * 0.7, 100) // 70% of capacity, max 100
				: faker.number.int({ min: 15, max: 80 })

			const targetAttendance = Math.floor(
				faker.number.int({
					min: Math.max(5, baseAttendance * 0.3),
					max: baseAttendance,
				})
			)

			// Find users interested in this event's categories
			const interestedUsers = findInterestedUsers(event, usersWithInterests)

			logger.debug(
				`Event "${event.title}": ${interestedUsers.length} interested users, target: ${targetAttendance}`
			)

			// Select attendees using intelligent probability
			const selectedAttendees = selectIntelligentAttendees(
				interestedUsers,
				targetAttendance
			)
			categoryBasedRsvps += selectedAttendees.filter(
				(a) => a.matchReason === 'category'
			).length
			totalMatches += selectedAttendees.length

			// Generate orders and RSVPs for selected attendees
			for (const attendee of selectedAttendees) {
				const { user, probability, matchReason } = attendee
				// Select ticket tier based on user spending power and tier pricing
				const selectedTier = selectTierForUser(user, eventTiers, faker)
				const quantity = faker.number.int({ min: 1, max: 2 }) // Mostly 1 ticket
				const unitPriceCents = selectedTier.priceCents || 0
				const totalAmountCents = unitPriceCents * quantity

				// Create order
				const orderId = `order_${event.id}_${user.id}_${Date.now()}_${Math.random()}`
				const orderStatus = determineOrderStatus(user, unitPriceCents, faker)

				orderRows.push({
					id: orderId,
					eventId: event.id,
					purchaserEmail: user.email,
					purchaserName: user.name,
					status: orderStatus,
					totalCents: totalAmountCents,

					currency: 'USD',
					appliedPromoCodeId: null,

					createdAt: faker.date.recent({ days: 60 }),
					updatedAt: faker.date.recent({ days: 30 }),
					_metadata: { matchReason, probability },
				})

				// Create order item
				orderItemRows.push({
					orderId: orderId,
					ticketTierId: selectedTier.id,
					quantity: quantity,
					priceCents: unitPriceCents,
				})

				// Create payment if order has amount
				if (totalAmountCents > 0) {
					const paymentStatus =
						orderStatus === OrderStatus.PAID
							? PaymentStatus.SUCCEEDED
							: faker.helpers.arrayElement([
									PaymentStatus.PENDING,
									PaymentStatus.FAILED,
								])

					paymentRows.push({
						id: `payment_${orderId}`,
						orderId: orderId,
						amountCents: totalAmountCents,
						currency: 'USD',
						status: paymentStatus,
						provider: faker.helpers.arrayElement([
							'card',
							'paypal',
							'bank_transfer',
							'stripe',
							'manual',
						]),
						providerIntentId: `pi_${faker.string.alphanumeric(24)}`,
						providerChargeId: `ch_${faker.string.alphanumeric(24)}`,
						createdAt: faker.date.recent({ days: 60 }),
						updatedAt: faker.date.recent({ days: 30 }),
					})
				}

				// Create RSVP for successful orders
				if (orderStatus === OrderStatus.PAID) {
					const rsvpStatus = faker.datatype.boolean({ probability: 0.95 })
						? RsvpStatus.CONFIRMED
						: RsvpStatus.CANCELLED

					rsvpRows.push({
						id: `rsvp_${event.id}_${user.id}`,
						eventId: event.id,
						email: user.email,
						userId: user.id,
						name: user.name,
						paymentState: faker.helpers.arrayElement(
							Object.values(PaymentState)
						),
						ticketTierId: selectedTier.id,
						status: rsvpStatus,
						orderId: orderId,
						createdAt: faker.date.recent({ days: 60 }),
					})
				}
			}
		}

		// Create records in database
		const results = await createOrdersAndRelatedRecords(prisma, {
			orderRows,
			orderItemRows,
			paymentRows,
			rsvpRows,
		})

		logger.success(`Generated ${totalMatches} intelligent RSVPs`)

		return results
	})
}

/**
 * Create intelligent event collaborators based on categories and user expertise
 */
export async function createEventCollaborators(
	prisma: PrismaClient,
	events: any[],
	users: any[]
): Promise<void> {
	return await timeOperation('Creating event collaborators', async () => {
		const { faker } = await import('@faker-js/faker')

		// Fetch events with categories
		const eventsWithCategories = await prisma.event.findMany({
			where: { id: { in: events.map((e) => e.id) } },
			include: {
				categories: { include: { category: true } },
				host: true,
			},
		})

		// Fetch users with interests and experience levels
		const usersWithInterests = (await prisma.user.findMany({
			where: { id: { in: users.map((u) => u.id) } },
			include: {
				categoryInterests: { include: { category: true } },
			},
		})) as UserWithCategories[]

		const collaboratorRows: any[] = []
		let categoryMatchedCollaborators = 0

		for (const event of eventsWithCategories) {
			const maxCollaborators = faker.number.int({
				min: 0,
				max: Math.min(config.MAX_COLLABORATORS, 4),
			})

			if (maxCollaborators === 0) continue

			// Find potential collaborators (excluding event host)
			const potentialCollaborators = usersWithInterests
				.filter((user) => user.id !== event.hostId)
				.map((user) => {
					const relevanceScore = calculateCollaboratorRelevance(
						user,
						event,
						faker
					)
					return { user, score: relevanceScore }
				})
				.filter(({ score }) => score > 0.3) // Minimum relevance threshold
				.sort((a, b) => b.score - a.score)
				.slice(0, maxCollaborators * 2) // Get more candidates than needed

			// Select diverse collaborators
			const selectedCollaborators = selectDiverseCollaborators(
				potentialCollaborators,
				maxCollaborators,
				faker
			)

			categoryMatchedCollaborators += selectedCollaborators.filter(
				(c) => c.categoryMatched
			).length

			// Create collaborator records
			for (const collaborator of selectedCollaborators) {
				const role = selectCollaboratorRole(collaborator.user, faker)

				collaboratorRows.push({
					eventId: event.id,
					userId: collaborator.user.id,
					role: role,
				})
			}
		}

		// Bulk create collaborators
		if (collaboratorRows.length > 0) {
			await prisma.eventCollaborator.createMany({
				data: collaboratorRows,
				skipDuplicates: true,
			})
		}

		logger.success(`Created ${collaboratorRows.length} event collaborators`)
	})
}

/**
 * Create event referrals, views, and other engagement data
 */
export async function createEngagementData(
	prisma: PrismaClient,
	events: any[],
	users: any[]
): Promise<void> {
	return await timeOperation('Creating engagement data', async () => {
		const { faker } = await import('@faker-js/faker')

		const referralRows: any[] = []
		const viewRows: any[] = []
		const messageRows: any[] = []

		// Generate event referrals
		for (const event of events) {
			const referralCount = faker.number.int({ min: 0, max: 3 })

			for (let i = 0; i < referralCount; i++) {
				const referrer = faker.datatype.boolean({ probability: 0.7 })
					? faker.helpers.arrayElement(users)
					: null

				referralRows.push({
					eventId: event.id,
					userId: referrer?.id || null,
					code: faker.string.alphanumeric(8).toUpperCase(),
					uses: faker.number.int({ min: 0, max: 5 }),
					createdAt: faker.date.recent({ days: 60 }),
				})
			}
		}

		// Generate event views (high volume, low engagement)
		for (const event of events) {
			const viewCount = faker.number.int({ min: 50, max: 400 })
			const uniqueViewers = faker.helpers.arrayElements(
				users,
				Math.min(viewCount * 0.7, users.length) // 70% unique viewers
			)

			for (const viewer of uniqueViewers) {
				const sessionsPerViewer = faker.number.int({ min: 1, max: 4 })

				for (let session = 0; session < sessionsPerViewer; session++) {
					viewRows.push({
						eventId: event.id,
						userId: viewer.id,
						viewedAt: faker.date.recent({ days: 30 }),
						userAgent: faker.internet.userAgent(),
						ipAddress: faker.internet.ip(),
					})
				}
			}
		}

		// Generate some event messages
		for (const event of events) {
			const messageCount = faker.number.int({ min: 0, max: 8 })

			for (let i = 0; i < messageCount; i++) {
				const author = faker.helpers.arrayElement(users)

				messageRows.push({
					eventId: event.id,
					userId: author.id,
					content: faker.lorem.paragraph(),
					parentId: null, // No replies for now
					createdAt: faker.date.recent({ days: 14 }),
				})
			}
		}

		// Bulk create all engagement data
		await Promise.all([
			referralRows.length > 0 &&
				prisma.eventReferral.createMany({
					data: referralRows,
					skipDuplicates: true,
				}),
			viewRows.length > 0 &&
				prisma.eventView.createMany({
					data: viewRows,
					skipDuplicates: true,
				}),
			messageRows.length > 0 &&
				prisma.eventMessage.createMany({
					data: messageRows,
					skipDuplicates: true,
				}),
		])

		logger.success(
			`Created engagement data: ${referralRows.length} referrals, ${viewRows.length} views, ${messageRows.length} messages`
		)
	})
}

// Helper Functions

function findInterestedUsers(
	event: EventWithCategories,
	users: UserWithCategories[]
) {
	const eventCategoryIds = new Set(
		event.categories?.map((ec) => ec.categoryId) || []
	)

	return users
		.map((user) => {
			// Calculate interest score based on category overlap
			let categoryScore = 0
			let maxInterestLevel = 0

			for (const interest of user.categoryInterests || []) {
				if (eventCategoryIds.has(interest.categoryId)) {
					categoryScore += interest.interestLevel / 10 // Normalize to 0-1
					maxInterestLevel = Math.max(maxInterestLevel, interest.interestLevel)
				}
			}

			// Add persona-based modifiers
			let personaModifier = 1.0

			// Networking style affects probability
			switch (user.networkingStyle) {
				case 'ACTIVE':
					personaModifier += 0.3
					break
				case 'SELECTIVE':
					personaModifier += categoryScore > 0 ? 0.2 : -0.2
					break
				case 'CASUAL':
					personaModifier += 0.1
					break
			}

			// Experience level affects certain event types
			if (user.profession && eventCategoryIds.size > 0) {
				personaModifier += 0.1
			}

			const finalProbability = Math.min(1.0, categoryScore * personaModifier)

			return {
				user,
				probability: finalProbability,
				categoryScore,
				maxInterestLevel,
				matchReason: categoryScore > 0 ? 'category' : 'random',
			}
		})
		.filter(({ probability }) => probability > 0.1) // Filter out very low interest
}

function selectIntelligentAttendees(
	interestedUsers: any[],
	targetAttendance: number
) {
	const { faker } = require('@faker-js/faker')

	// Sort by probability (highest interest first)
	const sortedUsers = interestedUsers.sort(
		(a, b) => b.probability - a.probability
	)

	const selected: any[] = []

	// Guarantee some high-interest users
	const highInterestCount = Math.min(
		Math.ceil(targetAttendance * 0.4),
		sortedUsers.length
	)
	for (let i = 0; i < highInterestCount; i++) {
		if (faker.datatype.boolean({ probability: sortedUsers[i].probability })) {
			selected.push(sortedUsers[i])
		}
	}

	// Fill remaining slots with probability-based selection
	const remainingUsers = sortedUsers.slice(highInterestCount)

	for (const userData of remainingUsers) {
		if (selected.length >= targetAttendance) break

		if (faker.datatype.boolean({ probability: userData.probability * 0.7 })) {
			selected.push(userData)
		}
	}

	// If still short, add random users
	while (
		selected.length < Math.min(targetAttendance * 0.8, targetAttendance) &&
		remainingUsers.filter((u) => !selected.includes(u)).length > 0
	) {
		const randomUser = faker.helpers.arrayElement(
			remainingUsers.filter((u) => !selected.includes(u))
		)
		if (randomUser) {
			selected.push({ ...randomUser, matchReason: 'filler' })
		} else {
			break
		}
	}

	return selected
}

function selectTierForUser(
	user: UserWithCategories,
	eventTiers: any[],
	faker: any
) {
	// Sort tiers by price
	const sortedTiers = eventTiers.sort(
		(a, b) => (a.priceCents || 0) - (b.priceCents || 0)
	)
	if (!sortedTiers || sortedTiers.length < 1) {
		logger.warn(
			`No ticket tiers available for user ${user.id}. Returning null.`
		)
		return null
	}

	try {
		// Select tier based on spending power
		switch (user.spendingPower) {
			case 'HIGH':
				return faker.helpers.arrayElement(
					sortedTiers.slice(-2).length > 0 ? sortedTiers.slice(-2) : sortedTiers
				) // Top 2 tiers or fallback to all tiers
			case 'MEDIUM':
				return faker.helpers.arrayElement(
					sortedTiers.slice(1, -1).length > 0
						? sortedTiers.slice(1, -1)
						: sortedTiers
				) // Middle tiers or fallback to all tiers
			case 'LOW':
				return faker.helpers.arrayElement(
					sortedTiers.slice(0, 1).length > 0
						? sortedTiers.slice(0, 1)
						: sortedTiers
				) // Bottom tier or fallback to all tiers
			default:
				return sortedTiers[0] // Cheapest tier
		}
	} catch (error) {
		logger.error(
			`Error selecting ticket tier for user ${user.id}: ${(error as Error).message}`
		)
		return sortedTiers[0] || null // Fallback to the cheapest tier or null
	}
}

function determineOrderStatus(
	user: UserWithCategories,
	priceCents: number,
	faker: any
): OrderStatus {
	// Free events always succeed
	if (priceCents === 0) return OrderStatus.PAID

	// Higher spending power = higher success rate
	let successRate = 0.85 // Base rate

	switch (user.spendingPower) {
		case 'HIGH':
			successRate = 0.95
			break
		case 'MEDIUM':
			successRate = 0.88
			break
		case 'LOW':
			successRate = 0.75
			break
	}

	// Adjust for price
	if (priceCents > 10000) successRate -= 0.1 // $100+
	if (priceCents > 5000) successRate -= 0.05 // $50+

	return faker.datatype.boolean({ probability: successRate })
		? OrderStatus.PAID
		: faker.helpers.arrayElement([OrderStatus.PENDING, OrderStatus.CANCELLED])
}

function calculateCollaboratorRelevance(
	user: UserWithCategories,
	event: any,
	faker: any
): number {
	let score = 0.2 // Base score for any user

	// Category relevance (most important)
	const eventCategoryIds = new Set(
		event.categories?.map((ec: any) => ec.categoryId) || []
	)
	const userCategoryIds =
		user.categoryInterests?.map((ci) => ci.categoryId) || []
	const categoryOverlap = userCategoryIds.filter((cid) =>
		eventCategoryIds.has(cid)
	).length

	if (categoryOverlap > 0) {
		score += categoryOverlap * 0.3
	}

	// Professional experience
	if (user.profession) {
		score += 0.2
	}

	// Networking style
	switch (user.networkingStyle) {
		case 'ACTIVE':
			score += 0.3
			break
		case 'SELECTIVE':
			score += categoryOverlap > 0 ? 0.2 : -0.1
			break
	}

	// Add some randomness
	score += faker.number.float({ min: -0.1, max: 0.1 })

	return Math.max(0, Math.min(1, score))
}

function selectDiverseCollaborators(
	candidates: any[],
	maxCount: number,
	faker: any
) {
	const selected = []
	const usedProfessions = new Set()

	// Prioritize different professions/backgrounds
	for (const candidate of candidates) {
		if (selected.length >= maxCount) break

		const profession = candidate.user.profession || 'other'
		const isDiverse =
			!usedProfessions.has(profession) || usedProfessions.size < 2

		if (isDiverse || faker.datatype.boolean({ probability: candidate.score })) {
			selected.push({
				user: candidate.user,
				score: candidate.score,
				categoryMatched: candidate.score > 0.6,
			})
			usedProfessions.add(profession)
		}
	}

	return selected
}

function selectCollaboratorRole(
	user: UserWithCategories,
	faker: any
): EventRole {
	// Assign roles based on user characteristics
	const roles = [EventRole.CO_HOST, EventRole.MANAGER, EventRole.CHECKIN]
	const weights = [0.3, 0.4, 0.3] // Default weights

	// Adjust weights based on user characteristics
	if (user.networkingStyle === 'ACTIVE') {
		weights[0] += 0.2 // More likely to be CO_HOST
		weights[1] += 0.1
	}

	if (user.profession?.includes('manager')) {
		weights[1] += 0.3 // More likely to be MANAGER
	}

	return faker.helpers.weightedArrayElement(
		roles.map((role, i) => ({ weight: weights[i], value: role }))
	)
}

async function createOrdersAndRelatedRecords(
	prisma: PrismaClient,
	data: {
		orderRows: any[]
		orderItemRows: any[]
		paymentRows: any[]
		rsvpRows: any[]
	}
) {
	const { orderRows, orderItemRows, paymentRows, rsvpRows } = data

	// Create orders first (remove metadata and temporary IDs)
	let createdOrders: any[] = []
	if (orderRows.length > 0) {
		const orderDataForCreation = orderRows.map(
			({ id, _metadata, ...rest }) => rest
		)
		createdOrders = await createManyWithReturn(
			prisma.order,
			orderDataForCreation
		)
		logger.success(`Created ${createdOrders.length} orders`)
	}

	// Create order items with proper order ID mapping
	if (orderItemRows.length > 0 && createdOrders.length > 0) {
		const orderIdMap = new Map()
		createdOrders.forEach((order, index) => {
			const tempId = orderRows[index].id
			orderIdMap.set(tempId, order.id)
		})

		const validOrderItems = orderItemRows
			.map((item) => ({ ...item, orderId: orderIdMap.get(item.orderId) }))
			.filter((item) => item.orderId)

		if (validOrderItems.length > 0) {
			await prisma.orderItem.createMany({ data: validOrderItems })
			logger.success(`Created ${validOrderItems.length} order items`)
		}
	}

	// Create payments
	let createdPayments: any[] = []
	if (paymentRows.length > 0 && createdOrders.length > 0) {
		const orderIdMap = new Map()
		createdOrders.forEach((order, index) => {
			const tempId = orderRows[index].id
			orderIdMap.set(tempId, order.id)
		})

		const validPayments = paymentRows
			.map(({ id, ...payment }) => ({
				...payment,
				orderId: orderIdMap.get(payment.orderId),
			}))
			.filter((payment) => payment.orderId)

		if (validPayments.length > 0) {
			createdPayments = await createManyWithReturn(
				prisma.payment,
				validPayments
			)
			logger.success(`Created ${createdPayments.length} payments`)
		}
	}

	// Create RSVPs
	let createdRsvps: any[] = []
	if (rsvpRows.length > 0 && createdOrders.length > 0) {
		const orderIdMap = new Map()
		createdOrders.forEach((order, index) => {
			const tempId = orderRows[index].id
			orderIdMap.set(tempId, order.id)
		})

		const validRsvps = rsvpRows
			.map(({ id, ...rsvp }) => ({
				...rsvp,
				orderId: orderIdMap.get(rsvp.orderId),
			}))
			.filter((rsvp) => rsvp.orderId)

		if (validRsvps.length > 0) {
			createdRsvps = await createManyWithReturn(prisma.rsvp, validRsvps)
			logger.success(`Created ${createdRsvps.length} RSVPs`)
		}
	}

	return {
		orders: createdOrders,
		rsvps: createdRsvps,
		payments: createdPayments,
	}
}

async function createManyWithReturn(model: any, data: any[]) {
	if ('createManyAndReturn' in model) {
		return await model.createManyAndReturn({ data })
	}
	// Fallback for older Prisma versions
	const results: any[] = []
	for (const item of data) {
		const created = await model.create({ data: item })
		results.push(created)
	}
	return results
}

/**
 * Update event counters after RSVP creation
 */
export async function updateEventCounters(prisma: PrismaClient, events: any[]) {
	return await timeOperation('Updating event counters', async () => {
		await Promise.all(
			events.map(async (event) => {
				const [rsvpCount, paidRsvpCount, viewCount] = await Promise.all([
					prisma.rsvp.count({
						where: { eventId: event.id, status: 'CONFIRMED' },
					}),
					prisma.rsvp.count({
						where: {
							eventId: event.id,
							status: 'CONFIRMED',
							order: { status: 'PAID', totalCents: { gt: 0 } },
						},
					}),
					prisma.eventView.count({ where: { eventId: event.id } }),
				])

				await prisma.event.update({
					where: { id: event.id },
					data: { rsvpCount, paidRsvpCount, viewCount },
				})
			})
		)

		logger.success(`Updated counters for ${events.length} events`)
	})
}
