import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { ToolEventResult } from '../types'

export const getSimilarEvents = tool({
	description:
		'Find events similar to a given event based on shared categories. Use when the user asks "show me more like this" or wants alternatives.',
	inputSchema: z.object({
		eventId: z.string().describe('The event ID to find similar events for'),
	}),
	execute: async ({ eventId }) => {
		try {
			const now = new Date()

			// Get the source event's categories
			const sourceEvent = await prisma.event.findUnique({
				where: { id: eventId },
				select: {
					id: true,
					categories: {
						select: { categoryId: true },
					},
				},
			})

			if (!sourceEvent) {
				return { error: 'Event not found' }
			}

			const categoryIds = sourceEvent.categories.map((c) => c.categoryId)

			if (categoryIds.length === 0) {
				return []
			}

			// Find events sharing categories, excluding the source and past events
			const similarEvents = await prisma.event.findMany({
				where: {
					id: { not: eventId },
					isPublished: true,
					deletedAt: null,
					endDate: { gte: now },
					categories: {
						some: { categoryId: { in: categoryIds } },
					},
				},
				select: {
					id: true,
					title: true,
					slug: true,
					description: true,
					startDate: true,
					endDate: true,
					community: { select: { name: true } },
					location: { select: { name: true } },
					categories: {
						select: { category: { select: { name: true } } },
					},
					_count: {
						select: { rsvps: { where: { status: 'CONFIRMED' } } },
					},
				},
				orderBy: { rsvps: { _count: 'desc' } },
				take: 5,
			})

			return similarEvents.map(
				(e): ToolEventResult => ({
					id: e.id,
					title: e.title,
					slug: e.slug,
					description: e.description?.slice(0, 200) ?? null,
					startDate: e.startDate.toISOString(),
					endDate: e.endDate.toISOString(),
					location: e.location?.name ?? 'TBA',
					community: e.community?.name ?? null,
					categories: e.categories.map((c) => c.category.name),
					rsvpCount: e._count.rsvps,
				})
			)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error'
			return { error: `Failed to find similar events: ${message}` }
		}
	},
})
