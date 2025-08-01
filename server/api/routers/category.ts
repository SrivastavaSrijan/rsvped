import z from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const categoryRouter = createTRPCRouter({
	// Get all categories
	listNearby: publicProcedure
		.input(
			z
				.object({
					take: z.number().min(1).max(100).optional().default(10),
					locationId: z.string().optional().nullable(),
				})
				.optional()
				.default({ take: 10 })
		)
		.query(async ({ ctx, input: { take, locationId } }) => {
			return ctx.prisma.category.findMany({
				orderBy: {
					events: {
						_count: 'desc',
					},
				},
				take,
				select: {
					_count: true,
					slug: true,
					name: true,
					id: true,
				},
				where: {
					events: {
						some: {
							event: {
								deletedAt: null,
								isPublished: true,
								OR: [
									{ locationId: locationId },
									{ locationType: { in: ['ONLINE', 'HYBRID'] } },
								],
							},
						},
					},
				},
			})
		}),
})
