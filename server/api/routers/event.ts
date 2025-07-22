import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
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

export const eventRouter = createTRPCRouter({
  // Get all events
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        ticketTiers: true,
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
    })
  }),

  // Create a new event (requires authentication)
  create: protectedProcedure.input(CreateEventInput).mutation(async ({ ctx, input }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to create an event',
      })
    }

    try {
      // Generate unique slug from title
      const baseSlug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check for existing slugs and make unique
      let slug = baseSlug
      let counter = 1
      while (await ctx.prisma.event.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }

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

  getMetadataBySlug: publicProcedure
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

  // Get event by slug
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const event = await ctx.prisma.event.findUnique({
      where: {
        slug: input.slug,
        deletedAt: null,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        ticketTiers: true,
        rsvps: {
          where: {
            status: 'CONFIRMED',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
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

  // Update an existing event (requires authentication and ownership)
  update: protectedProcedure.input(UpdateEventInput).mutation(async ({ ctx, input }) => {
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
        select: { id: true, hostId: true },
      })

      if (!existingEvent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        })
      }

      if (existingEvent.hostId !== ctx.session.user.id) {
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
