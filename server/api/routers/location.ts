import { groupBy } from 'lodash'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const locationRouter = createTRPCRouter({
	// Get all locations
	list: publicProcedure.query(async ({ ctx }) => {
		const locationsData = await ctx.prisma.location.findMany({
			where: {
				events: {
					some: {
						isPublished: true,
						deletedAt: null,
					},
				},
			},
			orderBy: [{ continent: 'asc' }, { name: 'asc' }],
			select: {
				_count: true,
				id: true,
				name: true,
				slug: true,
				country: true,
				iconPath: true,
				continent: true,
			},
		})
		const groupedContinents = groupBy(locationsData, 'continent')
		return groupedContinents
	}),
})
