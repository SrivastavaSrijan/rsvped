import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

// Create input schema for RSVP creation
const CreateRsvpInput = z.object({
	eventId: z.string(),
	name: z.string().min(1),
	email: z.string().email(),
	ticketTierId: z.string(),
})

export const rsvpRouter = createTRPCRouter({
	create: publicProcedure
		.input(CreateRsvpInput)
		.mutation(async ({ ctx, input }) => {
			// Check if RSVP already exists
			const existingRsvp = await ctx.prisma.rsvp.findFirst({
				where: {
					eventId: input.eventId,
					email: input.email,
				},
			})

			if (existingRsvp) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'ALREADY_REGISTERED',
				})
			}

			// Check event capacity
			const event = await ctx.prisma.event.findUnique({
				where: { id: input.eventId },
				include: {
					_count: {
						select: { rsvps: true },
					},
				},
			})

			if (!event) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'EVENT_NOT_FOUND',
				})
			}

			if (event.capacity && event._count.rsvps >= event.capacity) {
				throw new TRPCError({
					code: 'PRECONDITION_FAILED',
					message: 'EVENT_FULL',
				})
			}

			// transaction to update RSVP count and create RSVP
			return ctx.prisma.$transaction([
				ctx.prisma.event.update({
					where: { id: input.eventId },
					data: {
						rsvpCount: {
							increment: 1,
						},
					},
				}),
				ctx.prisma.rsvp.create({
					data: {
						eventId: input.eventId,
						name: input.name,
						email: input.email,
						ticketTierId: input.ticketTierId,
					},
					include: {
						event: {
							select: {
								title: true,
								startDate: true,
							},
						},
						ticketTier: {
							select: {
								name: true,
								priceCents: true,
							},
						},
					},
				}),
			])
		}),

	getByEmail: publicProcedure
		.input(
			z.object({
				email: z.email(),
			})
		)
		.query(async ({ ctx, input }) => {
			return ctx.prisma.rsvp.findMany({
				where: { email: input.email },
				include: {
					event: {
						select: {
							id: true,
							title: true,
							startDate: true,
							slug: true,
						},
					},
					ticketTier: {
						select: {
							name: true,
							priceCents: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			})
		}),
})
