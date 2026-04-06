import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import {
	userHoverCardSelect,
	userProfileCoreInclude,
	userProfileEnhancedInclude,
	userPublicProfileInclude,
} from './includes'

export const userProfileRouter = createTRPCRouter({
	core: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.session?.user) {
			return null
		}
		return ctx.prisma.user.findUnique({
			where: { id: ctx.session.user.id },
			include: userProfileCoreInclude,
		})
	}),
	enhanced: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.session?.user) {
			return null
		}
		return ctx.prisma.user.findUnique({
			where: { id: ctx.session.user.id },
			include: userProfileEnhancedInclude,
		})
	}),
	byUsername: publicProcedure
		.input(z.object({ username: z.string() }))
		.query(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.findUnique({
				where: { username: input.username },
				include: userPublicProfileInclude,
			})
			if (!user) {
				throw TRPCErrors.userNotFound()
			}
			return user
		}),
	hoverCard: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.findUnique({
				where: { id: input.userId },
				select: userHoverCardSelect,
			})
			if (!user) {
				throw TRPCErrors.userNotFound()
			}
			return user
		}),
	findByEmail: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.query(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.findUnique({
				where: { email: input.email },
				select: {
					id: true,
					email: true,
					name: true,
					createdAt: true,
					password: true,
					image: true,
				},
			})
			if (!user) {
				throw TRPCErrors.userNotFound()
			}
			return user
		}),
})
