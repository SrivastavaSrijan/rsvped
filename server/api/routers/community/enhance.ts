import type { MembershipRole } from '@prisma/client'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

export const communityEnhanceRouter = createTRPCRouter({
	byIds: publicProcedure
		.input(z.object({ ids: z.array(z.string()).min(1) }))
		.query(async ({ ctx, input }) => {
			const ids = input.ids
			const user = ctx.session?.user
			const communities = await ctx.prisma.community.findMany({
				where: { id: { in: ids } },
				select: {
					id: true,
					name: true,
					slug: true,
					description: true,
					coverImage: true,
					_count: true,
					events: {
						take: 2,
						where: { isPublished: true, deletedAt: null },
						orderBy: { startDate: 'desc' },
						select: {
							id: true,
							title: true,
							slug: true,
							startDate: true,
							endDate: true,
						},
					},
				},
			})

			let withMeta = communities.map((c) => ({
				...c,
				metadata: { role: null as MembershipRole | null },
			}))
			if (user?.id) {
				const memberships = await ctx.prisma.communityMembership.findMany({
					where: { userId: user.id, communityId: { in: ids } },
					select: { communityId: true, role: true },
				})
				const roleMap = new Map(memberships.map((m) => [m.communityId, m.role]))
				withMeta = communities.map((c) => ({
					...c,
					metadata: { role: roleMap.get(c.id) ?? null },
				}))
			}

			const order = new Map(ids.map((id, i) => [id, i]))
			withMeta.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
			return withMeta
		}),
})
