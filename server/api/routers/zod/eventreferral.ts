import * as z from 'zod'
import {
  CompleteEvent,
  CompleteRsvp,
  CompleteUser,
  RelatedEventModel,
  RelatedRsvpModel,
  RelatedUserModel,
} from './index'

export const EventReferralModel = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string().nullish(),
  code: z.string(),
  uses: z.number().int(),
  createdAt: z.date(),
})

export interface CompleteEventReferral extends z.infer<typeof EventReferralModel> {
  event: CompleteEvent
  user?: CompleteUser | null
  rsvps: CompleteRsvp[]
}

/**
 * RelatedEventReferralModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventReferralModel: z.ZodSchema<CompleteEventReferral> = z.lazy(() =>
  EventReferralModel.extend({
    event: RelatedEventModel,
    user: RelatedUserModel.nullish(),
    rsvps: RelatedRsvpModel.array(),
  })
)
