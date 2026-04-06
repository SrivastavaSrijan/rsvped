import { z } from 'zod'
import {
	paginatedProcedure,
	protectedPaginatedProcedure,
} from '@/server/api/shared/middleware'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

const activityInclude = {
	user: {
		select: {
			id: true,
			name: true,
			username: true,
			image: true,
		},
	},
} as const

export const activityRouter = createTRPCRouter({
	forUser: paginatedProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const [activities, total] = await Promise.all([
				ctx.prisma.userActivity.findMany({
					where: { userId: input.userId },
					include: activityInclude,
					orderBy: { createdAt: 'desc' },
					skip: ctx.pagination.skip,
					take: ctx.pagination.take,
				}),
				ctx.prisma.userActivity.count({
					where: { userId: input.userId },
				}),
			])

			return {
				data: activities,
				pagination: ctx.pagination.createMetadata(total),
			}
		}),

	feed: protectedPaginatedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id

		// Get friend IDs
		const friendships = await ctx.prisma.friendship.findMany({
			where: {
				status: 'ACCEPTED',
				OR: [{ userId }, { friendId: userId }],
			},
			select: { userId: true, friendId: true },
		})

		const friendIds = friendships.map((f) =>
			f.userId === userId ? f.friendId : f.userId
		)

		if (friendIds.length === 0) {
			return {
				data: [],
				pagination: ctx.pagination.createMetadata(0),
			}
		}

		const [activities, total] = await Promise.all([
			ctx.prisma.userActivity.findMany({
				where: { userId: { in: friendIds } },
				include: activityInclude,
				orderBy: { createdAt: 'desc' },
				skip: ctx.pagination.skip,
				take: ctx.pagination.take,
			}),
			ctx.prisma.userActivity.count({
				where: { userId: { in: friendIds } },
			}),
		])

		return {
			data: activities,
			pagination: ctx.pagination.createMetadata(total),
		}
	}),

	forUserHoverCard: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.prisma.userActivity.findMany({
				where: { userId: input.userId },
				orderBy: { createdAt: 'desc' },
				take: 3,
			})
		}),
})
