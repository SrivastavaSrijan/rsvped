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
	isRelevantMatch,
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

			// Use intelligent search conditions
			const where = createEventSearchWhere(query)

			// Get a reasonable number of results for filtering
			// For counting queries (small page size), get a larger sample
			const isCountingQuery = take <= 5
			const searchLimit = isCountingQuery
				? Math.min(1000, 2000) // Large sample for accurate counting
				: Math.min(take * 10, 500) // Normal search behavior

			const events = await ctx.prisma.event.findMany({
				where,
				include: eventCoreInclude,
				take: searchLimit,
				orderBy: { startDate: 'desc' },
			})

			// Apply intelligent scoring and filtering
			const searchParams: SearchScoreParams = { query, userLocationId }

			const relevantEvents = events
				.filter(
					(event) =>
						isRelevantMatch(event.title, query) ||
						(event.description && isRelevantMatch(event.description, query))
				)
				.map((event) => {
					const searchResult = calculateEventScoreWithMatches(
						event,
						searchParams
					)
					return {
						...event,
						_searchMetadata: {
							matches: searchResult.matches,
							score: searchResult.total,
							query: query,
						},
					}
				})
				.sort((a, b) => b._searchMetadata.score - a._searchMetadata.score)

			// Simple pagination
			const paginatedEvents = relevantEvents.slice(skip, skip + take)
			const total = relevantEvents.length

			return {
				data: paginatedEvents,
				pagination: pagination.createMetadata(total),
			}
		}),

	communities: paginatedProcedure
		.input(z.object({ query: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const { query } = input
			const { pagination } = ctx
			const { skip, take } = pagination

			// Use intelligent search conditions
			const where = createCommunitySearchWhere(query)

			// Get a reasonable number of results for filtering
			// For counting queries (small page size), get a larger sample
			const isCountingQuery = take <= 5
			const searchLimit = isCountingQuery
				? Math.min(1000, 2000) // Large sample for accurate counting
				: Math.min(take * 10, 500) // Normal search behavior

			const communities = await ctx.prisma.community.findMany({
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
				take: searchLimit,
				orderBy: { name: 'asc' },
			})

			// Apply intelligent scoring and filtering
			const searchParams: SearchScoreParams = { query }

			const relevantCommunities = communities
				.filter(
					(community) =>
						isRelevantMatch(community.name, query) ||
						(community.description &&
							isRelevantMatch(community.description, query))
				)
				.map((community) => {
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
							query: query,
						},
					}
				})
				.sort((a, b) => b._searchMetadata.score - a._searchMetadata.score)

			// Simple pagination
			const paginatedCommunities = relevantCommunities.slice(skip, skip + take)
			const total = relevantCommunities.length

			return {
				data: paginatedCommunities,
				pagination: pagination.createMetadata(total),
			}
		}),
})
