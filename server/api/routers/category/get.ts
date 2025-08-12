import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { categoryEnhancedInclude } from './includes'

export const categoryGetRouter = createTRPCRouter({
	core: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const category = await ctx.prisma.category.findUnique({
				where: { slug: input.slug },
				select: { id: true, name: true, slug: true },
			})
			if (!category) {
				throw TRPCErrors.categoryNotFound()
			}
			return category
		}),
	enhanced: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const category = await ctx.prisma.category.findUnique({
				where: { slug: input.slug },
				include: categoryEnhancedInclude,
			})
			if (!category) {
				throw TRPCErrors.categoryNotFound()
			}
			return category
		}),
})
