import { eventCoreInclude } from '@/server/api/routers/event/includes'
import { protectedPaginatedProcedure } from '@/server/api/shared/middleware'
import { createTRPCRouter } from '@/server/api/trpc'

export const userActivityRouter = createTRPCRouter({
	events: protectedPaginatedProcedure.query(({ ctx }) =>
		ctx.prisma.event.findMany({
			where: { hostId: ctx.session.user.id },
			include: eventCoreInclude,
			skip: ctx.pagination.skip,
			take: ctx.pagination.take,
		})
	),
	rsvps: protectedPaginatedProcedure.query(({ ctx }) =>
		ctx.prisma.rsvp.findMany({
			where: { userId: ctx.session.user.id },
			include: {
				event: { include: eventCoreInclude },
				ticketTier: { select: { name: true, priceCents: true } },
			},
			skip: ctx.pagination.skip,
			take: ctx.pagination.take,
		})
	),
	communities: protectedPaginatedProcedure.query(({ ctx }) =>
		ctx.prisma.communityMembership.findMany({
			where: { userId: ctx.session.user.id },
			include: { community: true },
			skip: ctx.pagination.skip,
			take: ctx.pagination.take,
		})
	),
})
