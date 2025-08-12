import { protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { PaginationSchema } from './schemas'
import type { PaginationMetadata } from './types'

// Helper function for creating pagination metadata
const createPaginationMetadata = (
	page: number,
	size: number,
	total: number
): PaginationMetadata => {
	const totalPages = Math.ceil(total / size)
	return {
		page,
		size,
		total,
		totalPages,
		hasMore: page < totalPages,
		hasPrevious: page > 1,
	}
}

export const paginatedProcedure = publicProcedure
	.input(PaginationSchema)
	.use(async ({ input, next }) => {
		const { page, size } = input
		return next({
			ctx: {
				pagination: {
					page,
					size,
					skip: (page - 1) * size,
					take: size,
					createMetadata: (total: number) =>
						createPaginationMetadata(page, size, total),
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
					page,
					size,
					skip: (page - 1) * size,
					take: size,
					createMetadata: (total: number) =>
						createPaginationMetadata(page, size, total),
				},
			},
		})
	})

export const hostOnlyProcedure = protectedProcedure.use(async ({ next }) =>
	next()
)

export const analyticsMiddleware = protectedProcedure.use(async ({ next }) =>
	next()
)

export const rateLimitedProcedure = publicProcedure.use(async ({ next }) =>
	next()
)
