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
