import { MembershipRole } from '@prisma/client'
import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
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
				throw TRPCErrors.alreadyMember()
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
