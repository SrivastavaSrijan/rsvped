import { MembershipRole, SubscriptionStatus } from '@prisma/client'
import * as z from 'zod'
import {
	type CompleteCommunity,
	type CompleteMembershipTier,
	type CompleteUser,
	RelatedCommunityModel,
	RelatedMembershipTierModel,
	RelatedUserModel,
} from './index'

export const CommunityMembershipModel = z.object({
	id: z.string(),
	userId: z.string(),
	communityId: z.string(),
	role: z.nativeEnum(MembershipRole),
	membershipTierId: z.string().nullish(),
	subscriptionStatus: z.nativeEnum(SubscriptionStatus).nullish(),
	expiresAt: z.date().nullish(),
	joinedAt: z.date(),
})

export interface CompleteCommunityMembership extends z.infer<typeof CommunityMembershipModel> {
	membershipTier?: CompleteMembershipTier | null
	user: CompleteUser
	community: CompleteCommunity
}

/**
 * RelatedCommunityMembershipModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCommunityMembershipModel: z.ZodSchema<CompleteCommunityMembership> = z.lazy(
	() =>
		CommunityMembershipModel.extend({
			membershipTier: RelatedMembershipTierModel.nullish(),
			user: RelatedUserModel,
			community: RelatedCommunityModel,
		})
)
