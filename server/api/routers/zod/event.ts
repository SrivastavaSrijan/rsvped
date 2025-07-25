import { EventStatus, EventVisibility, LocationType } from '@prisma/client'
import * as z from 'zod'
import {
	type CompleteCommunity,
	type CompleteEventCategory,
	type CompleteEventCollaborator,
	type CompleteEventDailyStat,
	type CompleteEventFeedback,
	type CompleteEventMessage,
	type CompleteEventReferral,
	type CompleteEventView,
	type CompleteLocation,
	type CompleteOrder,
	type CompletePromoCode,
	type CompleteRegistrationQuestion,
	type CompleteRsvp,
	type CompleteTicketTier,
	type CompleteUser,
	RelatedCommunityModel,
	RelatedEventCategoryModel,
	RelatedEventCollaboratorModel,
	RelatedEventDailyStatModel,
	RelatedEventFeedbackModel,
	RelatedEventMessageModel,
	RelatedEventReferralModel,
	RelatedEventViewModel,
	RelatedLocationModel,
	RelatedOrderModel,
	RelatedPromoCodeModel,
	RelatedRegistrationQuestionModel,
	RelatedRsvpModel,
	RelatedTicketTierModel,
	RelatedUserModel,
} from './index'

export const EventModel = z.object({
	id: z.string(),
	slug: z.string(),
	title: z.string(),
	subtitle: z.string().nullish(),
	description: z.string().nullish(),
	coverImage: z.string().nullish(),
	startDate: z.date(),
	endDate: z.date(),
	timezone: z.string(),
	locationId: z.string().nullish(),
	locationType: z.nativeEnum(LocationType),
	venueName: z.string().nullish(),
	venueAddress: z.string().nullish(),
	onlineUrl: z.string().nullish(),
	capacity: z.number().int().nullish(),
	isPublished: z.boolean(),
	status: z.nativeEnum(EventStatus),
	visibility: z.nativeEnum(EventVisibility),
	publishedAt: z.date().nullish(),
	requiresApproval: z.boolean(),
	locationHiddenUntilApproved: z.boolean(),
	hostId: z.string(),
	communityId: z.string().nullish(),
	deletedAt: z.date().nullish(),
	rsvpCount: z.number().int(),
	paidRsvpCount: z.number().int(),
	checkInCount: z.number().int(),
	viewCount: z.number().int(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteEvent extends z.infer<typeof EventModel> {
	location?: CompleteLocation | null
	host: CompleteUser
	community?: CompleteCommunity | null
	categories: CompleteEventCategory[]
	ticketTiers: CompleteTicketTier[]
	rsvps: CompleteRsvp[]
	orders: CompleteOrder[]
	promoCodes: CompletePromoCode[]
	registrationQuestions: CompleteRegistrationQuestion[]
	eventViews: CompleteEventView[]
	eventDailyStats: CompleteEventDailyStat[]
	eventMessages: CompleteEventMessage[]
	eventReferrals: CompleteEventReferral[]
	eventCollaborators: CompleteEventCollaborator[]
	eventFeedback: CompleteEventFeedback[]
}

/**
 * RelatedEventModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventModel: z.ZodSchema<CompleteEvent> = z.lazy(() =>
	EventModel.extend({
		location: RelatedLocationModel.nullish(),
		host: RelatedUserModel,
		community: RelatedCommunityModel.nullish(),
		categories: RelatedEventCategoryModel.array(),
		ticketTiers: RelatedTicketTierModel.array(),
		rsvps: RelatedRsvpModel.array(),
		orders: RelatedOrderModel.array(),
		promoCodes: RelatedPromoCodeModel.array(),
		registrationQuestions: RelatedRegistrationQuestionModel.array(),
		eventViews: RelatedEventViewModel.array(),
		eventDailyStats: RelatedEventDailyStatModel.array(),
		eventMessages: RelatedEventMessageModel.array(),
		eventReferrals: RelatedEventReferralModel.array(),
		eventCollaborators: RelatedEventCollaboratorModel.array(),
		eventFeedback: RelatedEventFeedbackModel.array(),
	})
)
