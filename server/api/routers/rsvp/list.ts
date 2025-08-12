import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { rsvpCoreInclude, rsvpEnhancedInclude } from './includes'

export const rsvpListRouter = createTRPCRouter({
	core: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.query(({ ctx, input }) =>
			ctx.prisma.rsvp.findMany({
				where: { email: input.email },
				include: rsvpCoreInclude,
				orderBy: { createdAt: 'desc' },
			})
		),
	enhanced: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.query(({ ctx, input }) =>
			ctx.prisma.rsvp.findMany({
				where: { email: input.email },
				include: rsvpEnhancedInclude,
				orderBy: { createdAt: 'desc' },
			})
		),
})
