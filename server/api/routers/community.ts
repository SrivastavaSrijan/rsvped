import z from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const communityRouter = createTRPCRouter({
	// Get all communities
	list: publicProcedure
		.input(
			z
				.object({ take: z.number().min(1).max(100).default(10) })
				.optional()
				.default({ take: 10 })
		)
		.query(async ({ ctx, input: { take } }) => {
			const user = ctx.session?.user
			const communities = await ctx.prisma.community.findMany({
				take,
				orderBy: {
					events: {
						_count: 'desc',
					},
				},
				select: {
					_count: true,
					description: true,
					slug: true,
					name: true,
					coverImage: true,
					id: true,
				},
				where: {
					events: {
						some: {
							deletedAt: null,
							isPublished: true,
						},
					},
				},
			})

			const communityIds = communities.map((community) => community.id)

			const userCommunities = user
				? await ctx.prisma.communityMembership.findMany({
						where: {
							userId: user.id,
							communityId: {
								in: communityIds,
							},
						},
						select: {
							communityId: true,
							role: true,
						},
					})
				: []

			const communitiesWithMembership = communities.map((community) => {
				const membership = userCommunities.find((m) => m.communityId === community.id)
				return {
					...community,
					metadata: {
						role: membership?.role ?? null,
					},
				}
			})
			return communitiesWithMembership
		}),
})
