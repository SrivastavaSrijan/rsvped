import * as z from 'zod'
import { CompleteEvent, CompleteUser, RelatedEventModel, RelatedUserModel } from './index'

export const EventViewModel = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string().nullish(),
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  referrer: z.string().nullish(),
  viewedAt: z.date(),
})

export interface CompleteEventView extends z.infer<typeof EventViewModel> {
  event: CompleteEvent
  user?: CompleteUser | null
}

/**
 * RelatedEventViewModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventViewModel: z.ZodSchema<CompleteEventView> = z.lazy(() =>
  EventViewModel.extend({
    event: RelatedEventModel,
    user: RelatedUserModel.nullish(),
  })
)
