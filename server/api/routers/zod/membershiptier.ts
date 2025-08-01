import { BillingInterval } from '@prisma/client'
import * as z from 'zod'
import {
	type CompleteCommunity,
	type CompleteCommunityMembership,
	RelatedCommunityMembershipModel,
	RelatedCommunityModel,
} from './index'

export const MembershipTierModel = z.object({
	id: z.string(),
	communityId: z.string(),
	name: z.string(),
	slug: z.string(),
	description: z.string().nullish(),
	priceCents: z.number().int().nullish(),
	currency: z.string().nullish(),
	billingInterval: z.nativeEnum(BillingInterval).nullish(),
	stripePriceId: z.string().nullish(),
	isActive: z.boolean(),
	createdAt: z.date(),
})

export interface CompleteMembershipTier
	extends z.infer<typeof MembershipTierModel> {
	community: CompleteCommunity
	memberships: CompleteCommunityMembership[]
}

/**
 * RelatedMembershipTierModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedMembershipTierModel: z.ZodSchema<CompleteMembershipTier> =
	z.lazy(() =>
		MembershipTierModel.extend({
			community: RelatedCommunityModel,
			memberships: RelatedCommunityMembershipModel.array(),
		})
	)
