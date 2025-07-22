import * as z from "zod"
import { OrderStatus } from "@prisma/client"
import { CompleteEvent, RelatedEventModel, CompletePromoCode, RelatedPromoCodeModel, CompleteOrderItem, RelatedOrderItemModel, CompletePayment, RelatedPaymentModel, CompleteRsvp, RelatedRsvpModel } from "./index"

export const OrderModel = z.object({
  id: z.string(),
  eventId: z.string(),
  purchaserEmail: z.string(),
  purchaserName: z.string().nullish(),
  status: z.nativeEnum(OrderStatus),
  totalCents: z.number().int(),
  currency: z.string(),
  refundedCents: z.number().int(),
  appliedPromoCodeId: z.string().nullish(),
  idempotencyKey: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteOrder extends z.infer<typeof OrderModel> {
  event: CompleteEvent
  appliedPromoCode?: CompletePromoCode | null
  items: CompleteOrderItem[]
  payments: CompletePayment[]
  rsvps: CompleteRsvp[]
}

/**
 * RelatedOrderModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedOrderModel: z.ZodSchema<CompleteOrder> = z.lazy(() => OrderModel.extend({
  event: RelatedEventModel,
  appliedPromoCode: RelatedPromoCodeModel.nullish(),
  items: RelatedOrderItemModel.array(),
  payments: RelatedPaymentModel.array(),
  rsvps: RelatedRsvpModel.array(),
}))
