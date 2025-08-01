import * as z from 'zod'
import { type CompleteEvent, RelatedEventModel } from './index'

export const EventDailyStatModel = z.object({
	id: z.string(),
	eventId: z.string(),
	date: z.date(),
	views: z.number().int(),
	uniqueViews: z.number().int(),
	rsvps: z.number().int(),
	paidRsvps: z.number().int(),
})

export interface CompleteEventDailyStat
	extends z.infer<typeof EventDailyStatModel> {
	event: CompleteEvent
}

/**
 * RelatedEventDailyStatModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventDailyStatModel: z.ZodSchema<CompleteEventDailyStat> =
	z.lazy(() =>
		EventDailyStatModel.extend({
			event: RelatedEventModel,
		})
	)
