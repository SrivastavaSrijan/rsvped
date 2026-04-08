import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const getFriendsAttending = tool({
	description:
		'Check if people from the same communities as the user are attending an event. Helps users see social connections at events.',
	inputSchema: z.object({
		eventId: z.string().describe('The event ID to check attendance for'),
		userId: z.string().describe('The current user ID'),
	}),
	execute: async ({ eventId, userId }) => {
		try {
			// Get the user's community IDs
			const userMemberships = await prisma.communityMembership.findMany({
				where: { userId },
				select: { communityId: true },
			})
			const communityIds = userMemberships.map((m) => m.communityId)

			if (communityIds.length === 0) {
				return {
					friendCount: 0,
					friends: [],
					totalAttending: 0,
				}
			}

			// Find peers in same communities who have RSVPs to this event
			const peersAttending = await prisma.rsvp.findMany({
				where: {
					eventId,
					status: 'CONFIRMED',
					userId: { not: userId },
					user: {
						communityMemberships: {
							some: { communityId: { in: communityIds } },
						},
					},
				},
				select: {
					user: {
						select: {
							name: true,
							communityMemberships: {
								where: { communityId: { in: communityIds } },
								select: {
									community: { select: { name: true } },
								},
								take: 1,
							},
						},
					},
				},
				take: 10,
			})

			// Get total RSVP count for the event
			const totalAttending = await prisma.rsvp.count({
				where: { eventId, status: 'CONFIRMED' },
			})

			return {
				friendCount: peersAttending.length,
				friends: peersAttending
					.filter((r) => r.user)
					.map((r) => ({
						name: r.user!.name ?? 'Anonymous',
						community:
							r.user!.communityMemberships[0]?.community.name ?? 'Unknown',
					})),
				totalAttending,
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error'
			return { error: `Failed to check friends attending: ${message}` }
		}
	},
})
