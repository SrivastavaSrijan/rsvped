import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth/password'
import { TRPCErrors } from '@/server/api/shared/errors'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

export const userAuthRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				name: z.string().min(2),
				password: z.string().min(4),
				image: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const existingUser = await ctx.prisma.user.findUnique({
				where: { email: input.email },
			})
			if (existingUser) {
				throw TRPCErrors.userAlreadyExists()
			}
			const hashedPassword = await hashPassword(input.password)
			const createData: Prisma.UserCreateInput = {
				email: input.email,
				name: input.name,
				password: hashedPassword,
				image: input.image || null,
			}
			return ctx.prisma.user.create({
				data: createData,
				select: {
					id: true,
					email: true,
					name: true,
					createdAt: true,
				},
			})
		}),
})
