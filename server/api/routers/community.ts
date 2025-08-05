import { MembershipRole, type Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

const GetCommunitiesInput = z.object({
	sort: z.enum(['asc', 'desc']).optional().default('asc'),

	page: z.number().int().min(1).default(1),
	size: z.number().int().min(1).max(100).default(5),
	roles: z.array(z.enum(MembershipRole)).optional(),
	where: z
		.object({
			isPublic: z.boolean().optional().default(true),
		})
		.partial()
		.optional()
		.default({ isPublic: true }),
})
export const communityRouter = createTRPCRouter({
	list: protectedProcedure
		.input(GetCommunitiesInput)
		.query(async ({ ctx, input }) => {
			const { sort, page, size, roles, where } = input
			const user = ctx.session?.user
			if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' })
			const orConditions: Prisma.CommunityWhereInput[] = []
			if (roles && roles.length > 0) {
				orConditions.push({
					members: {
						some: {
							userId: user.id,
							role: {
								in: roles,
							},
						},
					},
				})
			}

			const communities = await ctx.prisma.community.findMany({
				skip: (page - 1) * size,
				take: size,
				orderBy: {
					name: sort,
				},
				select: {
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
					members: {
						select: {
							role: true,
						},
					},
					events: {
						take: 1,
						where: {
							deletedAt: null,
							isPublished: true,
						},
						orderBy: {
							startDate: 'asc',
						},
					},
				},
				where: {
					...where,
					OR: [
						{
							events: {
								some: {
									deletedAt: null,
									isPublished: true,
								},
							},
						},
						...orConditions,
					],
				},
			})
			const communitiesWithMembership = communities.map((community) => {
				const membership = community.members[0]?.role ?? null
				return {
					...community,
					metadata: {
						role: membership,
					},
				}
			})
			return communitiesWithMembership
		}),
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
								{
									locationType: {
										in: ['ONLINE', 'HYBRID'],
									},
								},
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

	get: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const { slug } = input
			const user = ctx.session?.user
			const community = await ctx.prisma.community.findUnique({
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
			})

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

			const membership = await ctx.prisma.communityMembership.create({
				data: {
					communityId,
					userId,
					membershipTierId: membershipTierId ?? undefined,
					role: MembershipRole.MEMBER,
				},
			})

			return { success: true, data: membership }
		}),
})
