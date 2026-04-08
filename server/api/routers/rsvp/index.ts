import { createTRPCRouter } from '@/server/api/trpc'
import { rsvpCrudRouter } from './crud'
import { rsvpListRouter } from './list'
import { rsvpListByEventRouter } from './list-by-event'

export const rsvpRouter = createTRPCRouter({
	crud: rsvpCrudRouter,
	list: rsvpListRouter,
	byEvent: rsvpListByEventRouter,
})
