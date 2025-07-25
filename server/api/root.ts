import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { createTRPCRouter } from '@/server/api/trpc'
import { eventRouter, imageRouter, rsvpRouter, userRouter } from './routers'
import type { createTRPCContext } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	event: eventRouter,
	rsvp: rsvpRouter,
	image: imageRouter,

	user: userRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>
export type { RouterInput, RouterOutput }
/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = (ctx: Awaited<ReturnType<typeof createTRPCContext>>) =>
	appRouter.createCaller(ctx)
