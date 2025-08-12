import type { Prisma } from '@prisma/client'
import { eventCoreInclude } from '@/server/api/routers/event/includes'

export const rsvpCoreInclude = {
	event: { include: eventCoreInclude },
	ticketTier: { select: { name: true, priceCents: true } },
} satisfies Prisma.RsvpInclude

export const rsvpEnhancedInclude = {
	...rsvpCoreInclude,
	user: { select: { id: true, name: true, email: true, image: true } },
} satisfies Prisma.RsvpInclude
