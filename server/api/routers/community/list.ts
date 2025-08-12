import { MembershipRole, type Prisma } from '@prisma/client'
import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { PaginationSchema } from '@/server/api/shared/schemas'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { MembershipRoleOwner, SortDirection } from '../../shared/types'

const GetCommunitiesInput = z
	.object({
		sort: z.enum(SortDirection).optional().default(SortDirection.ASC),
		before: z.string().optional(),
		after: z.string().optional(),
		include: z
			.array(
				z.union([z.enum(MembershipRole), z.literal(MembershipRoleOwner.OWNER)])
			)
			.optional(),
		exclude: z
			.array(
				z.union([z.enum(MembershipRole), z.literal(MembershipRoleOwner.OWNER)])
			)
			.optional(),
		page: z.number().int().min(1).optional().default(1),
		size: z.number().int().min(1).max(100).optional().default(10),
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
		const { sort, page, size, include, exclude, where } = input
		const user = ctx.session?.user
		if (!user) throw TRPCErrors.unauthorized()

		let roleFilter: Prisma.CommunityWhereInput | undefined

		// Handle include logic
		if (include && include.length > 0) {
			const isOwnerIncluded = include.includes(MembershipRoleOwner.OWNER)
			const membershipRoles = include.filter(
				(role) => role !== MembershipRoleOwner.OWNER
			)

			const conditions: Prisma.CommunityWhereInput[] = []

			if (isOwnerIncluded) {
				conditions.push({ ownerId: user.id })
			}

			if (membershipRoles.length > 0) {
				conditions.push({
					members: {
						some: {
							userId: user.id,
							role: { in: membershipRoles },
						},
					},
				})
			}

			if (conditions.length > 0) {
				roleFilter = { OR: conditions }
			}
		}

		// Handle exclude logic
		if (exclude && exclude.length > 0) {
			const isOwnerExcluded = exclude.includes(MembershipRoleOwner.OWNER)
			const membershipRoles = exclude.filter(
				(role) => role !== MembershipRoleOwner.OWNER
			)

			const conditions: Prisma.CommunityWhereInput[] = []

			if (isOwnerExcluded) {
				conditions.push({ ownerId: { not: user.id } })
			}

			if (membershipRoles.length > 0) {
				conditions.push({
					members: {
						none: {
							userId: user.id,
							role: { in: membershipRoles },
						},
					},
				})
			}

			if (conditions.length > 0) {
				roleFilter = roleFilter
					? { AND: [roleFilter, ...conditions] }
					: { AND: conditions }
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
		} satisfies Prisma.CommunityFindManyArgs

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
			startDate: SortDirection.DESC,
		},
	},
} satisfies Prisma.CommunitySelect

export const communityListRouter = createTRPCRouter({
	core: communityListBaseProcedure.query(async ({ ctx }) => {
		const { user, args } = ctx

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
		const { user, args } = ctx

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
