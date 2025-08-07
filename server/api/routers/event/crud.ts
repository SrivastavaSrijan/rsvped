import { EventRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import slugify from 'slugify'
import { z } from 'zod'
import { EventModel } from '@/server/api/routers/zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

const CreateEventInput = EventModel.pick({
	title: true,
	subtitle: true,
	description: true,
	startDate: true,
	endDate: true,
	timezone: true,
	locationType: true,
	venueName: true,
	venueAddress: true,
	onlineUrl: true,
	capacity: true,
	requiresApproval: true,
	coverImage: true,
}).partial({
	subtitle: true,
	description: true,
	venueName: true,
	venueAddress: true,
	onlineUrl: true,
	capacity: true,
	requiresApproval: true,
	coverImage: true,
})

const UpdateEventInput = CreateEventInput.extend({
	slug: z.string(),
})

export const eventCrudRouter = createTRPCRouter({
	create: protectedProcedure
		.input(CreateEventInput)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'You must be logged in to create an event',
				})
			}

			try {
				const slug = slugify(input.title)
				const event = await ctx.prisma.event.create({
					data: {
						title: input.title,
						description: input.description,
						slug,
						startDate: input.startDate,
						endDate: input.endDate,
						timezone: input.timezone,
						locationType: input.locationType,
						venueName: input.venueName,
						venueAddress: input.venueAddress,
						onlineUrl: input.onlineUrl,
						capacity: input.capacity,
						requiresApproval: input.requiresApproval,
						coverImage: input.coverImage,
						hostId: ctx.session.user.id,
						isPublished: false,
					},
					include: {
						host: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				})
				return event
			} catch (error) {
				console.error('Error creating event:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create event',
				})
			}
		}),

	update: protectedProcedure
		.input(UpdateEventInput)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'You must be logged in to update an event',
				})
			}

			const { slug, ...updateData } = input

			try {
				const existingEvent = await ctx.prisma.event.findUnique({
					where: { slug, deletedAt: null },
					select: { id: true, hostId: true, eventCollaborators: true },
				})

				if (!existingEvent) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Event not found',
					})
				}

				if (
					existingEvent.hostId !== ctx.session.user.id &&
					!existingEvent.eventCollaborators.some(
						(c) =>
							c.userId === ctx.session.user.id && c.role === EventRole.CO_HOST
					)
				) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'You are not authorized to update this event',
					})
				}

				const event = await ctx.prisma.event.update({
					where: { id: existingEvent.id },
					data: updateData,
					include: {
						host: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				})
				return event
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error
				}
				console.error('Error updating event:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update event',
				})
			}
		}),
})
