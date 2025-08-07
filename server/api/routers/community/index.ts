import { createTRPCRouter } from '@/server/api/trpc'
import { communityCrudRouter } from './crud'
import { communityGetRouter } from './get'
import { communityListRouter } from './list'
import { communityNearbyRouter } from './nearby'

export const communityRouter = createTRPCRouter({
	list: communityListRouter,
	get: communityGetRouter,
	nearby: communityNearbyRouter,
	subscribe: communityCrudRouter.subscribe,
})
