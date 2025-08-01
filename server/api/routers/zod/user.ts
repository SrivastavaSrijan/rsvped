import * as z from 'zod'
import {
	type CompleteAccount,
	type CompleteCommunity,
	type CompleteCommunityMembership,
	type CompleteEvent,
	type CompleteEventCollaborator,
	type CompleteEventMessage,
	type CompleteEventReferral,
	type CompleteEventView,
	type CompleteLocation,
	type CompleteRsvp,
	type CompleteSession,
	RelatedAccountModel,
	RelatedCommunityMembershipModel,
	RelatedCommunityModel,
	RelatedEventCollaboratorModel,
	RelatedEventMessageModel,
	RelatedEventModel,
	RelatedEventReferralModel,
	RelatedEventViewModel,
	RelatedLocationModel,
	RelatedRsvpModel,
	RelatedSessionModel,
} from './index'

export const UserModel = z.object({
	id: z.string(),
	name: z.string().nullish(),
	email: z.string().nullish(),
	emailVerified: z.date().nullish(),
	image: z.string().nullish(),
	password: z.string().nullish(),
	locationId: z.string().nullish(),
	createdAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
	accounts: CompleteAccount[]
	sessions: CompleteSession[]
	hostedEvents: CompleteEvent[]
	rsvps: CompleteRsvp[]
	location?: CompleteLocation | null
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
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() =>
	UserModel.extend({
		accounts: RelatedAccountModel.array(),
		sessions: RelatedSessionModel.array(),
		hostedEvents: RelatedEventModel.array(),
		rsvps: RelatedRsvpModel.array(),
		location: RelatedLocationModel.nullish(),
		ownedCommunities: RelatedCommunityModel.array(),
		communityMemberships: RelatedCommunityMembershipModel.array(),
		eventMessages: RelatedEventMessageModel.array(),
		eventReferrals: RelatedEventReferralModel.array(),
		eventCollaborators: RelatedEventCollaboratorModel.array(),
		EventView: RelatedEventViewModel.array(),
	})
)
