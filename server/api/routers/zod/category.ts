import * as z from 'zod'
import { type CompleteEventCategory, RelatedEventCategoryModel } from './index'

export const CategoryModel = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
})

export interface CompleteCategory extends z.infer<typeof CategoryModel> {
	events: CompleteEventCategory[]
}

/**
 * RelatedCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCategoryModel: z.ZodSchema<CompleteCategory> = z.lazy(() =>
	CategoryModel.extend({
		events: RelatedEventCategoryModel.array(),
	})
)
