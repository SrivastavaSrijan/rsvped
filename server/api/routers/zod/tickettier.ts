import { TicketVisibility } from '@prisma/client'
import * as z from 'zod'
import {
	type CompleteEvent,
	type CompleteOrderItem,
	type CompletePromoCodeTier,
	type CompleteRsvp,
	RelatedEventModel,
	RelatedOrderItemModel,
	RelatedPromoCodeTierModel,
	RelatedRsvpModel,
} from './index'

export const TicketTierModel = z.object({
	id: z.string(),
	eventId: z.string(),
	name: z.string(),
	description: z.string().nullish(),
	priceCents: z.number().int(),
	currency: z.string(),
	quantityTotal: z.number().int().nullish(),
	quantitySold: z.number().int(),
	visibility: z.nativeEnum(TicketVisibility),
	salesStart: z.date().nullish(),
	salesEnd: z.date().nullish(),
})

export interface CompleteTicketTier extends z.infer<typeof TicketTierModel> {
	event: CompleteEvent
	rsvps: CompleteRsvp[]
	orderItems: CompleteOrderItem[]
	promoCodeTiers: CompletePromoCodeTier[]
}

/**
 * RelatedTicketTierModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTicketTierModel: z.ZodSchema<CompleteTicketTier> = z.lazy(
	() =>
		TicketTierModel.extend({
			event: RelatedEventModel,
			rsvps: RelatedRsvpModel.array(),
			orderItems: RelatedOrderItemModel.array(),
			promoCodeTiers: RelatedPromoCodeTierModel.array(),
		})
)
