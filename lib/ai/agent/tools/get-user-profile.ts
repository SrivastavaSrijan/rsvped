import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const getUserProfile = tool({
	description:
		'Get a user profile including interests, profession, and preferences. Use this to personalize recommendations.',
	inputSchema: z.object({
		userId: z.string().describe('The user ID to look up'),
	}),
	execute: async ({ userId }) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					name: true,
					interests: true,
					experienceLevel: true,
					networkingStyle: true,
					profession: true,
					industry: true,
					location: { select: { name: true } },
					_count: {
						select: {
							communityMemberships: true,
							rsvps: { where: { status: 'CONFIRMED' } },
						},
					},
					categoryInterests: {
						select: { category: { select: { name: true, slug: true } } },
						take: 10,
					},
				},
			})

			if (!user) {
				return { error: 'User not found' }
			}

			return {
				name: user.name,
				interests: user.interests,
				experienceLevel: user.experienceLevel,
				networkingStyle: user.networkingStyle,
				profession: user.profession,
				industry: user.industry,
				location: user.location?.name ?? null,
				communityCount: user._count.communityMemberships,
				rsvpCount: user._count.rsvps,
				preferredCategories: user.categoryInterests.map((c) => c.category.name),
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error'
			return { error: `Failed to get user profile: ${message}` }
		}
	},
})
