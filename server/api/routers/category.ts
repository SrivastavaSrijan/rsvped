import type { PrismaClient } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { withCache } from '@/lib/cache'
import { CacheTags } from '@/lib/config'
import { createTRPCRouter, publicProcedure } from '../trpc'

const listNearbyCategories = withCache(
	async (prisma: PrismaClient, locationId: string, take: number) =>
		prisma.category.findMany({
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
	{
		cacheTime: 3600,
		tags: (_prisma, locationId) => [CacheTags.Category.Nearby(locationId)],
	}
)

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
			return listNearbyCategories(ctx.prisma, locationId, take)
		}),
	get: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const category = await ctx.prisma.category.findUnique({
				where: { slug: input.slug },
				select: { id: true, name: true, slug: true },
			})

			if (!category) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Category not found',
				})
			}

			return category
		}),
})
