import * as z from 'zod'
import {
	type CompleteEventCategory,
	type CompleteUserCategory,
	RelatedEventCategoryModel,
	RelatedUserCategoryModel,
} from './index'

export const CategoryModel = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	subcategories: z.string().array(),
})

export interface CompleteCategory extends z.infer<typeof CategoryModel> {
	events: CompleteEventCategory[]
	users: CompleteUserCategory[]
}

/**
 * RelatedCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCategoryModel: z.ZodSchema<CompleteCategory> = z.lazy(() =>
	CategoryModel.extend({
		events: RelatedEventCategoryModel.array(),
		users: RelatedUserCategoryModel.array(),
	})
)
