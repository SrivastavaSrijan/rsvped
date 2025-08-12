import { createTRPCRouter } from '@/server/api/trpc'
import { rsvpCrudRouter } from './crud'
import { rsvpListRouter } from './list'

export const rsvpRouter = createTRPCRouter({
	crud: rsvpCrudRouter,
	list: rsvpListRouter,
})
