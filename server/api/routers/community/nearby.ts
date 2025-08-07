import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure } from '@/server/api/trpc'

export const communityNearbyRouter = publicProcedure
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
	})
