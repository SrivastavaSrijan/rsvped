import * as z from 'zod'
import {
	type CompleteCommunityMembership,
	type CompleteEvent,
	type CompleteMembershipTier,
	type CompleteUser,
	RelatedCommunityMembershipModel,
	RelatedEventModel,
	RelatedMembershipTierModel,
	RelatedUserModel,
} from './index'

export const CommunityModel = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	description: z.string().nullish(),
	coverImage: z.string().nullish(),
	isPublic: z.boolean(),
	ownerId: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteCommunity extends z.infer<typeof CommunityModel> {
	owner: CompleteUser
	members: CompleteCommunityMembership[]
	membershipTiers: CompleteMembershipTier[]
	events: CompleteEvent[]
}

/**
 * RelatedCommunityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCommunityModel: z.ZodSchema<CompleteCommunity> = z.lazy(
	() =>
		CommunityModel.extend({
			owner: RelatedUserModel,
			members: RelatedCommunityMembershipModel.array(),
			membershipTiers: RelatedMembershipTierModel.array(),
			events: RelatedEventModel.array(),
		})
)
