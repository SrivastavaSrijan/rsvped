import { PaymentState, RsvpStatus } from '@prisma/client'
import * as z from 'zod'
import {
	type CompleteCheckIn,
	type CompleteEvent,
	type CompleteEventFeedback,
	type CompleteEventReferral,
	type CompleteOrder,
	type CompleteRegistrationAnswer,
	type CompleteTicketTier,
	type CompleteUser,
	RelatedCheckInModel,
	RelatedEventFeedbackModel,
	RelatedEventModel,
	RelatedEventReferralModel,
	RelatedOrderModel,
	RelatedRegistrationAnswerModel,
	RelatedTicketTierModel,
	RelatedUserModel,
} from './index'

export const RsvpModel = z.object({
	id: z.string(),
	eventId: z.string(),
	ticketTierId: z.string().nullish(),
	userId: z.string().nullish(),
	orderId: z.string().nullish(),
	email: z.string(),
	name: z.string().nullish(),
	status: z.nativeEnum(RsvpStatus),
	paymentState: z.nativeEnum(PaymentState),
	waitlistPosition: z.number().int().nullish(),
	referralId: z.string().nullish(),
	createdAt: z.date(),
})

export interface CompleteRsvp extends z.infer<typeof RsvpModel> {
	event: CompleteEvent
	ticketTier?: CompleteTicketTier | null
	user?: CompleteUser | null
	order?: CompleteOrder | null
	referral?: CompleteEventReferral | null
	checkIn?: CompleteCheckIn | null
	registrationAnswers: CompleteRegistrationAnswer[]
	eventFeedback: CompleteEventFeedback[]
}

/**
 * RelatedRsvpModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRsvpModel: z.ZodSchema<CompleteRsvp> = z.lazy(() =>
	RsvpModel.extend({
		event: RelatedEventModel,
		ticketTier: RelatedTicketTierModel.nullish(),
		user: RelatedUserModel.nullish(),
		order: RelatedOrderModel.nullish(),
		referral: RelatedEventReferralModel.nullish(),
		checkIn: RelatedCheckInModel.nullish(),
		registrationAnswers: RelatedRegistrationAnswerModel.array(),
		eventFeedback: RelatedEventFeedbackModel.array(),
	})
)
