import * as z from "zod"
import { PaymentStatus } from "@prisma/client"
import { CompleteOrder, RelatedOrderModel, CompleteRefund, RelatedRefundModel } from "./index"

export const PaymentModel = z.object({
  id: z.string(),
  orderId: z.string(),
  attemptNumber: z.number().int(),
  provider: z.string(),
  providerIntentId: z.string().nullish(),
  providerChargeId: z.string().nullish(),
  status: z.nativeEnum(PaymentStatus),
  amountCents: z.number().int(),
  currency: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompletePayment extends z.infer<typeof PaymentModel> {
  order: CompleteOrder
  refunds: CompleteRefund[]
}

/**
 * RelatedPaymentModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPaymentModel: z.ZodSchema<CompletePayment> = z.lazy(() => PaymentModel.extend({
  order: RelatedOrderModel,
  refunds: RelatedRefundModel.array(),
}))
