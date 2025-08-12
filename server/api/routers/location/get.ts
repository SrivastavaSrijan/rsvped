import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { locationCoreInclude, locationEnhancedInclude } from './includes'

const GetLocationInput = z.object({ slug: z.string() })
const GetLocationByIdInput = z.object({ id: z.string() })

export const locationGetRouter = createTRPCRouter({
	metadata: publicProcedure
		.input(GetLocationInput)
		.query(async ({ ctx, input }) => {
			const location = await ctx.prisma.location.findUnique({
				where: { slug: input.slug },
				select: {
					name: true,
					slug: true,
					country: true,
					continent: true,
					timezone: true,
				},
			})
			if (!location) {
				throw TRPCErrors.locationNotFound()
			}
			return location
		}),
	core: publicProcedure
		.input(GetLocationInput)
		.query(async ({ ctx, input }) => {
			const location = await ctx.prisma.location.findUnique({
				where: { slug: input.slug },
				include: locationCoreInclude,
			})
			if (!location) {
				throw TRPCErrors.locationNotFound()
			}
			return location
		}),
	enhanced: publicProcedure
		.input(GetLocationInput)
		.query(async ({ ctx, input }) => {
			const location = await ctx.prisma.location.findUnique({
				where: { slug: input.slug },
				include: locationEnhancedInclude,
			})
			if (!location) {
				throw TRPCErrors.locationNotFound()
			}
			return location
		}),
	byId: publicProcedure
		.input(GetLocationByIdInput)
		.query(async ({ ctx, input }) => {
			const location = await ctx.prisma.location.findUnique({
				where: { id: input.id },
			})
			if (!location) {
				throw TRPCErrors.locationNotFound()
			}
			return location
		}),
	default: publicProcedure.query(async ({ ctx }) => {
		const location = await ctx.prisma.location.findFirst({
			where: {
				events: {
					some: { isPublished: true, deletedAt: null },
				},
			},
			orderBy: { name: 'asc' },
		})
		if (!location) {
			throw TRPCErrors.locationNotFound()
		}
		return location
	}),
})
