import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const getUserCommunities = tool({
	description:
		"Get a user's community memberships. Use this to understand their social context and recommend community-related events.",
	inputSchema: z.object({
		userId: z.string().describe('The user ID to look up'),
	}),
	execute: async ({ userId }) => {
		try {
			const memberships = await prisma.communityMembership.findMany({
				where: { userId },
				select: {
					role: true,
					joinedAt: true,
					community: {
						select: {
							name: true,
							slug: true,
							description: true,
							_count: {
								select: {
									members: true,
									events: true,
								},
							},
						},
					},
				},
				orderBy: { joinedAt: 'desc' },
			})

			return memberships.map((m) => ({
				communityName: m.community.name,
				communitySlug: m.community.slug,
				description: m.community.description
					? m.community.description.slice(0, 200)
					: null,
				role: m.role,
				memberCount: m.community._count.members,
				eventCount: m.community._count.events,
				joinedAt: m.joinedAt.toISOString(),
			}))
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error'
			return { error: `Failed to get user communities: ${message}` }
		}
	},
})
