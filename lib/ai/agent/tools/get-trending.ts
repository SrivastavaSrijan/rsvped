import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { ToolEventResult } from '../types'

export const getTrending = tool({
	description:
		'Get trending/popular events. If a userId is provided, scopes to events in the user\'s communities first. Use for "what\'s popular" or "trending" queries.',
	inputSchema: z.object({
		userId: z
			.string()
			.optional()
			.describe("Optional user ID to scope trending to the user's communities"),
	}),
	execute: async ({ userId }) => {
		try {
			const now = new Date()

			// If user is logged in, try to find trending in their communities first
			if (userId) {
				const userMemberships = await prisma.communityMembership.findMany({
					where: { userId },
					select: { communityId: true },
				})
				const communityIds = userMemberships.map((m) => m.communityId)

				if (communityIds.length > 0) {
					const communityEvents = await prisma.event.findMany({
						where: {
							isPublished: true,
							deletedAt: null,
							endDate: { gte: now },
							communityId: { in: communityIds },
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
						take: 10,
					})

					if (communityEvents.length >= 3) {
						return communityEvents.map(
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
					}
				}
			}

			// Fallback: all published events sorted by RSVP count
			const events = await prisma.event.findMany({
				where: {
					isPublished: true,
					deletedAt: null,
					endDate: { gte: now },
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
				take: 10,
			})

			return events.map(
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
			return { error: `Failed to get trending events: ${message}` }
		}
	},
})
