import * as z from 'zod'
import { type CompleteEvent, type CompleteRsvp, RelatedEventModel, RelatedRsvpModel } from './index'

export const EventFeedbackModel = z.object({
	id: z.string(),
	eventId: z.string(),
	rsvpId: z.string(),
	rating: z.number().int().nullish(),
	comment: z.string().nullish(),
	createdAt: z.date(),
})

export interface CompleteEventFeedback extends z.infer<typeof EventFeedbackModel> {
	event: CompleteEvent
	rsvp: CompleteRsvp
}

/**
 * RelatedEventFeedbackModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventFeedbackModel: z.ZodSchema<CompleteEventFeedback> = z.lazy(() =>
	EventFeedbackModel.extend({
		event: RelatedEventModel,
		rsvp: RelatedRsvpModel,
	})
)
