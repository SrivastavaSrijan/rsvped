import { TRPCError } from '@trpc/server'
import { unstable_cache } from 'next/cache'
import z from 'zod'
import { CacheTags } from '@/lib/config'
import { createTRPCRouter, publicProcedure } from '../trpc'

const Tags = CacheTags.Category

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
			if (!locationId) {
				throw new Error('locationId is required')
			}
			const cacheKey = [Tags.Root, 'nearby', locationId, String(take)]
			return unstable_cache(
				async () =>
					ctx.prisma.category.findMany({
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
											{
												locationType: {
													in: ['ONLINE', 'HYBRID'],
												},
											},
										],
									},
								},
							},
						},
					}),
				cacheKey,
				{ revalidate: 300, tags: [Tags.Nearby(locationId)] }
			)()
		}),
	get: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const cacheKey = [Tags.Get(input.slug)]
			const category = await unstable_cache(
				async () =>
					ctx.prisma.category.findUnique({
						where: { slug: input.slug },
						select: { id: true, name: true, slug: true },
					}),
				cacheKey,
				{ revalidate: 300, tags: [Tags.Get(input.slug)] }
			)()

			if (!category) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Category not found',
				})
			}

			return category
		}),
})
