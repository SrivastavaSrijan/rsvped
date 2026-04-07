import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { ToolCommunityResult } from '../types'

export const searchCommunities = tool({
	description:
		'Search for communities by name or description. Returns matching public communities.',
	inputSchema: z.object({
		query: z
			.string()
			.describe('Search query for community names and descriptions'),
		limit: z
			.number()
			.optional()
			.default(10)
			.describe('Max results to return (default 10)'),
	}),
	execute: async ({ query, limit }) => {
		try {
			const communities = await prisma.community.findMany({
				where: {
					isPublic: true,
					OR: [
						{ name: { contains: query, mode: 'insensitive' } },
						{ description: { contains: query, mode: 'insensitive' } },
					],
				},
				take: limit,
				select: {
					id: true,
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
			})

			return communities.map(
				(c): ToolCommunityResult => ({
					id: c.id,
					name: c.name,
					slug: c.slug,
					description: c.description?.slice(0, 200) ?? null,
					memberCount: c._count.members,
					eventCount: c._count.events,
				})
			)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error'
			return { error: `Failed to search communities: ${message}` }
		}
	},
})
