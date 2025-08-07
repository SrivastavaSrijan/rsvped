import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure } from '@/server/api/trpc'

export const eventNearbyRouter = publicProcedure
	.input(
		z.object({
			locationId: z.string().optional().nullable(),
			take: z.number().min(1).max(100).default(10),
		})
	)
	.query(async ({ ctx, input }) => {
		const { locationId, take } = input
		if (!locationId) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'User location not found',
			})
		}
		const events = await ctx.prisma.event.findMany({
			where: {
				location: {
					id: locationId,
				},
			},
			take,
			select: {
				id: true,
				title: true,
				slug: true,
				startDate: true,
				endDate: true,
				coverImage: true,
			},
		})
		if (events.length === 0) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'No nearby events found',
			})
		}
		return events
	})
