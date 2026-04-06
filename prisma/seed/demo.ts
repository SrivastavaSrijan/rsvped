/**
 * Demo user seed & reset module.
 *
 * Creates a demo user (isDemo: true) with pre-populated data:
 * - Community memberships (member of ~5, manager of ~2)
 * - RSVPs to upcoming free events (~6)
 * - Host of ~2 existing seeded events (reassigned, not created)
 *
 * Can be run standalone or called from the cron reset endpoint.
 */
import type { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth/password'
import { DemoUser } from '@/lib/config/demo'
import { getAvatarURL } from '@/lib/config/routes'

/**
 * Delete all data owned by/associated with the demo user,
 * then delete the user itself.
 */
export async function resetDemoUser(prisma: PrismaClient) {
	const existing = await prisma.user.findUnique({
		where: { email: DemoUser.email },
		select: { id: true },
	})

	if (!existing) return

	const userId = existing.id

	// Delete user-level relations
	await prisma.eventView.deleteMany({ where: { userId } })
	await prisma.eventMessage.deleteMany({ where: { userId } })
	await prisma.eventReferral.deleteMany({ where: { userId } })
	await prisma.eventCollaborator.deleteMany({ where: { userId } })
	await prisma.userCategory.deleteMany({ where: { userId } })
	await prisma.communityMembership.deleteMany({ where: { userId } })

	// Delete RSVPs and their orders/payments
	const userRsvps = await prisma.rsvp.findMany({
		where: { userId },
		select: { id: true, orderId: true },
	})
	const orderIds = userRsvps.map((r) => r.orderId).filter(Boolean) as string[]

	if (orderIds.length > 0) {
		await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } })
		await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } })
	}
	await prisma.rsvp.deleteMany({ where: { userId } })
	if (orderIds.length > 0) {
		await prisma.order.deleteMany({ where: { id: { in: orderIds } } })
	}

	// Reassign hosted events back to the first non-demo user
	// (demo user doesn't own these events, just borrowed them)
	const fallbackHost = await prisma.user.findFirst({
		where: { id: { not: userId }, isDemo: { not: true } },
		select: { id: true },
	})
	if (fallbackHost) {
		await prisma.event.updateMany({
			where: { hostId: userId },
			data: { hostId: fallbackHost.id },
		})
	}

	// Finally delete the user (cascades Account, Session)
	await prisma.user.delete({ where: { id: userId } })
}

/**
 * Create the demo user and populate with realistic data
 * from the existing seeded database.
 */
export async function seedDemoUser(prisma: PrismaClient) {
	const hashedPassword = await hashPassword(DemoUser.password)

	// Get a default location to associate with the demo user
	const defaultLocation = await prisma.location.findFirst({
		where: {
			events: { some: { isPublished: true, deletedAt: null } },
		},
		orderBy: { name: 'asc' },
	})

	// Create the demo user
	const demoUser = await prisma.user.upsert({
		where: { email: DemoUser.email },
		update: {
			password: hashedPassword,
			isDemo: true,
			name: DemoUser.name,
		},
		create: {
			email: DemoUser.email,
			password: hashedPassword,
			name: DemoUser.name,
			image: getAvatarURL(DemoUser.name),
			isDemo: true,
			role: 'USER',
			emailVerified: new Date(),
			profession: 'Product Designer',
			industry: 'Technology',
			experienceLevel: 'SENIOR',
			networkingStyle: 'ACTIVE',
			spendingPower: 'MEDIUM',
			bio: "Hi! I'm a demo user exploring RSVP'd. Feel free to browse around!",
			userCohort: 'POWER',
			...(defaultLocation && {
				location: { connect: { id: defaultLocation.id } },
			}),
		},
	})

	// Join top communities: member of 5, manager of 2
	const topCommunities = await prisma.community.findMany({
		where: { isPublic: true },
		orderBy: { events: { _count: 'desc' } },
		take: 5,
		select: { id: true },
	})

	for (let i = 0; i < topCommunities.length; i++) {
		const community = topCommunities[i]
		await prisma.communityMembership.upsert({
			where: {
				userId_communityId: {
					userId: demoUser.id,
					communityId: community.id,
				},
			},
			update: {},
			create: {
				userId: demoUser.id,
				communityId: community.id,
				role: i < 2 ? 'ADMIN' : 'MEMBER',
			},
		})
	}

	// RSVP to upcoming events with free tickets (up to 6)
	const upcomingEvents = await prisma.event.findMany({
		where: {
			isPublished: true,
			deletedAt: null,
			startDate: { gte: new Date() },
		},
		orderBy: { startDate: 'asc' },
		take: 6,
		include: {
			ticketTiers: {
				where: { priceCents: 0 },
				take: 1,
			},
		},
	})

	for (const event of upcomingEvents) {
		const freeTier = event.ticketTiers[0]
		if (!freeTier) continue

		// Check if demo user already has an RSVP for this event
		const existingRsvp = await prisma.rsvp.findFirst({
			where: { userId: demoUser.id, eventId: event.id },
		})
		if (existingRsvp) continue

		// Create order → payment → RSVP
		const order = await prisma.order.create({
			data: {
				eventId: event.id,
				purchaserEmail: DemoUser.email,
				purchaserName: DemoUser.name,
				status: 'PAID',
				totalCents: 0,
				items: {
					create: {
						ticketTierId: freeTier.id,
						quantity: 1,
						priceCents: 0,
					},
				},
				payments: {
					create: {
						amountCents: 0,
						status: 'SUCCEEDED',
						provider: 'demo',
						currency: 'USD',
					},
				},
			},
		})

		await prisma.rsvp.create({
			data: {
				userId: demoUser.id,
				eventId: event.id,
				email: DemoUser.email,
				name: DemoUser.name,
				ticketTierId: freeTier.id,
				orderId: order.id,
				status: 'CONFIRMED',
				paymentState: 'NONE',
			},
		})
	}

	// Associate demo user as host of 2 existing seeded events
	// (avoids creating events without proper images from the Unsplash system)
	// Skip events already RSVP'd to avoid the demo user hosting their own RSVP'd events
	const rsvpEventIds = upcomingEvents.map((e) => e.id)
	const existingEvents = await prisma.event.findMany({
		where: {
			isPublished: true,
			deletedAt: null,
			startDate: { gte: new Date() },
			community: { isPublic: true },
			id: { notIn: rsvpEventIds },
		},
		orderBy: { startDate: 'asc' },
		take: 2,
		select: { id: true },
	})

	for (const event of existingEvents) {
		await prisma.event.update({
			where: { id: event.id },
			data: { hostId: demoUser.id },
		})
	}

	// Add some category interests
	const categories = await prisma.category.findMany({
		take: 4,
		orderBy: { events: { _count: 'desc' } },
		select: { id: true },
	})

	for (const category of categories) {
		await prisma.userCategory.upsert({
			where: {
				userId_categoryId: {
					userId: demoUser.id,
					categoryId: category.id,
				},
			},
			update: {},
			create: {
				userId: demoUser.id,
				categoryId: category.id,
				interestLevel: 8,
			},
		})
	}

	return demoUser
}
