import { ActivityType } from '@prisma/client'
import * as z from 'zod'
import { type CompleteUser, RelatedUserModel } from './index'

export const UserActivityModel = z.object({
	id: z.string(),
	userId: z.string(),
	type: z.nativeEnum(ActivityType),
	targetId: z.string(),
	targetType: z.string(),
	metadata: z.string().nullish(),
	createdAt: z.date(),
})

export interface CompleteUserActivity
	extends z.infer<typeof UserActivityModel> {
	user: CompleteUser
}

/**
 * RelatedUserActivityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserActivityModel: z.ZodSchema<CompleteUserActivity> =
	z.lazy(() =>
		UserActivityModel.extend({
			user: RelatedUserModel,
		})
	)
