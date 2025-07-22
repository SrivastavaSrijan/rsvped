import * as z from "zod"
import { CompletePayment, RelatedPaymentModel } from "./index"

export const RefundModel = z.object({
  id: z.string(),
  paymentId: z.string(),
  amountCents: z.number().int(),
  reason: z.string().nullish(),
  providerRefundId: z.string().nullish(),
  createdAt: z.date(),
})

export interface CompleteRefund extends z.infer<typeof RefundModel> {
  payment: CompletePayment
}

/**
 * RelatedRefundModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRefundModel: z.ZodSchema<CompleteRefund> = z.lazy(() => RefundModel.extend({
  payment: RelatedPaymentModel,
}))
