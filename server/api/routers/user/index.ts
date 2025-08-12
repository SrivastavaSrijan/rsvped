import { createTRPCRouter } from '@/server/api/trpc'
import { userActivityRouter } from './activity'
import { userAuthRouter } from './auth'
import { userPreferencesRouter } from './preferences'
import { userProfileRouter } from './profile'

export const userRouter = createTRPCRouter({
	profile: userProfileRouter,
	auth: userAuthRouter,
	preferences: userPreferencesRouter,
	activity: userActivityRouter,
})
