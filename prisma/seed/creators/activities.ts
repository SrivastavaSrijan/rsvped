/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import type { ActivityType, PrismaClient } from '@prisma/client'
import { logger } from '../utils'

export async function backfillActivities(prisma: PrismaClient) {
	logger.info('Backfilling user activities from existing data...')

	const activities: {
		userId: string
		type: ActivityType
		targetId: string
		targetType: string
		createdAt: Date
	}[] = []

	// RSVPs → RSVP_EVENT
	const rsvps = await prisma.rsvp.findMany({
		where: { userId: { not: null }, status: 'CONFIRMED' },
		select: { userId: true, eventId: true, createdAt: true },
	})
	for (const r of rsvps) {
		if (r.userId) {
			activities.push({
				userId: r.userId,
				type: 'RSVP_EVENT' as ActivityType,
				targetId: r.eventId,
				targetType: 'event',
				createdAt: r.createdAt,
			})
		}
	}

	// Hosted events → HOST_EVENT
	const events = await prisma.event.findMany({
		where: { isPublished: true, deletedAt: null },
		select: { hostId: true, id: true, createdAt: true },
	})
	for (const e of events) {
		activities.push({
			userId: e.hostId,
			type: 'HOST_EVENT',
			targetId: e.id,
			targetType: 'event',
			createdAt: e.createdAt,
		})
	}

	// Community memberships → JOIN_COMMUNITY
	const memberships = await prisma.communityMembership.findMany({
		select: { userId: true, communityId: true, joinedAt: true },
	})
	for (const m of memberships) {
		activities.push({
			userId: m.userId,
			type: 'JOIN_COMMUNITY',
			targetId: m.communityId,
			targetType: 'community',
			createdAt: m.joinedAt,
		})
	}

	// Accepted friendships → SEND_FRIEND_REQUEST + ACCEPT_FRIEND_REQUEST
	const friendships = await prisma.friendship.findMany({
		where: { status: 'ACCEPTED' },
		select: {
			userId: true,
			friendId: true,
			createdAt: true,
			acceptedAt: true,
		},
	})
	for (const f of friendships) {
		activities.push({
			userId: f.userId,
			type: 'SEND_FRIEND_REQUEST',
			targetId: f.friendId,
			targetType: 'user',
			createdAt: f.createdAt,
		})
		if (f.acceptedAt) {
			activities.push({
				userId: f.friendId,
				type: 'ACCEPT_FRIEND_REQUEST',
				targetId: f.userId,
				targetType: 'user',
				createdAt: f.acceptedAt,
			})
		}
	}

	// Batch insert
	if (activities.length > 0) {
		await prisma.userActivity.createMany({
			data: activities,
			skipDuplicates: true,
		})
	}

	logger.info(`✅ ${activities.length} activity records backfilled`)
	logger.stats({
		RSVPs: rsvps.length,
		'Hosted events': events.length,
		'Community joins': memberships.length,
		'Friend requests': friendships.length * 2,
	})
}
