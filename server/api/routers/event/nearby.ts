import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
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
			throw TRPCErrors.locationRequired()
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
			throw TRPCErrors.noNearbyEvents()
		}
		return events
	})
