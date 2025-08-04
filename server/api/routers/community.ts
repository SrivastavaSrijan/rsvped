import { TRPCError } from '@trpc/server'
import z from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const communityRouter = createTRPCRouter({
	// Get all communities
	listNearby: publicProcedure
		.input(
			z
				.object({
					take: z.number().min(1).max(100).default(10),
					locationId: z.string().optional().nullable(),
				})
				.optional()
				.default({ take: 10 })
		)
		.query(async ({ ctx, input: { take, locationId } }) => {
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
							OR: [
								{ locationId: locationId },
								{ locationType: { in: ['ONLINE', 'HYBRID'] } },
							],
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
				const membership = userCommunities.find(
					(m) => m.communityId === community.id
				)
				return {
					...community,
					metadata: {
						role: membership?.role ?? null,
					},
				}
			})
			return communitiesWithMembership
		}),

	listSlugs: publicProcedure.query(async ({ ctx }) => {
		const communities = await ctx.prisma.community.findMany({
			select: { slug: true },
		})
		return communities.map((c) => c.slug)
	}),

	get: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const { slug } = input
			const community = await ctx.prisma.community.findUnique({
				where: { slug },
				select: {
					id: true,
					name: true,
					slug: true,
					description: true,
					coverImage: true,
					owner: {
						select: {
							image: true,
							location: true,
							name: true,
							email: true,
						},
					},
				},
			})

			if (!community) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Community not found',
				})
			}

			return community
		}),
})
