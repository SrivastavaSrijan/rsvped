import { DiscountType } from '@prisma/client'
import * as z from 'zod'
import {
	type CompleteEvent,
	type CompleteOrder,
	type CompletePromoCodeTier,
	RelatedEventModel,
	RelatedOrderModel,
	RelatedPromoCodeTierModel,
} from './index'

export const PromoCodeModel = z.object({
	id: z.string(),
	eventId: z.string(),
	code: z.string(),
	discountType: z.nativeEnum(DiscountType),
	amountOffCents: z.number().int().nullish(),
	percentOff: z.number().int().nullish(),
	maxRedemptions: z.number().int().nullish(),
	redeemedCount: z.number().int(),
	startsAt: z.date().nullish(),
	endsAt: z.date().nullish(),
	appliesToAllTiers: z.boolean(),
})

export interface CompletePromoCode extends z.infer<typeof PromoCodeModel> {
	event: CompleteEvent
	applicableTiers: CompletePromoCodeTier[]
	appliedOrders: CompleteOrder[]
}

/**
 * RelatedPromoCodeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPromoCodeModel: z.ZodSchema<CompletePromoCode> = z.lazy(
	() =>
		PromoCodeModel.extend({
			event: RelatedEventModel,
			applicableTiers: RelatedPromoCodeTierModel.array(),
			appliedOrders: RelatedOrderModel.array(),
		})
)
