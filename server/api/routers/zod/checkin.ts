import * as z from 'zod'
import { type CompleteRsvp, RelatedRsvpModel } from './index'

export const CheckInModel = z.object({
	id: z.string(),
	rsvpId: z.string(),
	scannedAt: z.date(),
})

export interface CompleteCheckIn extends z.infer<typeof CheckInModel> {
	rsvp: CompleteRsvp
}

/**
 * RelatedCheckInModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCheckInModel: z.ZodSchema<CompleteCheckIn> = z.lazy(() =>
	CheckInModel.extend({
		rsvp: RelatedRsvpModel,
	})
)
