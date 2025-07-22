import * as z from 'zod'
import {
  CompleteOrder,
  CompleteTicketTier,
  RelatedOrderModel,
  RelatedTicketTierModel,
} from './index'

export const OrderItemModel = z.object({
  id: z.string(),
  orderId: z.string(),
  ticketTierId: z.string(),
  quantity: z.number().int(),
  priceCents: z.number().int(),
})

export interface CompleteOrderItem extends z.infer<typeof OrderItemModel> {
  order: CompleteOrder
  ticketTier: CompleteTicketTier
}

/**
 * RelatedOrderItemModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedOrderItemModel: z.ZodSchema<CompleteOrderItem> = z.lazy(() =>
  OrderItemModel.extend({
    order: RelatedOrderModel,
    ticketTier: RelatedTicketTierModel,
  })
)
