import { TRPCError } from '@trpc/server'
import z from 'zod'
import { listLocations } from '@/server/queries'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const locationRouter = createTRPCRouter({
	// Get all locations with both continent and country groupings
	list: publicProcedure.query(async () => listLocations()),

	// Get a single location by its unique ID
	byId: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const location = await ctx.prisma.location.findUnique({
				where: { id: input.id },
			})

			if (!location) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Location not found',
				})
			}

			return location
		}),

	// Get the first available location as a system-wide default
	getDefault: publicProcedure.query(async ({ ctx }) => {
		const location = await ctx.prisma.location.findFirst({
			where: {
				events: {
					some: {
						isPublished: true,
						deletedAt: null,
					},
				},
			},
			orderBy: {
				name: 'asc',
			},
		})

		if (!location) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'No default location available',
			})
		}
		return location
	}),

	get: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const location = await ctx.prisma.location.findUnique({
				where: {
					slug: input.slug,
					events: { some: { isPublished: true, deletedAt: null } },
				},
				include: {
					events: true,
				},
			})

			if (!location) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Location not found',
				})
			}

			return location
		}),
})
