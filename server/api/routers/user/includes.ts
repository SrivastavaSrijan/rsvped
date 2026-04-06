import type { Prisma } from '@prisma/client'
import { eventCoreInclude } from '@/server/api/routers/event/includes'

export const userProfileCoreInclude = {
	location: true,
} satisfies Prisma.UserInclude

export const userProfileEnhancedInclude = {
	...userProfileCoreInclude,
	hostedEvents: {
		take: 5,
		where: { isPublished: true, deletedAt: null },
		include: eventCoreInclude,
	},
	_count: { select: { hostedEvents: true, rsvps: true } },
} satisfies Prisma.UserInclude

export const userPublicProfileInclude = {
	location: true,
	hostedEvents: {
		take: 5,
		where: { isPublished: true, deletedAt: null },
		include: eventCoreInclude,
	},
	communityMemberships: {
		take: 10,
		include: { community: true },
	},
	categoryInterests: {
		include: { category: true },
	},
	_count: {
		select: {
			hostedEvents: true,
			rsvps: true,
			sentFriendRequests: { where: { status: 'ACCEPTED' } },
			receivedFriendRequests: { where: { status: 'ACCEPTED' } },
		},
	},
} satisfies Prisma.UserInclude

export const userHoverCardSelect = {
	id: true,
	name: true,
	username: true,
	image: true,
	bio: true,
	profession: true,
	location: true,
	_count: {
		select: {
			sentFriendRequests: { where: { status: 'ACCEPTED' } },
			receivedFriendRequests: { where: { status: 'ACCEPTED' } },
		},
	},
} satisfies Prisma.UserSelect

export const friendshipUserSelect = {
	id: true,
	name: true,
	username: true,
	image: true,
	bio: true,
	profession: true,
} satisfies Prisma.UserSelect
