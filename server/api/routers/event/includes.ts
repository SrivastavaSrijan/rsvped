import type { Prisma } from '@prisma/client'

export const eventCoreInclude = {
	host: {
		select: { id: true, name: true, image: true, email: true },
	},
	location: true,
	_count: {
		select: { rsvps: { where: { status: 'CONFIRMED' } } },
	},
} satisfies Prisma.EventInclude

export const eventEnhancedInclude = {
	...eventCoreInclude,
	rsvps: {
		take: 5,
		orderBy: { createdAt: 'desc' },
		where: { status: 'CONFIRMED' },
		select: {
			name: true,
			email: true,
			user: { select: { id: true, name: true, image: true } },
		},
	},
	eventCollaborators: {
		select: {
			role: true,
			user: { select: { id: true, name: true, image: true } },
		},
	},
	categories: { include: { category: true } },
} satisfies Prisma.EventInclude

export const eventEditInclude = {
	host: {
		select: { id: true, name: true },
	},
	location: {
		select: { id: true, name: true },
	},
	categories: {
		select: { categoryId: true },
	},
} satisfies Prisma.EventInclude
