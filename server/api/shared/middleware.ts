import { protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { PaginationSchema } from './schemas'

export const paginatedProcedure = publicProcedure
	.input(PaginationSchema)
	.use(async ({ input, next }) => {
		const { page, size } = input
		return next({
			ctx: {
				pagination: {
					skip: (page - 1) * size,
					take: size,
				},
			},
		})
	})

export const protectedPaginatedProcedure = protectedProcedure
	.input(PaginationSchema)
	.use(async ({ input, next }) => {
		const { page, size } = input
		return next({
			ctx: {
				pagination: {
					skip: (page - 1) * size,
					take: size,
				},
			},
		})
	})
