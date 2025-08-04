import { MembershipRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { revalidateTag, unstable_cache } from 'next/cache'
import z from 'zod'
import { CacheTags } from '@/lib/config'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

const Tags = CacheTags.Community

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
			if (!locationId) {
				throw new Error('locationId is required')
			}
			const cacheKey = [Tags.Root, 'nearby', locationId, String(take)]
			const user = ctx.session?.user
			const communities = await unstable_cache(
				async () =>
					ctx.prisma.community.findMany({
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
										{
											locationType: {
												in: ['ONLINE', 'HYBRID'],
											},
										},
									],
								},
							},
						},
					}),
				cacheKey,
				{ revalidate: 300, tags: [Tags.Nearby(locationId)] }
			)()

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

	get: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const { slug } = input
			const user = ctx.session?.user
			const cacheKey = [Tags.Get(slug)]
			const community = await unstable_cache(
				async () =>
					ctx.prisma.community.findUnique({
						where: { slug },
						select: {
							id: true,
							name: true,
							slug: true,
							description: true,
							coverImage: true,
							membershipTiers: {
								where: { isActive: true },
								select: {
									id: true,
									name: true,
									description: true,
									priceCents: true,
									currency: true,
								},
								orderBy: { priceCents: 'asc' },
							},
							owner: {
								select: {
									image: true,
									location: true,
									name: true,
									email: true,
								},
							},
						},
					}),
				cacheKey,
				{ revalidate: 300, tags: [Tags.Get(slug)] }
			)()

			if (!community) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Community not found',
				})
			}

			const membership = user
				? await ctx.prisma.communityMembership.findFirst({
						where: {
							userId: user.id,
							communityId: community.id,
						},
						select: {
							role: true,
						},
					})
				: null

			return {
				...community,
				metadata: { role: membership?.role ?? null },
			}
		}),

	subscribe: protectedProcedure
		.input(
			z.object({
				communityId: z.string(),
				membershipTierId: z.string().optional().nullable(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id
			const { communityId, membershipTierId } = input

			const existing = await ctx.prisma.communityMembership.findUnique({
				where: {
					userId_communityId: { userId, communityId },
				},
			})

			if (existing) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'ALREADY_MEMBER',
				})
			}

			const _membership = await ctx.prisma.communityMembership.create({
				data: {
					communityId,
					userId,
					membershipTierId: membershipTierId ?? undefined,
					role: MembershipRole.MEMBER,
				},
			})
			const community = await ctx.prisma.community.findUnique({
				where: { id: communityId },
				select: { slug: true },
			})
			if (community) {
				revalidateTag(Tags.Get(community.slug))
			}

			return { success: true }
		}),
})
