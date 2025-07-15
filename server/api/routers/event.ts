import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'

export const eventRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50
      const { cursor } = input

      const events = await ctx.prisma.event.findMany({
        take: limit + 1,
        where: {
          status: 'PUBLISHED',
          isPublic: true,
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          startDateTime: 'asc',
        },
        include: {
          organization: {
            select: {
              name: true,
              slug: true,
              logo: true,
            },
          },
          _count: {
            select: {
              rsvps: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined
      if (events.length > limit) {
        const nextItem = events.pop()
        nextCursor = nextItem?.id
      }

      return {
        events,
        nextCursor,
      }
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const event = await ctx.prisma.event.findUnique({
      where: { slug: input.slug },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
            logo: true,
          },
        },
        ticketTiers: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
    })

    if (!event) {
      throw new Error('Event not found')
    }

    return event
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        startDateTime: z.date(),
        endDateTime: z.date().optional(),
        location: z.string().optional(),
        capacity: z.number().int().positive().optional(),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      return ctx.prisma.event.create({
        data: {
          ...input,
          slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        },
      })
    }),
})
