import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth/password'
import { TRPCErrors } from '@/server/api/shared/errors'
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from '@/server/api/trpc'

export const userRouter = createTRPCRouter({
	getCurrentUser: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.session?.user) {
			return null
		}
		const userId = ctx.session.user.id
		const user = ctx.prisma.user.findUnique({
			where: { id: userId },
			include: { location: true },
		})

		if (!user) {
			throw TRPCErrors.userNotFound()
		}
		return user
	}),
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
				throw TRPCErrors.userNotFound()
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
				throw TRPCErrors.userAlreadyExists()
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

			const user = await ctx.prisma.user.create({
				data: createData,
				select: {
					id: true,
					email: true,
					name: true,
					createdAt: true,
				},
			})
			return user
		}),

	updateLocation: protectedProcedure
		.input(
			z.object({
				locationId: z.string().min(1, 'Location is required'),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.update({
				where: { id: ctx.session.user.id },
				data: { locationId: input.locationId },
				include: {
					location: true,
				},
			})
			return user
		}),
})
