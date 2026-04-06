import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { friendshipUserSelect } from '@/server/api/routers/user/includes'
import { paginatedProcedure } from '@/server/api/shared/middleware'
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from '@/server/api/trpc'

export const friendshipRouter = createTRPCRouter({
	send: protectedProcedure
		.input(z.object({ targetUserId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id
			if (userId === input.targetUserId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Cannot send a friend request to yourself',
				})
			}

			// Check if friendship already exists in either direction
			const existing = await ctx.prisma.friendship.findFirst({
				where: {
					OR: [
						{ userId, friendId: input.targetUserId },
						{ userId: input.targetUserId, friendId: userId },
					],
				},
			})
			if (existing) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Friend request already exists',
				})
			}

			const friendship = await ctx.prisma.friendship.create({
				data: {
					userId,
					friendId: input.targetUserId,
				},
			})

			await ctx.prisma.userActivity.create({
				data: {
					userId,
					type: 'SEND_FRIEND_REQUEST',
					targetId: input.targetUserId,
					targetType: 'user',
				},
			})

			return friendship
		}),

	respond: protectedProcedure
		.input(
			z.object({
				friendshipId: z.string(),
				action: z.enum(['accept', 'reject']),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const friendship = await ctx.prisma.friendship.findUnique({
				where: { id: input.friendshipId },
			})
			if (!friendship || friendship.friendId !== ctx.session.user.id) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Friend request not found',
				})
			}
			if (friendship.status !== 'PENDING') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Friend request is not pending',
				})
			}

			if (input.action === 'reject') {
				await ctx.prisma.friendship.delete({
					where: { id: input.friendshipId },
				})
				return { status: 'rejected' as const }
			}

			const updated = await ctx.prisma.friendship.update({
				where: { id: input.friendshipId },
				data: { status: 'ACCEPTED', acceptedAt: new Date() },
			})

			await ctx.prisma.userActivity.create({
				data: {
					userId: ctx.session.user.id,
					type: 'ACCEPT_FRIEND_REQUEST',
					targetId: friendship.userId,
					targetType: 'user',
				},
			})

			return { status: 'accepted' as const, friendship: updated }
		}),

	remove: protectedProcedure
		.input(z.object({ friendshipId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const friendship = await ctx.prisma.friendship.findUnique({
				where: { id: input.friendshipId },
			})
			if (!friendship) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Friendship not found',
				})
			}
			const userId = ctx.session.user.id
			if (friendship.userId !== userId && friendship.friendId !== userId) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Not your friendship',
				})
			}
			await ctx.prisma.friendship.delete({
				where: { id: input.friendshipId },
			})
			return { status: 'removed' as const }
		}),

	list: paginatedProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const friendships = await ctx.prisma.friendship.findMany({
				where: {
					status: 'ACCEPTED',
					OR: [{ userId: input.userId }, { friendId: input.userId }],
				},
				include: {
					user: { select: friendshipUserSelect },
					friend: { select: friendshipUserSelect },
				},
				skip: ctx.pagination.skip,
				take: ctx.pagination.take,
				orderBy: { acceptedAt: 'desc' },
			})

			const total = await ctx.prisma.friendship.count({
				where: {
					status: 'ACCEPTED',
					OR: [{ userId: input.userId }, { friendId: input.userId }],
				},
			})

			return {
				data: friendships.map((f) => ({
					id: f.id,
					friend: f.userId === input.userId ? f.friend : f.user,
					acceptedAt: f.acceptedAt,
				})),
				pagination: ctx.pagination.createMetadata(total),
			}
		}),

	requests: protectedProcedure.query(async ({ ctx }) => {
		return ctx.prisma.friendship.findMany({
			where: {
				friendId: ctx.session.user.id,
				status: 'PENDING',
			},
			include: {
				user: { select: friendshipUserSelect },
			},
			orderBy: { createdAt: 'desc' },
		})
	}),

	status: publicProcedure
		.input(z.object({ targetUserId: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user) {
				return { status: 'none' as const, friendshipId: null }
			}
			const userId = ctx.session.user.id
			const friendship = await ctx.prisma.friendship.findFirst({
				where: {
					OR: [
						{ userId, friendId: input.targetUserId },
						{ userId: input.targetUserId, friendId: userId },
					],
				},
			})
			if (!friendship) {
				return { status: 'none' as const, friendshipId: null }
			}
			if (friendship.status === 'ACCEPTED') {
				return {
					status: 'friends' as const,
					friendshipId: friendship.id,
				}
			}
			if (friendship.userId === userId) {
				return {
					status: 'pending_sent' as const,
					friendshipId: friendship.id,
				}
			}
			return {
				status: 'pending_received' as const,
				friendshipId: friendship.id,
			}
		}),
})
