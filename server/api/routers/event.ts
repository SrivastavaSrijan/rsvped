import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

export const eventRouter = createTRPCRouter({
  // Get all events
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        host: true,
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

  // Create a new event
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        timezone: z.string().default('UTC'),
        locationType: z.enum(['PHYSICAL', 'ONLINE', 'HYBRID']),
        venueName: z.string().optional(),
        venueAddress: z.string().optional(),
        onlineUrl: z.string().optional(),
        capacity: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate slug from title
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Find or create a demo user
      let demoUser = await ctx.prisma.user.findUnique({
        where: { email: 'demo@example.com' },
      })

      if (!demoUser) {
        demoUser = await ctx.prisma.user.create({
          data: {
            email: 'demo@example.com',
            name: 'Demo Host',
          },
        })
      }

      const event = await ctx.prisma.event.create({
        data: {
          ...input,
          slug: `${slug}-${Date.now()}`, // Ensure uniqueness
          hostId: demoUser.id,
        },
        include: {
          host: true,
        },
      })

      return event
    }),

  // Get event by ID
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.event.findUnique({
      where: { id: input.id },
      include: {
        host: true,
        categories: {
          include: {
            category: true,
          },
        },
        ticketTiers: true,
        rsvps: {
          include: {
            user: true,
          },
        },
      },
    })
  }),
})
