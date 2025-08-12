import { createTRPCRouter } from '@/server/api/trpc'
import { locationGetRouter } from './get'
import { locationListRouter } from './list'

export const locationRouter = createTRPCRouter({
	list: locationListRouter,
	get: locationGetRouter,
})
