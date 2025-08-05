import { MembershipRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { listNearbyCommunities } from '@/server/queries'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

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
		.query(async ({ input: { take, locationId } }) => {
			if (!locationId) {
				throw new Error('locationId is required')
			}
			return listNearbyCommunities({ locationId, take })
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
