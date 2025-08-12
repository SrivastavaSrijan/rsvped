import type { Prisma } from '@prisma/client'
import { eventCoreInclude } from '@/server/api/routers/event/includes'

export const categoryCoreInclude = {
	_count: {
		select: {
			events: { where: { event: { isPublished: true, deletedAt: null } } },
		},
	},
} satisfies Prisma.CategoryInclude

export const categoryEnhancedInclude = {
	_count: {
		select: { events: true },
	},
	events: {
		take: 5,
		where: { event: { isPublished: true, deletedAt: null } },
		include: {
			event: {
				include: eventCoreInclude,
			},
		},
	},
} satisfies Prisma.CategoryInclude
