import { MembershipRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { cacheLife, cacheTag } from 'next/cache'
import z from 'zod'
import { auth } from '@/lib/auth'
import { CacheTags } from '@/lib/config'
import { prisma } from '@/lib/prisma'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

async function listNearbyCommunities({
	locationId,
	take,
}: {
	locationId: string
	take: number
}) {
	'use cache'
	cacheTag(CacheTags.Community.Nearby(locationId))
	cacheLife('minutes')
	const session = await auth()
	const communities = await prisma.community.findMany({
		take,
		orderBy: { events: { _count: 'desc' } },
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
					OR: [{ locationId }, { locationType: { in: ['ONLINE', 'HYBRID'] } }],
				},
			},
		},
	})
	const communityIds = communities.map((c) => c.id)
	const userCommunities = session?.user
		? await prisma.communityMembership.findMany({
				where: { userId: session.user.id, communityId: { in: communityIds } },
				select: { communityId: true, role: true },
			})
		: []
	return communities.map((community) => {
		const membership = userCommunities.find(
			(m) => m.communityId === community.id
		)
		return { ...community, metadata: { role: membership?.role ?? null } }
	})
}

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
