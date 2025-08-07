import { createTRPCRouter } from '@/server/api/trpc'
import { eventCrudRouter } from './crud'
import { eventGetRouter } from './get'
import { eventListRouter } from './list'
import { eventNearbyRouter } from './nearby'

export const eventRouter = createTRPCRouter({
	list: eventListRouter,
	get: eventGetRouter,
	nearby: eventNearbyRouter,
	create: eventCrudRouter.create,
	update: eventCrudRouter.update,
})
