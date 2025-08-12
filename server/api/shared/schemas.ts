import { z } from 'zod'

export const PaginationSchema = z.object({
	page: z.number().int().min(1).default(1),
	size: z.number().int().min(1).max(100).default(5),
})

export const UserPreferencesSchema = z.object({
	locationId: z.string().min(1),
})

export const CategoryFilterSchema = z.object({
	search: z.string().optional(),
})

export const RSVPAnalyticsSchema = z.object({
	eventId: z.string(),
})

export const OrderCheckoutSchema = z.object({
	eventId: z.string(),
	ticketTierId: z.string(),
	quantity: z.number().int().min(1),
})

export const PaymentIntentSchema = z.object({
	orderId: z.string(),
	amount: z.number().int().min(0),
})
