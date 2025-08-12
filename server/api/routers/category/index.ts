import { createTRPCRouter } from '@/server/api/trpc'
import { categoryGetRouter } from './get'
import { categoryListRouter } from './list'

export const categoryRouter = createTRPCRouter({
	list: categoryListRouter,
	get: categoryGetRouter,
})
