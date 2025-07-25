import * as z from 'zod'
import { type CompleteEvent, RelatedEventModel } from './index'

export const LocationModel = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	country: z.string(),
	continent: z.string(),
	timezone: z.string(),
	iconPath: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteLocation extends z.infer<typeof LocationModel> {
	events: CompleteEvent[]
}

/**
 * RelatedLocationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedLocationModel: z.ZodSchema<CompleteLocation> = z.lazy(() =>
	LocationModel.extend({
		events: RelatedEventModel.array(),
	})
)
