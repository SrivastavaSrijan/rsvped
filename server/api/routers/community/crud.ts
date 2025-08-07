import { MembershipRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const communityCrudRouter = createTRPCRouter({
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

			const existingMembership =
				await ctx.prisma.communityMembership.findUnique({
					where: {
						userId_communityId: { userId, communityId },
					},
				})

			if (existingMembership) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Already a member of this community',
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
