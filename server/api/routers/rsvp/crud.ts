import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { rsvpEnhancedInclude } from './includes'

const CreateRsvpInput = z.object({
	eventId: z.string(),
	name: z.string().min(1),
	email: z.string().email(),
	ticketTierId: z.string(),
})

export const rsvpCrudRouter = createTRPCRouter({
	create: publicProcedure
		.input(CreateRsvpInput)
		.mutation(async ({ ctx, input }) => {
			const existingRsvp = await ctx.prisma.rsvp.findFirst({
				where: { eventId: input.eventId, email: input.email },
			})
			if (existingRsvp) {
				throw TRPCErrors.alreadyRegistered()
			}
			const event = await ctx.prisma.event.findUnique({
				where: { id: input.eventId },
				select: { capacity: true, _count: { select: { rsvps: true } } },
			})
			if (!event) {
				throw TRPCErrors.eventNotFound()
			}
			if (event.capacity && event._count.rsvps >= event.capacity) {
				throw TRPCErrors.eventFull()
			}
			return ctx.prisma.rsvp.create({
				data: {
					eventId: input.eventId,
					name: input.name,
					email: input.email,
					ticketTierId: input.ticketTierId,
				},
				include: rsvpEnhancedInclude,
			})
		}),
})
