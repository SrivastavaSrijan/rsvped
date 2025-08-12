import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { userProfileCoreInclude, userProfileEnhancedInclude } from './includes'

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
