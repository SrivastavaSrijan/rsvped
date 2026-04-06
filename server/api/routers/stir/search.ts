import { z } from 'zod'
import { communityCoreSelect } from '@/server/api/routers/community/enhancement'
import { eventCoreInclude } from '@/server/api/routers/event/includes'
import { paginatedProcedure } from '@/server/api/shared/middleware'
import { createTRPCRouter } from '@/server/api/trpc'
import {
	calculateCommunityScoreWithMatches,
	calculateEventScoreWithMatches,
	createCommunitySearchWhere,
	createEventSearchWhere,
	type SearchScoreParams,
} from './helpers'

export const stirSearchRouter = createTRPCRouter({
	events: paginatedProcedure
		.input(
			z.object({
				query: z.string().min(1),
				userLocationId: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { query, userLocationId } = input
			const { pagination } = ctx
			const { skip, take } = pagination

			const where = createEventSearchWhere(query)
			const searchParams: SearchScoreParams = { query, userLocationId }

			const [events, total] = await Promise.all([
				ctx.prisma.event.findMany({
					where,
					include: eventCoreInclude,
					skip,
					take,
					orderBy: { startDate: 'desc' },
				}),
				ctx.prisma.event.count({ where }),
			])

			const data = events.map((event) => {
				const searchResult = calculateEventScoreWithMatches(event, searchParams)
				return {
					...event,
					_searchMetadata: {
						matches: searchResult.matches,
						score: searchResult.total,
						query,
					},
				}
			})

			return {
				data,
				pagination: pagination.createMetadata(total),
			}
		}),

	communities: paginatedProcedure
		.input(z.object({ query: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const { query } = input
			const { pagination } = ctx
			const { skip, take } = pagination

			const where = createCommunitySearchWhere(query)
			const searchParams: SearchScoreParams = { query }

			const [communities, total] = await Promise.all([
				ctx.prisma.community.findMany({
					where,
					select: {
						...communityCoreSelect,
						_count: {
							select: {
								members: true,
								events: true,
							},
						},
						events: {
							select: { startDate: true },
							where: {
								startDate: {
									gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
								},
							},
						},
					},
					skip,
					take,
					orderBy: { name: 'asc' },
				}),
				ctx.prisma.community.count({ where }),
			])

			const data = communities.map((community) => {
				const searchResult = calculateCommunityScoreWithMatches(
					community,
					searchParams
				)
				return {
					...community,
					metadata: { role: null },
					_searchMetadata: {
						matches: searchResult.matches,
						score: searchResult.total,
						query,
					},
				}
			})

			return {
				data,
				pagination: pagination.createMetadata(total),
			}
		}),
})
