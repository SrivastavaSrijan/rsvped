import { createTRPCRouter, publicProcedure } from '../trpc'

export const categoryRouter = createTRPCRouter({
	// Get all categories
	list: publicProcedure.query(async ({ ctx }) => {
		return ctx.prisma.category.findMany({
			orderBy: {
				events: {
					_count: 'desc',
				},
			},
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
