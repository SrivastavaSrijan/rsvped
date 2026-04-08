import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const getUserRsvps = tool({
	description:
		"Get a user's recent event RSVPs with event details. Use this to understand their event history and preferences.",
	inputSchema: z.object({
		userId: z.string().describe('The user ID to look up'),
		limit: z
			.number()
			.min(1)
			.max(20)
			.optional()
			.default(10)
			.describe('Max number of RSVPs to return (default 10)'),
	}),
	execute: async ({ userId, limit }) => {
		try {
			const rsvps = await prisma.rsvp.findMany({
				where: { userId, status: 'CONFIRMED' },
				select: {
					createdAt: true,
					event: {
						select: {
							title: true,
							slug: true,
							startDate: true,
							endDate: true,
							community: { select: { name: true } },
							categories: {
								select: { category: { select: { name: true } } },
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				take: limit,
			})

			return rsvps.map((r) => ({
				eventTitle: r.event.title,
				eventSlug: r.event.slug,
				startDate: r.event.startDate.toISOString(),
				endDate: r.event.endDate.toISOString(),
				community: r.event.community?.name ?? null,
				categories: r.event.categories.map((c) => c.category.name),
				rsvpDate: r.createdAt.toISOString(),
			}))
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error'
			return { error: `Failed to get user RSVPs: ${message}` }
		}
	},
})
