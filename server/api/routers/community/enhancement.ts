import type { Prisma } from '@prisma/client'
import type { Context } from '@/server/api/trpc'

// Helper function to enhance communities with user metadata
export async function enhanceCommunities<T extends { id: string }>(
	communities: T[],
	userId: string,
	prisma: Context['prisma']
) {
	if (communities.length === 0) {
		return []
	}

	// Fetch user memberships for all communities
	const communityIds = communities.map((c) => c.id)
	const memberships = await prisma.communityMembership.findMany({
		where: {
			userId,
			communityId: { in: communityIds },
		},
		select: { communityId: true, role: true },
	})

	// Create membership map for quick lookup
	const membershipMap = new Map(memberships.map((m) => [m.communityId, m.role]))

	// Enhance communities with metadata
	return communities.map((community) => ({
		...community,
		metadata: {
			role: membershipMap.get(community.id) ?? null,
		},
	}))
}

// Select objects for consistency
export const communityCoreSelect = {
	id: true,
	name: true,
	slug: true,
	description: true,
	coverImage: true,
	_count: {
		select: {
			events: true,
			members: true,
		},
	},
} satisfies Prisma.CommunitySelect

export const communityEnhancedSelect = {
	...communityCoreSelect,
	events: {
		take: 2,
		where: {
			deletedAt: null,
			isPublished: true,
		},
		select: {
			title: true,
			slug: true,
			id: true,
			startDate: true,
			endDate: true,
		},
		orderBy: {
			startDate: 'desc' as const,
		},
	},
} satisfies Prisma.CommunitySelect
