import type { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { hashPassword } from '@/lib/utils'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

export const userRouter = createTRPCRouter({
	findByEmail: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
			})
		)
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
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found',
				})
			}

			return user
		}),

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
			// Check if user already exists
			const existingUser = await ctx.prisma.user.findUnique({
				where: { email: input.email },
			})

			if (existingUser) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'User already exists',
				})
			}

			// Hash password
			const hashedPassword = await hashPassword(input.password)

			// Use Prisma.UserCreateInput for type safety
			const createData: Prisma.UserCreateInput = {
				email: input.email,
				name: input.name,
				password: hashedPassword,
				image: input.image || null, // Allow image to be optional
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
