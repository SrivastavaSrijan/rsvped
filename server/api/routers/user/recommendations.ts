import type { Event } from '@prisma/client'
import { z } from 'zod'
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from '@/server/api/trpc'

type EventWithCategories = Event & {
	categories: { categoryId: string }[]
}

// A simple scoring function based on your plan
const calculateScore = (
	event: EventWithCategories,
	userInterests: Map<string, number>,
	sharedCategoryIds: string[]
) => {
	let score = 0
	let reason = ''

	// 1. Category Overlap Score (45%)
	const categoryMatch = sharedCategoryIds.reduce((acc, catId) => {
		return acc + (userInterests.get(catId) ?? 5) // Default interest 5/10
	}, 0)

	if (categoryMatch > 0) {
		score += 0.45 * (categoryMatch / (userInterests.size * 10)) // Normalize
		reason = 'Matches your interests'
	}

	// 2. Popularity Score (30%) - Using rsvpCount and viewCount
	const popularity = (event.rsvpCount ?? 0) * 2 + (event.viewCount ?? 0)
	if (popularity > 0) {
		// A simple log normalization to prevent huge numbers from dominating
		score += (0.3 * Math.log1p(popularity)) / Math.log1p(10000) // Assume 10k is a high popularity mark
		if (!reason) reason = 'Popular event'
	}

	// 3. Recency Score (25%) - Newer events get a boost
	const daysOld =
		(Date.now() - new Date(event.publishedAt ?? event.createdAt).getTime()) /
		(1000 * 3600 * 24)
	score += 0.25 * Math.max(0, 1 - daysOld / 30) // Boost for events published in the last 30 days
	if (!reason) reason = 'Recently added'

	return { ...event, score, reason }
}

export const recommendationsRouter = createTRPCRouter({
	events: protectedProcedure
		.input(
			z.object({
				limit: z.number().default(6),
				excludeEventId: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { user } = ctx.session

			const userCategoryInterests = await ctx.prisma.userCategory.findMany({
				where: { userId: user.id },
				select: { categoryId: true, interestLevel: true },
			})

			if (userCategoryInterests.length === 0) {
				// Fallback for new users: get top popular events
				return ctx.prisma.event
					.findMany({
						where: {
							startDate: { gte: new Date() },
							status: 'PUBLISHED',
							id: { not: input.excludeEventId },
						},
						orderBy: [{ rsvpCount: 'desc' }, { viewCount: 'desc' }],
						take: input.limit,
					})
					.then((events: Event[]) =>
						events.map((e: Event) => ({ ...e, reason: 'Popular in your area' }))
					)
			}

			const interestMap = new Map(
				userCategoryInterests.map((i) => [i.categoryId, i.interestLevel])
			)
			const categoryIds = Array.from(interestMap.keys())

			const candidateEvents = await ctx.prisma.event.findMany({
				where: {
					startDate: { gte: new Date() },
					status: 'PUBLISHED',
					id: { not: input.excludeEventId },
					// Find events that have at least one matching category
					categories: {
						some: {
							categoryId: { in: categoryIds },
						},
					},
				},
				include: {
					categories: {
						select: {
							categoryId: true,
						},
					},
				},
				take: 50, // Fetch a larger pool of candidates to score
			})

			const scoredEvents = (candidateEvents as EventWithCategories[])
				.map((event) => {
					const sharedCategoryIds = event.categories
						.filter((c) => interestMap.has(c.categoryId))
						.map((c) => c.categoryId)
					return calculateScore(event, interestMap, sharedCategoryIds)
				})
				.sort((a, b) => b.score - a.score)
				.slice(0, input.limit)

			return scoredEvents
		}),

	similar: publicProcedure
		.input(
			z.object({
				eventId: z.string(),
				limit: z.number().default(4),
			})
		)
		.query(async ({ ctx, input }) => {
			const targetEvent = await ctx.prisma.event.findUnique({
				where: { id: input.eventId },
				include: { categories: true, location: true },
			})

			if (!targetEvent) {
				return []
			}

			const targetCategoryIds = targetEvent.categories.map(
				(c: { categoryId: string }) => c.categoryId
			)

			const similarEvents = await ctx.prisma.event.findMany({
				where: {
					id: { not: input.eventId },
					status: 'PUBLISHED',
					// Same location
					locationId: targetEvent.locationId,
					// At least one shared category
					categories: {
						some: {
							categoryId: { in: targetCategoryIds },
						},
					},
				},
				orderBy: [{ rsvpCount: 'desc' }, { viewCount: 'desc' }],
				take: input.limit,
			})

			return similarEvents.map((e: Event) => ({
				...e,
				reason: `More in ${targetEvent.location?.name ?? 'this area'}`,
			}))
		}),
})
