import {
	ExperienceLevel,
	NetworkingStyle,
	SpendingPower,
	UserCohort,
} from '@prisma/client'
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
	type CompleteUserCategory,
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
	RelatedUserCategoryModel,
} from './index'

export const UserModel = z.object({
	id: z.string(),
	name: z.string().nullish(),
	email: z.string().nullish(),
	emailVerified: z.date().nullish(),
	image: z.string().nullish(),
	password: z.string().nullish(),
	profession: z.string().nullish(),
	industry: z.string().nullish(),
	experienceLevel: z.nativeEnum(ExperienceLevel).nullish(),
	interests: z.string().array(),
	networkingStyle: z.nativeEnum(NetworkingStyle).nullish(),
	spendingPower: z.nativeEnum(SpendingPower).nullish(),
	bio: z.string().nullish(),
	userCohort: z.nativeEnum(UserCohort).nullish(),
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
	categoryInterests: CompleteUserCategory[]
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
		categoryInterests: RelatedUserCategoryModel.array(),
		EventView: RelatedEventViewModel.array(),
	})
)
