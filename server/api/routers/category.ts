import z from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const categoryRouter = createTRPCRouter({
	// Get all categories
	list: publicProcedure
		.input(
			z
				.object({ take: z.number().min(1).max(100).optional().default(10) })
				.optional()
				.default({ take: 10 })
		)
		.query(async ({ ctx, input: { take } }) => {
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
							},
						},
					},
				},
			})
		}),
})
