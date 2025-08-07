import { EventRole, type Prisma } from '@prisma/client'
import { z } from 'zod'
import { tRPCErrors } from '@/server/api/errors'
import { PaginationSchema } from '@/server/api/shared/schemas'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { eventCoreInclude, eventEnhancedInclude } from './includes'

const GetEventsInput = z
	.object({
		sort: z.enum(['asc', 'desc']).default('asc'),
		before: z.string().optional(),
		after: z.string().optional(),
		on: z.string().optional(),
		roles: z.array(z.nativeEnum(EventRole)).optional(),
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
	.merge(PaginationSchema)

const eventListBaseProcedure = protectedProcedure
	.input(GetEventsInput)
	.use(async ({ ctx, input, next }) => {
		const user = ctx.session?.user
		if (!user) tRPCErrors.unauthorized()

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

export const eventListRouter = createTRPCRouter({
	core: eventListBaseProcedure.query(async ({ ctx }) => {
		const { args } = ctx as typeof ctx & {
			args: Parameters<typeof ctx.prisma.event.findMany>[0]
		}
		const events = await ctx.prisma.event.findMany({
			...args,
			include: eventCoreInclude,
		})
		return events
	}),

	enhanced: eventListBaseProcedure.query(async ({ ctx }) => {
		const { user, args } = ctx as typeof ctx & {
			user: {
				id: string
				name: string | null
				image: string | null
				email: string | null
			}
			args: Parameters<typeof ctx.prisma.event.findMany>[0]
		}
		const events = await ctx.prisma.event.findMany({
			...args,
			include: eventEnhancedInclude,
		})
		if (events.length === 0) return []
		const eventIds = events.map((event) => event.id)
		const userRsvps = await ctx.prisma.rsvp.findMany({
			where: { userId: user.id, eventId: { in: eventIds } },
			include: { ticketTier: true },
		})
		const rsvpMap = new Map(userRsvps.map((rsvp) => [rsvp.eventId, rsvp]))
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
})
