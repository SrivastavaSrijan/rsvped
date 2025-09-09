import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { publicProcedure } from '@/server/api/trpc'
import { enhanceCommunities } from './enhancement'

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
			throw TRPCErrors.locationRequired()
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
				isPublic: true,
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

		// Use shared enhancement logic
		return enhanceCommunities(communities, user.id, ctx.prisma)
	})
