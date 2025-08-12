import type { Prisma } from '@prisma/client'
import { eventCoreInclude } from '@/server/api/routers/event/includes'

export const locationCoreInclude = {
	_count: {
		select: {
			events: {
				where: { isPublished: true, deletedAt: null },
			},
			users: true,
		},
	},
} satisfies Prisma.LocationInclude

export const locationEnhancedInclude = {
	...locationCoreInclude,
	events: {
		where: { isPublished: true, deletedAt: null },
		include: eventCoreInclude,
	},
} satisfies Prisma.LocationInclude
