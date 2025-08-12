import type { Prisma } from '@prisma/client'
import { eventCoreInclude } from '@/server/api/routers/event/includes'

export const categoryCoreInclude = {
	_count: {
		select: { events: { where: { isPublished: true, deletedAt: null } } },
	},
} satisfies Prisma.CategoryInclude

export const categoryEnhancedInclude = {
	...categoryCoreInclude,
	events: {
		take: 5,
		where: { isPublished: true, deletedAt: null },
		include: eventCoreInclude,
	},
} satisfies Prisma.CategoryInclude
