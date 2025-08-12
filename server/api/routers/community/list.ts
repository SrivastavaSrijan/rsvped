import { MembershipRole, type Prisma } from '@prisma/client'
import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { protectedPaginatedProcedure } from '@/server/api/shared/middleware'
import { createTRPCRouter } from '@/server/api/trpc'
import {
	MembershipRoleOwner,
	type PaginatedResponse,
	SortDirection,
} from '../../shared/types'

const GetCommunitiesInput = z.object({
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
	where: z
		.object({
			isPublic: z.boolean().optional().default(true),
		})
		.partial()
		.optional()
		.default({ isPublic: true }),
})

const communityListBaseProcedure = protectedPaginatedProcedure
	.input(GetCommunitiesInput)
	.use(async ({ ctx, input, next }) => {
		const { sort, include, exclude, where } = input
		const user = ctx.session?.user
		if (!user) throw TRPCErrors.unauthorized()

		// Get pagination from middleware
		const { skip, take } = ctx.pagination

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
			skip,
			take,
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

		// Get both data and count in parallel
		const [communities, total] = await Promise.all([
			ctx.prisma.community.findMany({
				...args,
				select: communityCoreSelect,
			}),
			ctx.prisma.community.count({ where: args.where }),
		])

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

		const data = communities.map((community) => ({
			...community,
			metadata: {
				role: membershipMap.get(community.id) ?? null,
			},
		}))

		return {
			data,
			pagination: ctx.pagination.createMetadata(total),
		} satisfies PaginatedResponse<(typeof data)[number]>
	}),

	enhanced: communityListBaseProcedure.query(async ({ ctx }) => {
		const { user, args } = ctx

		// Get both data and count in parallel
		const [communities, total] = await Promise.all([
			ctx.prisma.community.findMany({
				...args,
				select: communityEnhancedSelect,
			}),
			ctx.prisma.community.count({ where: args.where }),
		])

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

		const data = communities.map((community) => ({
			...community,
			metadata: {
				role: membershipMap.get(community.id) ?? null,
			},
		}))

		return {
			data,
			pagination: ctx.pagination.createMetadata(total),
		} satisfies PaginatedResponse<(typeof data)[number]>
	}),
})
