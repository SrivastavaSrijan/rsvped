import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from '@/server/api/trpc'
import {
	eventCoreInclude,
	eventEditInclude,
	eventEnhancedInclude,
} from './includes'

const GetEventInput = z.object({ slug: z.string() })

export const eventGetRouter = createTRPCRouter({
	metadata: publicProcedure
		.input(GetEventInput)
		.query(async ({ ctx, input }) => {
			const event = await ctx.prisma.event.findUnique({
				where: { slug: input.slug, deletedAt: null },
				select: {
					title: true,
					startDate: true,
					endDate: true,
				},
			})
			if (!event) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
			}
			return event
		}),

	core: publicProcedure.input(GetEventInput).query(async ({ ctx, input }) => {
		const event = await ctx.prisma.event.findUnique({
			where: { slug: input.slug, deletedAt: null },
			include: eventCoreInclude,
		})
		if (!event) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
		}
		return event
	}),

	enhanced: publicProcedure
		.input(GetEventInput)
		.query(async ({ ctx, input }) => {
			const event = await ctx.prisma.event.findUnique({
				where: { slug: input.slug, deletedAt: null },
				include: eventEnhancedInclude,
			})
			if (!event) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
			}

			const user = ctx.session?.user
			let metadata = null

			if (user?.id && user?.email) {
				const isHost = event.host.id === user.id
				const isCollaborator = event.eventCollaborators.some(
					(c) => c.user.id === user.id
				)

				const userRsvp = await ctx.prisma.rsvp.findFirst({
					where: { eventId: event.id, email: user.email },
					include: { ticketTier: true, user: true },
				})

				metadata = {
					user: {
						id: user.id,
						name: user.name,
						image: user.image,
						email: user.email,
						rsvp: userRsvp,
						access: { manager: isHost || isCollaborator },
					},
				}
			}

			return { ...event, metadata }
		}),

	edit: protectedProcedure
		.input(GetEventInput)
		.query(async ({ ctx, input }) => {
			const user = ctx.session?.user
			if (!user) {
				throw new TRPCError({ code: 'UNAUTHORIZED' })
			}
			const event = await ctx.prisma.event.findUnique({
				where: { slug: input.slug, deletedAt: null },
				include: {
					...eventEditInclude,
					eventCollaborators: {
						where: { userId: user.id },
					},
				},
			})
			if (!event) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
			}
			const isHost = event.host.id === user.id
			const isCollaborator = event.eventCollaborators.length > 0
			if (!isHost && !isCollaborator) {
				throw new TRPCError({ code: 'FORBIDDEN' })
			}
			return event
		}),

	analytics: protectedProcedure
		.input(GetEventInput)
		.query(async ({ ctx, input }) => {
			const event = await ctx.prisma.event.findUnique({
				where: { slug: input.slug, deletedAt: null },
				select: {
					id: true,
					title: true,
					rsvpCount: true,
					viewCount: true,
					checkInCount: true,
					paidRsvpCount: true,
				},
			})
			if (!event) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
			}
			return event
		}),

	register: protectedProcedure
		.input(GetEventInput)
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'You must be logged in to register for an event',
				})
			}
			const event = await ctx.prisma.event.findUnique({
				where: { slug: input.slug, deletedAt: null },
				include: {
					ticketTiers: true,
				},
			})
			const userRsvp = await ctx.prisma.rsvp.findFirst({
				where: { eventId: event?.id, userId: ctx.session.user.id },
			})
			if (!event) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
			}
			return {
				...event,
				metadata: {
					user: { ...ctx.session.user, rsvp: userRsvp ?? null },
				},
			}
		}),
})
