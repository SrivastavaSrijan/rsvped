import { TRPCError } from '@trpc/server'
import { cacheLife, cacheTag } from 'next/cache'
import z from 'zod'
import { CacheTags } from '@/lib/config'
import { prisma } from '@/lib/prisma'
import { createTRPCRouter, publicProcedure } from '../trpc'

async function listNearbyCategories({
	locationId,
	take,
}: {
	locationId: string
	take: number
}) {
	'use cache'
	cacheTag(CacheTags.Category.Nearby(locationId))
	cacheLife('minutes')
	return prisma.category.findMany({
		orderBy: { events: { _count: 'desc' } },
		take,
		select: { _count: true, slug: true, name: true, id: true },
		where: {
			events: {
				some: {
					event: {
						deletedAt: null,
						isPublished: true,
						OR: [
							{ locationId },
							{ locationType: { in: ['ONLINE', 'HYBRID'] } },
						],
					},
				},
			},
		},
	})
}

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
		.query(async ({ input: { take, locationId } }) => {
			if (!locationId) {
				throw new Error('locationId is required')
			}
			return listNearbyCategories({ locationId, take })
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
