import { FriendshipStatus } from '@prisma/client'
import * as z from 'zod'
import { type CompleteUser, RelatedUserModel } from './index'

export const FriendshipModel = z.object({
	id: z.string(),
	userId: z.string(),
	friendId: z.string(),
	status: z.nativeEnum(FriendshipStatus),
	createdAt: z.date(),
	acceptedAt: z.date().nullish(),
})

export interface CompleteFriendship extends z.infer<typeof FriendshipModel> {
	user: CompleteUser
	friend: CompleteUser
}

/**
 * RelatedFriendshipModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedFriendshipModel: z.ZodSchema<CompleteFriendship> = z.lazy(
	() =>
		FriendshipModel.extend({
			user: RelatedUserModel,
			friend: RelatedUserModel,
		})
)
