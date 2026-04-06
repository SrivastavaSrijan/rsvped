import { z } from 'zod'
import { communityCoreSelect } from '@/server/api/routers/community/enhancement'
import { eventCoreInclude } from '@/server/api/routers/event/includes'
import { paginatedProcedure } from '@/server/api/shared/middleware'
import { createTRPCRouter } from '@/server/api/trpc'
import {
	calculateCommunityScoreWithMatches,
	calculateEventScoreWithMatches,
	createCommunitySearchWhere,
	createEnhancedCommunitySearchWhere,
	createEnhancedEventSearchWhere,
	createEventSearchWhere,
	isRelevantMatch,
	type SearchScoreParams,
} from './helpers'
import { interpretSearchQuery } from './interpret'

const AI_ENHANCED_BONUS = 200

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

			const keywordWhere = createEventSearchWhere(query)

			// Fire keyword DB query + LLM interpretation in parallel
			const [keywordResult, interpreted] = await Promise.allSettled([
				Promise.all([
					ctx.prisma.event.findMany({
						where: keywordWhere,
						include: eventCoreInclude,
						skip,
						take,
						orderBy: { startDate: 'desc' },
					}),
					ctx.prisma.event.count({ where: keywordWhere }),
				]),
				interpretSearchQuery(query),
			])

			const [keywordEvents, keywordTotal] =
				keywordResult.status === 'fulfilled' ? keywordResult.value : [[], 0]

			const interpretation =
				interpreted.status === 'fulfilled' ? interpreted.value : null

			let aiEnhanced = false

			// If LLM interpretation succeeded, run enhanced query and merge
			if (interpretation) {
				const enhancedWhere = createEnhancedEventSearchWhere(interpretation)
				const enhancedEvents = await ctx.prisma.event.findMany({
					where: enhancedWhere,
					include: eventCoreInclude,
					take,
					orderBy: { startDate: 'desc' },
				})

				if (enhancedEvents.length > 0) {
					aiEnhanced = true
					const interpretedKeywords = interpretation.keywords.join(' ')
					const searchParams: SearchScoreParams = {
						query: interpretedKeywords,
						userLocationId,
					}

					// Score enhanced results using interpreted keywords
					const scoredEnhanced = enhancedEvents.map((event) => {
						const searchResult = calculateEventScoreWithMatches(
							event,
							searchParams
						)
						return {
							...event,
							_searchMetadata: {
								matches: searchResult.matches,
								score: searchResult.total + AI_ENHANCED_BONUS,
								query,
							},
						}
					})

					// Score keyword results with original query
					const keywordParams: SearchScoreParams = { query, userLocationId }
					const scoredKeyword = keywordEvents.map((event) => {
						const searchResult = calculateEventScoreWithMatches(
							event,
							keywordParams
						)
						return {
							...event,
							_searchMetadata: {
								matches: searchResult.matches,
								score: searchResult.total,
								query,
							},
						}
					})

					// Merge: dedupe by ID, keep higher score
					const merged = new Map<string, (typeof scoredEnhanced)[number]>()
					for (const event of scoredEnhanced) {
						merged.set(event.id, event)
					}
					for (const event of scoredKeyword) {
						const existing = merged.get(event.id)
						if (
							!existing ||
							event._searchMetadata.score > existing._searchMetadata.score
						) {
							merged.set(event.id, event)
						}
					}

					const data = [...merged.values()]
						.sort((a, b) => b._searchMetadata.score - a._searchMetadata.score)
						.slice(0, take)

					return {
						data,
						pagination: pagination.createMetadata(
							Math.max(keywordTotal, data.length)
						),
						aiEnhanced,
						interpretation,
					}
				}
			}

			// Keyword-only fallback — sort by relevance score
			const searchParams: SearchScoreParams = { query, userLocationId }
			const data = keywordEvents
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
							query,
						},
					}
				})
				.sort((a, b) => b._searchMetadata.score - a._searchMetadata.score)

			return {
				data,
				pagination: pagination.createMetadata(keywordTotal),
				aiEnhanced,
				interpretation,
			}
		}),

	communities: paginatedProcedure
		.input(z.object({ query: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const { query } = input
			const { pagination } = ctx
			const { skip, take } = pagination

			const keywordWhere = createCommunitySearchWhere(query)

			const [keywordResult, interpreted] = await Promise.allSettled([
				Promise.all([
					ctx.prisma.community.findMany({
						where: keywordWhere,
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
					ctx.prisma.community.count({ where: keywordWhere }),
				]),
				interpretSearchQuery(query),
			])

			const [keywordCommunities, keywordTotal] =
				keywordResult.status === 'fulfilled' ? keywordResult.value : [[], 0]

			const interpretation =
				interpreted.status === 'fulfilled' ? interpreted.value : null

			let aiEnhanced = false

			if (interpretation) {
				const enhancedWhere = createEnhancedCommunitySearchWhere(interpretation)
				const enhancedCommunities = await ctx.prisma.community.findMany({
					where: enhancedWhere,
					select: {
						...communityCoreSelect,
						_count: { select: { members: true, events: true } },
						events: {
							select: { startDate: true },
							where: {
								startDate: {
									gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
								},
							},
						},
					},
					take,
					orderBy: { name: 'asc' },
				})

				if (enhancedCommunities.length > 0) {
					aiEnhanced = true
					const interpretedKeywords = interpretation.keywords.join(' ')
					const searchParams: SearchScoreParams = {
						query: interpretedKeywords,
					}

					const scoredEnhanced = enhancedCommunities.map((community) => {
						const searchResult = calculateCommunityScoreWithMatches(
							community,
							searchParams
						)
						return {
							...community,
							metadata: { role: null },
							_searchMetadata: {
								matches: searchResult.matches,
								score: searchResult.total + AI_ENHANCED_BONUS,
								query,
							},
						}
					})

					const keywordParams: SearchScoreParams = { query }
					const scoredKeyword = keywordCommunities.map((community) => {
						const searchResult = calculateCommunityScoreWithMatches(
							community,
							keywordParams
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

					const merged = new Map<string, (typeof scoredEnhanced)[number]>()
					for (const c of scoredEnhanced) merged.set(c.id, c)
					for (const c of scoredKeyword) {
						const existing = merged.get(c.id)
						if (
							!existing ||
							c._searchMetadata.score > existing._searchMetadata.score
						) {
							merged.set(c.id, c)
						}
					}

					const data = [...merged.values()]
						.sort((a, b) => b._searchMetadata.score - a._searchMetadata.score)
						.slice(0, take)

					return {
						data,
						pagination: pagination.createMetadata(
							Math.max(keywordTotal, data.length)
						),
						aiEnhanced,
						interpretation,
					}
				}
			}

			const searchParams: SearchScoreParams = { query }
			const data = keywordCommunities
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
							query,
						},
					}
				})
				.sort((a, b) => b._searchMetadata.score - a._searchMetadata.score)

			return {
				data,
				pagination: pagination.createMetadata(keywordTotal),
				aiEnhanced,
				interpretation,
			}
		}),
})
