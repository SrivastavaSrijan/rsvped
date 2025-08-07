import { MembershipRole, type Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

const GetCommunitiesInput = z.object({
	sort: z.enum(['asc', 'desc']).optional().default('asc'),
	page: z.number().int().min(1).default(1),
	size: z.number().int().min(1).max(100).default(5),
	roles: z.array(z.nativeEnum(MembershipRole)).optional(),
	invert: z.boolean().optional().default(false),
	where: z
		.object({
			isPublic: z.boolean().optional().default(true),
		})
		.partial()
		.optional()
		.default({ isPublic: true }),
})

// Base procedure for community list operations
const communityListBaseProcedure = protectedProcedure
	.input(GetCommunitiesInput)
	.use(async ({ ctx, input, next }) => {
		const { sort, page, size, roles, where, invert } = input
		const user = ctx.session?.user
		if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' })

		// Build role filter for communities
		let roleFilter: Prisma.CommunityWhereInput | undefined
		if (roles && roles.length > 0) {
			roleFilter = {
				members: {
					some: {
						userId: user.id,
						role: {
							[invert ? 'notIn' : 'in']: roles,
						},
					},
				},
			}
		}

		// Build the base query arguments
		const args = {
			skip: (page - 1) * size,
			take: size,
			orderBy: {
				name: sort,
			},
			where: {
				...where,
				...(roleFilter && roleFilter),
			},
		}

		return next({
			ctx: {
				...ctx,
				user,
				args,
			},
		})
	})

// Core community select for fast loading
const communityCoreSelect = {
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

// Enhanced community select for full data
const communityEnhancedSelect = {
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
			startDate: 'asc',
		},
	},
} satisfies Prisma.CommunitySelect

export const communityRouter = createTRPCRouter({
	list: createTRPCRouter({
		core: communityListBaseProcedure.query(async ({ ctx }) => {
			const { user, args } = ctx

			const communities = await ctx.prisma.community.findMany({
				...args,
				select: communityCoreSelect,
			})

			// Get user memberships for these communities
			const communityIds = communities.map(({ id }) => id)
			const userMemberships = await ctx.prisma.communityMembership.findMany({
				where: {
					userId: user.id,
					communityId: { in: communityIds },
				},
				select: {
					communityId: true,
					role: true,
				},
			})

			// Create membership lookup map
			const membershipMap = new Map(
				userMemberships.map(({ communityId, role }) => [communityId, role])
			)

			// Return core data with metadata
			return communities.map((community) => ({
				...community,
				metadata: {
					role: membershipMap.get(community.id) ?? null,
				},
			}))
		}),

		enhanced: communityListBaseProcedure.query(async ({ ctx }) => {
			const { user, args } = ctx

			const communities = await ctx.prisma.community.findMany({
				...args,
				select: communityEnhancedSelect,
			})

			// Get user memberships for these communities
			const communityIds = communities.map(({ id }) => id)
			const userMemberships = await ctx.prisma.communityMembership.findMany({
				where: {
					userId: user.id,
					communityId: { in: communityIds },
				},
				select: {
					communityId: true,
					role: true,
				},
			})

			// Create membership lookup map
			const membershipMap = new Map(
				userMemberships.map(({ communityId, role }) => [communityId, role])
			)

			// Return enhanced data with metadata
			return communities.map((community) => ({
				...community,
				metadata: {
					role: membershipMap.get(community.id) ?? null,
				},
			}))
		}),
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
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'locationId is required',
				})
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
					id: true,
					name: true,
					slug: true,
					description: true,
					coverImage: true,
					_count: true,
				},
				where: {
					events: {
						some: {
							deletedAt: null,
							isPublished: true,
							OR: [
								{ locationId },
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

			if (!user) {
				return communities.map((community) => ({
					...community,
					metadata: { role: null },
				}))
			}

			const communityIds = communities.map(({ id }) => id)
			const userMemberships = await ctx.prisma.communityMembership.findMany({
				where: {
					userId: user.id,
					communityId: { in: communityIds },
				},
				select: {
					communityId: true,
					role: true,
				},
			})

			const membershipMap = new Map(
				userMemberships.map(({ communityId, role }) => [communityId, role])
			)

			return communities.map((community) => ({
				...community,
				metadata: {
					role: membershipMap.get(community.id) ?? null,
				},
			}))
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

			let userRole = null
			if (user) {
				const membership = await ctx.prisma.communityMembership.findFirst({
					where: {
						userId: user.id,
						communityId: community.id,
					},
					select: { role: true },
				})
				userRole = membership?.role ?? null
			}

			return {
				...community,
				metadata: { role: userRole },
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

			const existingMembership =
				await ctx.prisma.communityMembership.findUnique({
					where: {
						userId_communityId: { userId, communityId },
					},
				})

			if (existingMembership) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Already a member of this community',
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
