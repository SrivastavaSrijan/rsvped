import * as z from "zod"
import { CompleteAccount, RelatedAccountModel, CompleteSession, RelatedSessionModel, CompleteEvent, RelatedEventModel, CompleteRsvp, RelatedRsvpModel, CompleteCommunity, RelatedCommunityModel, CompleteCommunityMembership, RelatedCommunityMembershipModel, CompleteEventMessage, RelatedEventMessageModel, CompleteEventReferral, RelatedEventReferralModel, CompleteEventCollaborator, RelatedEventCollaboratorModel, CompleteEventView, RelatedEventViewModel } from "./index"

export const UserModel = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  emailVerified: z.date().nullish(),
  image: z.string().nullish(),
  password: z.string().nullish(),
  createdAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  accounts: CompleteAccount[]
  sessions: CompleteSession[]
  hostedEvents: CompleteEvent[]
  rsvps: CompleteRsvp[]
  ownedCommunities: CompleteCommunity[]
  communityMemberships: CompleteCommunityMembership[]
  eventMessages: CompleteEventMessage[]
  eventReferrals: CompleteEventReferral[]
  eventCollaborators: CompleteEventCollaborator[]
  EventView: CompleteEventView[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  accounts: RelatedAccountModel.array(),
  sessions: RelatedSessionModel.array(),
  hostedEvents: RelatedEventModel.array(),
  rsvps: RelatedRsvpModel.array(),
  ownedCommunities: RelatedCommunityModel.array(),
  communityMemberships: RelatedCommunityMembershipModel.array(),
  eventMessages: RelatedEventMessageModel.array(),
  eventReferrals: RelatedEventReferralModel.array(),
  eventCollaborators: RelatedEventCollaboratorModel.array(),
  EventView: RelatedEventViewModel.array(),
}))
