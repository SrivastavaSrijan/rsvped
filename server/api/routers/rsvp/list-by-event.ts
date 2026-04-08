import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { protectedPaginatedProcedure } from '@/server/api/shared/middleware'
import { createTRPCRouter } from '@/server/api/trpc'

const ListByEventInput = z.object({
	slug: z.string(),
	status: z.enum(['CONFIRMED', 'CANCELLED', 'WAITLIST']).optional(),
	search: z.string().optional(),
})

const rsvpByEventInclude = {
	user: { select: { id: true, name: true, image: true } },
	ticketTier: { select: { name: true, priceCents: true } },
	checkIn: { select: { scannedAt: true } },
} as const

export const rsvpListByEventRouter = createTRPCRouter({
	list: protectedPaginatedProcedure
		.input(ListByEventInput)
		.query(async ({ ctx, input }) => {
			const event = await ctx.prisma.event.findUnique({
				where: { slug: input.slug, deletedAt: null },
				select: {
					id: true,
					hostId: true,
					eventCollaborators: {
						select: { userId: true },
					},
				},
			})
			if (!event) {
				throw TRPCErrors.eventNotFound()
			}

			const userId = ctx.session.user.id
			const isHost = event.hostId === userId
			const isCollaborator = event.eventCollaborators.some(
				(c) => c.userId === userId
			)
			if (!isHost && !isCollaborator) {
				throw TRPCErrors.forbidden()
			}

			const where = {
				eventId: event.id,
				...(input.status ? { status: input.status } : {}),
				...(input.search
					? {
							OR: [
								{
									name: {
										contains: input.search,
										mode: 'insensitive' as const,
									},
								},
								{
									email: {
										contains: input.search,
										mode: 'insensitive' as const,
									},
								},
							],
						}
					: {}),
			}

			const [data, total] = await Promise.all([
				ctx.prisma.rsvp.findMany({
					where,
					include: rsvpByEventInclude,
					orderBy: { createdAt: 'desc' },
					skip: ctx.pagination.skip,
					take: ctx.pagination.take,
				}),
				ctx.prisma.rsvp.count({ where }),
			])

			return { data, pagination: ctx.pagination.createMetadata(total) }
		}),
})
