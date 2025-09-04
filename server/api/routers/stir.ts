import { z } from 'zod'
import {
	StirSearchInputSchema,
	StirSearchOutputSchema,
} from '@/server/actions/ai/prompts/stir'
import { aiEnrichedProcedure, ensureLLM } from '@/server/api/procedures/ai'
import { createTRPCRouter } from '@/server/api/trpc'
import { StirService } from '@/server/services/stir'

export const stirRouter = createTRPCRouter({
	search: aiEnrichedProcedure
		.input(StirSearchInputSchema)
		.output(StirSearchOutputSchema)
		.use(ensureLLM)
		.query(async ({ ctx, input }) => {
			const service = new StirService({
				prisma: ctx.prisma,
				userId: ctx.session?.user?.id,
				userContext: ctx.aiContext
					? {
							locationId: ctx.aiContext.locationId,
							interests: ctx.aiContext.interests,
							communities: ctx.aiContext.communities,
						}
					: undefined,
			})

			const intent = await service.parseSearchIntent(input.query)

			const [events, users, communities] = await Promise.all([
				input.type === 'users' || input.type === 'communities'
					? Promise.resolve([])
					: service.searchEvents(intent, input),
				input.type === 'events' || input.type === 'communities'
					? Promise.resolve([])
					: service.searchUsers(intent, input),
				input.type === 'events' || input.type === 'users'
					? Promise.resolve([])
					: service.searchCommunities(intent, input),
			])

			// Summary mirrors interpretation + suggested next steps
			const searchSummary = {
				interpretation: intent.summary.interpretation,
				filters: {
					intent,
				},
				suggestions: intent.summary.suggestions,
			}

			return { events, users, communities, searchSummary }
		}),

	trending: aiEnrichedProcedure
		.input(
			z.object({
				type: z.enum(['events', 'users', 'communities']).default('events'),
				limit: z.number().min(1).max(50).default(10),
			})
		)
		.query(async ({ ctx, input }) => {
			if (input.type === 'events') {
				const events = await ctx.prisma.event.findMany({
					where: { status: 'PUBLISHED', isPublished: true },
					orderBy: [{ rsvpCount: 'desc' }, { viewCount: 'desc' }],
					take: input.limit,
					select: {
						id: true,
						title: true,
						startDate: true,
						locationId: true,
						communityId: true,
					},
				})
				return events
			}
			if (input.type === 'users') {
				const users = await ctx.prisma.user.findMany({
					where: {
						OR: [
							{ rsvps: { some: {} } },
							{ communityMemberships: { some: {} } },
						],
					},
					take: input.limit,
					select: {
						id: true,
						name: true,
						profession: true,
						experienceLevel: true,
					},
				})
				return users
			}
			const communities = await ctx.prisma.community.findMany({
				orderBy: { updatedAt: 'desc' },
				take: input.limit,
				select: { id: true, name: true, isPublic: true },
			})
			return communities
		}),

	suggestions: aiEnrichedProcedure
		.input(z.object({ limit: z.number().min(1).max(20).default(5) }))
		.query(async ({ ctx, input }) => {
			// Simple suggestions: upcoming events in user categories
			const interestIds = (ctx.aiContext?.interests ?? []).map(
				(i) => i.categoryId
			)
			if (interestIds.length === 0) return []

			const events = await ctx.prisma.event.findMany({
				where: {
					status: 'PUBLISHED',
					isPublished: true,
					categories: { some: { categoryId: { in: interestIds } } },
				},
				orderBy: [{ rsvpCount: 'desc' }, { viewCount: 'desc' }],
				take: input.limit,
				select: {
					id: true,
					title: true,
					startDate: true,
					locationId: true,
					communityId: true,
				},
			})
			return events
		}),
})
