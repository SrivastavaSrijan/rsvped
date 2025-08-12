import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const userPreferencesRouter = createTRPCRouter({
	updateLocation: protectedProcedure
		.input(z.object({ locationId: z.string().min(1, 'Location is required') }))
		.mutation(async ({ ctx, input }) =>
			ctx.prisma.user.update({
				where: { id: ctx.session.user.id },
				data: { locationId: input.locationId },
				include: { location: true },
			})
		),
})
