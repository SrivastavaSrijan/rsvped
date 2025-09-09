import { z } from 'zod'
import {
	communityCoreSelect,
	communityEnhancedSelect,
	enhanceCommunities,
} from '@/server/api/routers/community/enhancement'
import { enhanceEvents } from '@/server/api/routers/event/enhancement'
import {
	eventCoreInclude,
	eventEnhancedInclude,
} from '@/server/api/routers/event/includes'
import { protectedPaginatedProcedure } from '@/server/api/shared/middleware'
import { createTRPCRouter } from '@/server/api/trpc'
import { SearchType } from './types'

const SearchInput = z.object({
	query: z.string().min(1),
	type: z
		.enum([SearchType.ALL, SearchType.EVENTS, SearchType.COMMUNITIES])
		.default(SearchType.ALL),
})

const stirSearchBaseProcedure = protectedPaginatedProcedure
	.input(SearchInput)
	.use(async ({ ctx, input, next }) => {
		const { query, type } = input
		const user = ctx.session?.user

		// Build where clauses for events and communities
		const eventWhere = {
			isPublished: true,
			deletedAt: null,
			OR: [
				{ title: { contains: query, mode: 'insensitive' as const } },
				{ description: { contains: query, mode: 'insensitive' as const } },
			],
		}

		const communityWhere = {
			isPublic: true,
			OR: [
				{ name: { contains: query, mode: 'insensitive' as const } },
				{ description: { contains: query, mode: 'insensitive' as const } },
			],
		}

		const shouldFetchEvents =
			type === SearchType.ALL || type === SearchType.EVENTS
		const shouldFetchCommunities =
			type === SearchType.ALL || type === SearchType.COMMUNITIES

		return next({
			ctx: {
				...ctx,
				user,
				eventWhere: shouldFetchEvents ? eventWhere : null,
				communityWhere: shouldFetchCommunities ? communityWhere : null,
			},
		})
	})

export const stirSearchRouter = createTRPCRouter({
	core: stirSearchBaseProcedure.query(async ({ ctx }) => {
		const { eventWhere, communityWhere, pagination } = ctx
		const { skip, take } = pagination

		const [eventsResult, communitiesResult] = await Promise.all([
			eventWhere
				? Promise.all([
						ctx.prisma.event.findMany({
							where: eventWhere,
							include: eventCoreInclude,
							skip,
							take,
							orderBy: { startDate: 'desc' },
						}),
						ctx.prisma.event.count({ where: eventWhere }),
					])
				: ([[], 0] as const),
			communityWhere
				? Promise.all([
						ctx.prisma.community.findMany({
							where: communityWhere,
							select: communityCoreSelect,
							skip,
							take,
							orderBy: { name: 'asc' },
						}),
						ctx.prisma.community.count({ where: communityWhere }),
					])
				: ([[], 0] as const),
		])

		const [events, eventsTotal] = eventsResult
		const [communities, communitiesTotal] = communitiesResult

		// Add basic metadata for communities
		const communitiesWithMetadata = communities.map((community) => ({
			...community,
			metadata: { role: null },
		}))

		return {
			events: {
				data: events,
				pagination: pagination.createMetadata(eventsTotal),
			},
			communities: {
				data: communitiesWithMetadata,
				pagination: pagination.createMetadata(communitiesTotal),
			},
		}
	}),

	enhanced: stirSearchBaseProcedure.query(async ({ ctx }) => {
		const { user, eventWhere, communityWhere, pagination } = ctx
		const { skip, take } = pagination

		const [eventsResult, communitiesResult] = await Promise.all([
			eventWhere
				? Promise.all([
						ctx.prisma.event.findMany({
							where: eventWhere,
							include: eventEnhancedInclude,
							skip,
							take,
							orderBy: { startDate: 'desc' },
						}),
						ctx.prisma.event.count({ where: eventWhere }),
					])
				: ([[], 0] as const),
			communityWhere
				? Promise.all([
						ctx.prisma.community.findMany({
							where: communityWhere,
							select: communityEnhancedSelect,
							skip,
							take,
							orderBy: { name: 'asc' },
						}),
						ctx.prisma.community.count({ where: communityWhere }),
					])
				: ([[], 0] as const),
		])

		const [events, eventsTotal] = eventsResult
		const [communities, communitiesTotal] = communitiesResult

		// For unauthenticated users, return core data without enhancement
		if (!user) {
			const communitiesWithMetadata = communities.map((community) => ({
				...community,
				metadata: { role: null },
			}))

			return {
				events: {
					data: events,
					pagination: pagination.createMetadata(eventsTotal),
				},
				communities: {
					data: communitiesWithMetadata,
					pagination: pagination.createMetadata(communitiesTotal),
				},
			}
		}

		// Use shared enhancement logic
		const [eventsWithMetadata, communitiesWithMetadata] = await Promise.all([
			events.length > 0 ? enhanceEvents([...events], user, ctx.prisma) : [],
			communities.length > 0
				? enhanceCommunities([...communities], user.id, ctx.prisma)
				: [],
		])

		return {
			events: {
				data: eventsWithMetadata,
				pagination: pagination.createMetadata(eventsTotal),
			},
			communities: {
				data: communitiesWithMetadata,
				pagination: pagination.createMetadata(communitiesTotal),
			},
		}
	}),
})
