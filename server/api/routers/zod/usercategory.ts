import * as z from 'zod'
import {
	type CompleteCategory,
	type CompleteUser,
	RelatedCategoryModel,
	RelatedUserModel,
} from './index'

export const UserCategoryModel = z.object({
	userId: z.string(),
	categoryId: z.string(),
	interestLevel: z.number().int(),
})

export interface CompleteUserCategory
	extends z.infer<typeof UserCategoryModel> {
	user: CompleteUser
	category: CompleteCategory
}

/**
 * RelatedUserCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserCategoryModel: z.ZodSchema<CompleteUserCategory> =
	z.lazy(() =>
		UserCategoryModel.extend({
			user: RelatedUserModel,
			category: RelatedCategoryModel,
		})
	)
