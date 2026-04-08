/**
 * Demo user seed & reset module.
 *
 * Creates a demo user (isDemo: true) with a rich, interconnected presence:
 * - Pinned to the city with the most events
 * - Community memberships (member of ~10, admin of ~3)
 * - RSVPs to ~15-20 events (prioritizing today/this week)
 * - Host of ~4-5 existing seeded events
 * - 8-12 friendships with users who share interests/location
 * - Activity records for all actions (backdated naturally)
 * - 6-8 category interests at varying levels
 *
 * Can be run standalone or called from the cron reset endpoint.
 */
import type { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth/password'
import { DemoUser } from '@/lib/config/demo'
import { getAvatarURL } from '@/lib/config/routes'

export interface DemoSeedStats {
	communities: number
	rsvps: number
	hostedEvents: number
	categoryInterests: number
	sentFriendRequests: number
	receivedFriendRequests: number
	activities: number
}

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

	// Delete friendships (both directions — onDelete: Cascade only handles one side)
	await prisma.friendship.deleteMany({
		where: { OR: [{ userId }, { friendId: userId }] },
	})

	// Delete activities
	await prisma.userActivity.deleteMany({ where: { userId } })

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
 * Create the demo user and populate with realistic, interconnected data
 * from the existing seeded database.
 */
export async function seedDemoUser(prisma: PrismaClient) {
	const hashedPassword = await hashPassword(DemoUser.password)

	// Pin to the city with the most events (richest demo experience)
	const busiestLocation = await prisma.location.findFirst({
		where: {
			events: { some: { isPublished: true, deletedAt: null } },
		},
		orderBy: { events: { _count: 'desc' } },
	})

	// Create the demo user
	const demoUser = await prisma.user.upsert({
		where: { email: DemoUser.email },
		update: {
			password: hashedPassword,
			isDemo: true,
			name: DemoUser.name,
			username: DemoUser.username,
			bio: DemoUser.bio,
			profession: DemoUser.profession,
			industry: DemoUser.industry,
		},
		create: {
			email: DemoUser.email,
			password: hashedPassword,
			name: DemoUser.name,
			username: DemoUser.username,
			image: getAvatarURL(DemoUser.name),
			isDemo: true,
			role: 'USER',
			emailVerified: new Date(),
			profession: DemoUser.profession,
			industry: DemoUser.industry,
			experienceLevel: 'SENIOR',
			networkingStyle: 'ACTIVE',
			spendingPower: 'MEDIUM',
			bio: DemoUser.bio,
			userCohort: 'POWER',
			...(busiestLocation && {
				location: { connect: { id: busiestLocation.id } },
			}),
		},
	})

	// --- Communities: join 10, admin of 3 ---
	// Prefer communities in demo user's city, then fill with top public ones
	const localCommunities = busiestLocation
		? await prisma.community.findMany({
				where: {
					isPublic: true,
					events: {
						some: { locationId: busiestLocation.id },
					},
				},
				orderBy: { events: { _count: 'desc' } },
				take: 10,
				select: { id: true },
			})
		: []

	const localIds = new Set(localCommunities.map((c) => c.id))
	const remaining = 10 - localCommunities.length

	const additionalCommunities =
		remaining > 0
			? await prisma.community.findMany({
					where: {
						isPublic: true,
						id: { notIn: [...localIds] },
					},
					orderBy: { events: { _count: 'desc' } },
					take: remaining,
					select: { id: true },
				})
			: []

	const allCommunities = [...localCommunities, ...additionalCommunities]

	for (let i = 0; i < allCommunities.length; i++) {
		const community = allCommunities[i]
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
				role: i < 3 ? 'ADMIN' : 'MEMBER',
			},
		})
	}

	// --- Events: RSVP to 15-20, prioritizing today/this week ---
	const now = new Date()
	const endOfWeek = new Date(now)
	endOfWeek.setDate(endOfWeek.getDate() + 7)
	const endOfMonth = new Date(now)
	endOfMonth.setDate(endOfMonth.getDate() + 30)

	// Tier 1: Events today/this week (highest priority)
	const thisWeekEvents = await prisma.event.findMany({
		where: {
			isPublished: true,
			deletedAt: null,
			startDate: { gte: now, lte: endOfWeek },
		},
		orderBy: { startDate: 'asc' },
		take: 10,
		include: { ticketTiers: { take: 1, orderBy: { priceCents: 'asc' } } },
	})

	// Tier 2: Events this month
	const thisMonthEvents = await prisma.event.findMany({
		where: {
			isPublished: true,
			deletedAt: null,
			startDate: { gt: endOfWeek, lte: endOfMonth },
			id: { notIn: thisWeekEvents.map((e) => e.id) },
		},
		orderBy: { startDate: 'asc' },
		take: 10,
		include: { ticketTiers: { take: 1, orderBy: { priceCents: 'asc' } } },
	})

	// Tier 3: Any upcoming
	const upcomingEvents = await prisma.event.findMany({
		where: {
			isPublished: true,
			deletedAt: null,
			startDate: { gt: endOfMonth },
			id: {
				notIn: [
					...thisWeekEvents.map((e) => e.id),
					...thisMonthEvents.map((e) => e.id),
				],
			},
		},
		orderBy: { startDate: 'asc' },
		take: 5,
		include: { ticketTiers: { take: 1, orderBy: { priceCents: 'asc' } } },
	})

	const allEvents = [
		...thisWeekEvents,
		...thisMonthEvents,
		...upcomingEvents,
	].slice(0, 20)

	for (const event of allEvents) {
		const tier = event.ticketTiers[0]
		if (!tier) continue

		const existingRsvp = await prisma.rsvp.findFirst({
			where: { userId: demoUser.id, eventId: event.id },
		})
		if (existingRsvp) continue

		const order = await prisma.order.create({
			data: {
				eventId: event.id,
				purchaserEmail: DemoUser.email,
				purchaserName: DemoUser.name,
				status: 'PAID',
				totalCents: tier.priceCents,
				items: {
					create: {
						ticketTierId: tier.id,
						quantity: 1,
						priceCents: tier.priceCents,
					},
				},
				payments: {
					create: {
						amountCents: tier.priceCents,
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
				ticketTierId: tier.id,
				orderId: order.id,
				status: 'CONFIRMED',
				paymentState: tier.priceCents > 0 ? 'PAID' : 'NONE',
			},
		})
	}

	// --- Host 4-5 existing events (reassign, don't create) ---
	const rsvpEventIds = allEvents.map((e) => e.id)
	const hostedEvents = await prisma.event.findMany({
		where: {
			isPublished: true,
			deletedAt: null,
			startDate: { gte: now },
			community: { isPublic: true },
			id: { notIn: rsvpEventIds },
			...(busiestLocation && { locationId: busiestLocation.id }),
		},
		orderBy: { startDate: 'asc' },
		take: 5,
		select: { id: true },
	})

	// Fallback: if not enough events in the demo city, get any upcoming
	const hostedFallback =
		hostedEvents.length < 4
			? await prisma.event.findMany({
					where: {
						isPublished: true,
						deletedAt: null,
						startDate: { gte: now },
						community: { isPublic: true },
						id: {
							notIn: [...rsvpEventIds, ...hostedEvents.map((e) => e.id)],
						},
					},
					orderBy: { startDate: 'asc' },
					take: 5 - hostedEvents.length,
					select: { id: true },
				})
			: []

	const allHostedEvents = [...hostedEvents, ...hostedFallback]
	for (const event of allHostedEvents) {
		await prisma.event.update({
			where: { id: event.id },
			data: { hostId: demoUser.id },
		})
	}

	// --- Category interests: 8 categories, varying interest levels ---
	const categories = await prisma.category.findMany({
		take: 8,
		orderBy: { events: { _count: 'desc' } },
		select: { id: true },
	})

	const interestLevels = [10, 9, 9, 8, 7, 7, 6, 6]
	for (let i = 0; i < categories.length; i++) {
		const category = categories[i]
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
				interestLevel: interestLevels[i] ?? 6,
			},
		})
	}

	// --- Friendships: 8-12 sent + 3-5 received, based on shared interests/location ---
	const potentialFriends = await prisma.user.findMany({
		where: {
			id: { not: demoUser.id },
			isDemo: { not: true },
		},
		select: {
			id: true,
			locationId: true,
			industry: true,
			categoryInterests: {
				select: { categoryId: true, interestLevel: true },
			},
		},
	})

	const demoCategoryIds = new Set(categories.map((c) => c.id))
	type ScoredFriend = { id: string; score: number }
	const scoredFriends: ScoredFriend[] = potentialFriends.map((friend) => {
		let score = 0
		// Same location: +3
		if (busiestLocation && friend.locationId === busiestLocation.id) {
			score += 3
		}
		// Shared categories: +2 each
		for (const ci of friend.categoryInterests) {
			if (demoCategoryIds.has(ci.categoryId)) {
				score += ci.interestLevel > 5 ? 2 : 1
			}
		}
		// Same industry: +1
		if (friend.industry === DemoUser.industry) {
			score += 1
		}
		return { id: friend.id, score }
	})

	scoredFriends.sort((a, b) => b.score - a.score)

	// Top 12 are friends the demo user reached out to (sent requests)
	const topFriends = scoredFriends.slice(0, 12).filter((f) => f.score > 0)
	// Next 4 are friends who reached out to the demo user (received requests)
	const incomingFriends = scoredFriends.slice(12, 16).filter((f) => f.score > 0)

	const thirtyDaysAgo = new Date(now)
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

	for (let i = 0; i < topFriends.length; i++) {
		const friend = topFriends[i]
		const isAccepted = i < 10 // First 10 accepted, last 2 pending
		const createdAt = new Date(
			thirtyDaysAgo.getTime() +
				Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
		)

		await prisma.friendship.upsert({
			where: {
				userId_friendId: {
					userId: demoUser.id,
					friendId: friend.id,
				},
			},
			update: {},
			create: {
				userId: demoUser.id,
				friendId: friend.id,
				status: isAccepted ? 'ACCEPTED' : 'PENDING',
				createdAt,
				acceptedAt: isAccepted
					? new Date(
							createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000
						)
					: null,
			},
		})
	}

	// Create received friend requests (other users reaching out to demo user)
	for (let i = 0; i < incomingFriends.length; i++) {
		const friend = incomingFriends[i]
		const isAccepted = i < 2 // First 2 accepted, rest pending
		const createdAt = new Date(
			thirtyDaysAgo.getTime() +
				Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
		)

		await prisma.friendship.upsert({
			where: {
				userId_friendId: {
					userId: friend.id,
					friendId: demoUser.id,
				},
			},
			update: {},
			create: {
				userId: friend.id,
				friendId: demoUser.id,
				status: isAccepted ? 'ACCEPTED' : 'PENDING',
				createdAt,
				acceptedAt: isAccepted
					? new Date(
							createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000
						)
					: null,
			},
		})
	}

	// --- Activity records for all demo user actions ---
	const activities: {
		userId: string
		type:
			| 'RSVP_EVENT'
			| 'HOST_EVENT'
			| 'JOIN_COMMUNITY'
			| 'SEND_FRIEND_REQUEST'
			| 'ACCEPT_FRIEND_REQUEST'
		targetId: string
		targetType: string
		createdAt: Date
	}[] = []

	// RSVP activities
	for (const event of allEvents) {
		activities.push({
			userId: demoUser.id,
			type: 'RSVP_EVENT',
			targetId: event.id,
			targetType: 'event',
			createdAt: randomDateInPast(14),
		})
	}

	// Hosted event activities
	for (const event of allHostedEvents) {
		activities.push({
			userId: demoUser.id,
			type: 'HOST_EVENT',
			targetId: event.id,
			targetType: 'event',
			createdAt: randomDateInPast(30),
		})
	}

	// Community join activities
	for (const community of allCommunities) {
		activities.push({
			userId: demoUser.id,
			type: 'JOIN_COMMUNITY',
			targetId: community.id,
			targetType: 'community',
			createdAt: randomDateInPast(30),
		})
	}

	// Sent friend request activities
	for (let i = 0; i < Math.min(topFriends.length, 10); i++) {
		const friend = topFriends[i]
		activities.push({
			userId: demoUser.id,
			type: 'SEND_FRIEND_REQUEST',
			targetId: friend.id,
			targetType: 'user',
			createdAt: randomDateInPast(30),
		})
	}

	// Accept friend request activities (for the incoming accepted ones)
	for (let i = 0; i < Math.min(incomingFriends.length, 2); i++) {
		const friend = incomingFriends[i]
		activities.push({
			userId: demoUser.id,
			type: 'ACCEPT_FRIEND_REQUEST',
			targetId: friend.id,
			targetType: 'user',
			createdAt: randomDateInPast(20),
		})
	}

	if (activities.length > 0) {
		await prisma.userActivity.createMany({
			data: activities,
			skipDuplicates: true,
		})
	}

	const stats: DemoSeedStats = {
		communities: allCommunities.length,
		rsvps: allEvents.length,
		hostedEvents: allHostedEvents.length,
		categoryInterests: categories.length,
		sentFriendRequests: topFriends.length,
		receivedFriendRequests: incomingFriends.length,
		activities: activities.length,
	}

	return { user: demoUser, stats }
}

/** Generate a random date within the last N days */
function randomDateInPast(days: number): Date {
	const now = Date.now()
	return new Date(now - Math.random() * days * 24 * 60 * 60 * 1000)
}
