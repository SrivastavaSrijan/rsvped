import * as z from 'zod'
import { type CompleteEvent, type CompleteUser, RelatedEventModel, RelatedUserModel } from './index'

export const EventMessageModel = z.object({
	id: z.string(),
	eventId: z.string(),
	userId: z.string().nullish(),
	content: z.string(),
	parentId: z.string().nullish(),
	createdAt: z.date(),
})

export interface CompleteEventMessage extends z.infer<typeof EventMessageModel> {
	event: CompleteEvent
	user?: CompleteUser | null
	parent?: CompleteEventMessage | null
	replies: CompleteEventMessage[]
}

/**
 * RelatedEventMessageModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventMessageModel: z.ZodSchema<CompleteEventMessage> = z.lazy(() =>
	EventMessageModel.extend({
		event: RelatedEventModel,
		user: RelatedUserModel.nullish(),
		parent: RelatedEventMessageModel.nullish(),
		replies: RelatedEventMessageModel.array(),
	})
)
