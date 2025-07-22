import * as z from "zod"
import { CompletePromoCode, RelatedPromoCodeModel, CompleteTicketTier, RelatedTicketTierModel } from "./index"

export const PromoCodeTierModel = z.object({
  promoCodeId: z.string(),
  ticketTierId: z.string(),
})

export interface CompletePromoCodeTier extends z.infer<typeof PromoCodeTierModel> {
  promoCode: CompletePromoCode
  ticketTier: CompleteTicketTier
}

/**
 * RelatedPromoCodeTierModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPromoCodeTierModel: z.ZodSchema<CompletePromoCodeTier> = z.lazy(() => PromoCodeTierModel.extend({
  promoCode: RelatedPromoCodeModel,
  ticketTier: RelatedTicketTierModel,
}))
