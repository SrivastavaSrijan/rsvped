import { EventRole, type Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import slugify from 'slugify'
import { z } from 'zod'
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from '@/server/api/trpc'
import { EventModel } from './zod'

// Create input schema from the EventModel, picking only the fields we want for creation
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

// Update input schema includes slug for identification
const UpdateEventInput = CreateEventInput.extend({
	slug: z.string(),
})

const GetEventsInput = z.object({
	sort: z.enum(['asc', 'desc']).default('asc'),
	before: z.string().optional(),
	after: z.string().optional(),
	on: z.string().optional(),
	page: z.number().int().min(1).default(1),
	size: z.number().int().min(1).max(100).default(5),
	roles: z.array(z.enum(EventRole)).optional(),
	where: z
		.object({
			locationId: z.string().optional().nullable(),
			communityId: z.string().optional().nullable(),
			deletedAt: z.date().nullish().default(null),
			isPublished: z.boolean().optional().default(true),
		})
		.partial()
		.optional()
		.default({ isPublished: true, deletedAt: null }),
})

// Core event include for basic relations
const eventCoreInclude = {
	host: {
		select: { id: true, name: true, image: true, email: true },
	},
	location: true,
	_count: {
		select: { rsvps: { where: { status: 'CONFIRMED' } } },
	},
} satisfies Prisma.EventInclude

// Enhanced include for full data (view page) - adds to core include
const eventEnhancedInclude = {
	...eventCoreInclude,
	rsvps: {
		take: 5,
		orderBy: { createdAt: 'desc' },
		where: { status: 'CONFIRMED' },
		select: {
			name: true,
			email: true,
			user: { select: { id: true, name: true, image: true } },
		},
	},
	eventCollaborators: {
		select: {
			role: true,
			user: { select: { id: true, name: true, image: true } },
		},
	},
	categories: { include: { category: true } },
} satisfies Prisma.EventInclude

// Edit-specific include (minimal relations for form population)
const eventEditInclude = {
	host: {
		select: { id: true, name: true },
	},

	location: {
		select: { id: true, name: true },
	},
	categories: {
		select: { categoryId: true },
	},
} satisfies Prisma.EventInclude

// Base procedure for event list operations
const eventListBaseProcedure = protectedProcedure
	.input(GetEventsInput)
	.use(async ({ ctx, input, next }) => {
		const user = ctx.session?.user
		if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' })

		const { roles, page, size, sort, before, after, on } = input

		const orConditions: Prisma.EventWhereInput[] = []
		if (roles?.includes(EventRole.CHECKIN)) {
			orConditions.push({ rsvps: { some: { userId: user.id } } })
		}
		if (
			roles?.includes(EventRole.MANAGER) ||
			roles?.includes(EventRole.CO_HOST)
		) {
			const inRoles: EventRole[] = []
			if (roles?.includes(EventRole.MANAGER)) inRoles.push(EventRole.MANAGER)
			if (roles?.includes(EventRole.CO_HOST)) inRoles.push(EventRole.CO_HOST)
			if (inRoles.length > 0) {
				orConditions.push({
					OR: [
						{ hostId: user.id },
						{
							eventCollaborators: {
								some: { userId: user.id, role: { in: inRoles } },
							},
						},
					],
				})
			}
		}

		const startDate: Prisma.DateTimeFilter | undefined = on
			? (() => {
					const start = new Date(on)
					start.setHours(0, 0, 0, 0)
					const end = new Date(start)
					end.setDate(end.getDate() + 1)
					return { gte: start, lt: end }
				})()
			: before || after
				? {
						...(before && { lt: new Date(before) }),
						...(after && { gt: new Date(after) }),
					}
				: undefined

		const whereClause: Prisma.EventWhereInput = {
			...(orConditions.length && { OR: orConditions }),
			communityId: input?.where?.communityId ?? undefined,
			...(startDate && { startDate }),
		}
		const args = {
			where: whereClause,
			orderBy: { startDate: sort },
			skip: (page - 1) * size,
			take: size,
		} satisfies Prisma.EventFindManyArgs
		return next({
			ctx: {
				...ctx,
				user,
				args,
			},
		})
	})

export const eventRouter = createTRPCRouter({
	// Create a new event (requires authentication)
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
				// Generate unique slug from title
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
						isPublished: false, // Events start as drafts
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

	// Update an existing event (requires authentication and ownership)
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
				// First, check if the event exists and user is the owner
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

	get: createTRPCRouter({
		metadata: publicProcedure
			.input(z.object({ slug: z.string() }))
			.query(async ({ ctx, input }) => {
				const event = await ctx.prisma.event.findUnique({
					where: {
						slug: input.slug,
						deletedAt: null,
					},
					select: {
						title: true,
						startDate: true,
						endDate: true,
					},
				})
				if (!event) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Event not found',
					})
				}

				return event
			}),
		core: publicProcedure
			.input(z.object({ slug: z.string() }))
			.query(async ({ ctx, input }) => {
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
			.input(z.object({ slug: z.string() }))
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
			.input(z.object({ slug: z.string() }))
			.query(async ({ ctx, input }) => {
				// Check edit permissions
				const user = ctx.session?.user
				if (!user) {
					throw new TRPCError({ code: 'UNAUTHORIZED' })
				}
				const event = await ctx.prisma.event.findUnique({
					where: { slug: input.slug, deletedAt: null },
					include: {
						...eventEditInclude,
						eventCollaborators: {
							where: {
								userId: user.id,
							},
						},
					},
				})

				if (!event) {
					throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
				}

				const isHost = event.host.id === user.id
				const isCollaborator = event.eventCollaborators.length > 0
				if (!isHost && !isCollaborator) {
					// Could  check for collaborator permissions here too
					throw new TRPCError({ code: 'FORBIDDEN' })
				}

				return event
			}),

		analytics: protectedProcedure
			.input(z.object({ slug: z.string() }))
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
			.input(z.object({ slug: z.string() }))
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
					where: {
						eventId: event?.id,
						userId: ctx.session.user.id,
					},
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
	}),

	list: createTRPCRouter({
		core: eventListBaseProcedure.query(async ({ ctx }) => {
			const { args } = ctx

			const events = await ctx.prisma.event.findMany({
				...args,
				include: eventCoreInclude,
			})
			return events
		}),

		enhanced: eventListBaseProcedure.query(async ({ ctx }) => {
			const { user, args } = ctx

			const events = await ctx.prisma.event.findMany({
				...args,
				include: eventEnhancedInclude,
			})

			if (events.length === 0) return []

			const eventIds = events.map((event) => event.id)

			// Fetch all user's RSVPs for the retrieved events in one query
			const userRsvps = await ctx.prisma.rsvp.findMany({
				where: { userId: user.id, eventId: { in: eventIds } },
				include: { ticketTier: true },
			})
			const rsvpMap = new Map(userRsvps.map((rsvp) => [rsvp.eventId, rsvp]))

			// Map events to include the specific user context for each one
			const eventsWithContext = events.map((event) => {
				const isHost = event.host.id === user.id
				const collaboratorRole = event.eventCollaborators?.find(
					(c) => c.user.id === user.id
				)?.role

				const metadata = {
					user: {
						id: user.id,
						name: user.name,
						image: user.image,
						email: user.email,
						rsvp: rsvpMap.get(event.id) ?? null,
						access: {
							manager: isHost || collaboratorRole === EventRole.MANAGER,
							cohost: collaboratorRole === EventRole.CO_HOST,
						},
					},
				}
				return { ...event, metadata }
			})

			return eventsWithContext
		}),

		nearby: publicProcedure
			.input(
				z.object({
					locationId: z.string().optional().nullable(),
					take: z.number().min(1).max(100).default(10),
				})
			)
			.query(async ({ ctx, input }) => {
				const { locationId, take } = input
				if (!locationId) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'User location not found',
					})
				}

				const events = await ctx.prisma.event.findMany({
					where: {
						location: {
							id: locationId,
						},
					},
					take,
					select: {
						id: true,
						title: true,
						slug: true,
						startDate: true,
						endDate: true,
						coverImage: true,
					},
				})
				if (events.length === 0) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'No nearby events found',
					})
				}
				return events
			}),
	}),
})
