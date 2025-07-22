import * as z from "zod"
import { CompleteEvent, RelatedEventModel, CompleteCategory, RelatedCategoryModel } from "./index"

export const EventCategoryModel = z.object({
  eventId: z.string(),
  categoryId: z.string(),
})

export interface CompleteEventCategory extends z.infer<typeof EventCategoryModel> {
  event: CompleteEvent
  category: CompleteCategory
}

/**
 * RelatedEventCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventCategoryModel: z.ZodSchema<CompleteEventCategory> = z.lazy(() => EventCategoryModel.extend({
  event: RelatedEventModel,
  category: RelatedCategoryModel,
}))
