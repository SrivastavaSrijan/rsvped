import { MembershipRole, type Prisma } from '@prisma/client'
import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { PaginationSchema } from '@/server/api/shared/schemas'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

const GetCommunitiesInput = z
	.object({
		sort: z.enum(['asc', 'desc']).optional().default('asc'),
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
	.merge(PaginationSchema)

const communityListBaseProcedure = protectedProcedure
	.input(GetCommunitiesInput)
	.use(async ({ ctx, input, next }) => {
		const { sort, page, size, roles, where, invert } = input
		const user = ctx.session?.user
		if (!user) throw TRPCErrors.unauthorized()

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

export const communityListRouter = createTRPCRouter({
	core: communityListBaseProcedure.query(async ({ ctx }) => {
		const { user, args } = ctx as typeof ctx & {
			user: { id: string }
			args: Parameters<typeof ctx.prisma.community.findMany>[0]
		}

		const communities = await ctx.prisma.community.findMany({
			...args,
			select: communityCoreSelect,
		})

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

	enhanced: communityListBaseProcedure.query(async ({ ctx }) => {
		const { user, args } = ctx as typeof ctx & {
			user: { id: string }
			args: Parameters<typeof ctx.prisma.community.findMany>[0]
		}

		const communities = await ctx.prisma.community.findMany({
			...args,
			select: communityEnhancedSelect,
		})

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
})
