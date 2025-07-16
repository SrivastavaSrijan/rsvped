import { createTRPCRouter } from '@/server/api/trpc'
import { eventRouter } from './routers/event'
import { rsvpRouter } from './routers/rsvp'
import { createTRPCContext } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  event: eventRouter,
  rsvp: rsvpRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = (ctx: Awaited<ReturnType<typeof createTRPCContext>>) =>
  appRouter.createCaller(ctx)
