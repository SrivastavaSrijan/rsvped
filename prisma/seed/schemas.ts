/**
 * Seed Data Schemas
 *
 * Zod schemas for validating all seed data types:
 * - LLM-generated content validation
 * - Static data validation
 * - Pipeline processing validation
 */

import { z } from 'zod'

// =============================================================================
// Base schemas for common types
// =============================================================================

const slugSchema = z
	.string()
	.min(1)
	.max(48)
	.regex(/^[a-z0-9-]+$/, 'Invalid slug format')
const emailSchema = z.string().email()
const timestampSchema = z.string().datetime()

// =============================================================================
// LLM Output Schemas - for validating raw LLM-generated data
// =============================================================================

// Community schema with nested events (LLM output)
export const LLMCommunitySchema = z.object({
	name: z.string().min(1),
	description: z.string().min(10),
	focusArea: z.string().min(1),
	targetAudience: z.string().min(1),
	membershipStyle: z.enum(['open', 'invite-only', 'application-based']),
	homeLocation: z.string().min(1),
	membershipTiers: z.array(
		z.object({
			name: z.string().min(1),
			description: z.string().min(1),
			priceCents: z.number().nullable(),
			benefits: z.array(z.string().min(1)),
		})
	),
	eventTypes: z.array(z.string().min(1)),
	categories: z.array(z.string().min(1)),
	events: z.array(
		z.object({
			title: z.string().min(1),
			subtitle: z.string().min(1),
			description: z.string().min(10),
			eventType: z.enum([
				'workshop',
				'networking',
				'conference',
				'panel',
				'demo',
				'social',
				'pitch',
				'exhibition',
				'retreat',
			]),
			targetCapacity: z.number().min(1),
			isPaid: z.boolean(),
			ticketTiers: z.array(
				z.object({
					name: z.string().min(1),
					description: z.string().min(1),
					priceCents: z.number().min(0),
					capacity: z.number().nullable(),
				})
			),
			promoCodes: z.array(
				z.object({
					code: z.string().min(1),
					description: z.string().min(1),
					discountPercent: z.number().min(1).max(100),
				})
			),
		})
	),
})

export const LLMCommunityBatchSchema = z.object({
	communities: z.array(LLMCommunitySchema),
})

// User persona schema (LLM output)
export const LLMUserPersonaSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	profession: z.string().min(1),
	industry: z.string().min(1),
	experienceLevel: z.enum(['junior', 'mid', 'senior', 'executive']),
	interests: z.array(z.string().min(1)),
	location: z.string().min(1),
	networkingStyle: z.enum(['active', 'selective', 'casual']),
	spendingPower: z.enum(['low', 'medium', 'high']),
	bio: z.string().min(10),
})

export const LLMUserBatchSchema = z.object({
	users: z.array(LLMUserPersonaSchema),
})

// =============================================================================
// Static Data Schemas - for validating static seed data
// =============================================================================

// Location schema
export const locationSchema = z.object({
	name: z.string().min(1).max(100),
	slug: slugSchema,
	country: z.string().min(2).max(100), // Full country name instead of ISO code
	continent: z.string().min(1).max(50),
	timezone: z.string().min(1).max(50),
	iconPath: z.string().optional(),
})

// Venue schema
export const venueSchema = z.object({
	name: z.string().min(1).max(200),
	address: z.string().min(1).max(500),
	city: z.string().min(1).max(100),
	locationSlug: slugSchema,
	capacity: z.number().int().min(1).max(100000).optional(),
	venueType: z
		.enum([
			'conference_center',
			'hotel',
			'university',
			'office',
			'restaurant',
			'outdoor',
			'virtual',
		])
		.optional(),
})

// Static data batch schemas
export const locationsStaticSchema = z.array(locationSchema).min(1).max(500)
export const venuesStaticSchema = z.record(
	z
		.string()
		.min(1), // city name
	z
		.array(z.string().min(1).max(200))
		.min(1) // array of venue names
)

// =============================================================================
// Pipeline Processing Schemas - for validating processed/transformed data
// =============================================================================

// User schema (for processed batch data)
export const batchUserSchema = z.object({
	firstName: z.string().min(1).max(50),
	lastName: z.string().min(1).max(50),
	email: emailSchema.optional(),
	bio: z.string().max(500).optional(),
	company: z.string().max(100).optional(),
	title: z.string().max(100).optional(),
	linkedinUrl: z.string().url().optional(),
	twitterHandle: z.string().max(50).optional(),
	websiteUrl: z.string().url().optional(),
	interests: z.array(z.string().min(1).max(50)).max(10).default([]),
	locationPreference: slugSchema.optional(),
})

// Community schema (for processed batch data)
export const batchCommunitySchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().min(10).max(1000),
	focusArea: z.string().min(1).max(100),
	targetAudience: z.string().min(1).max(300),
	membershipStyle: z.enum(['open', 'invite-only', 'application-based']),
	homeLocation: z.string().min(1).max(100),
	membershipTiers: z.array(
		z.object({
			name: z.string().min(1).max(50),
			description: z.string().min(1).max(200),
			priceCents: z.number().nullable(),
			benefits: z.array(z.string().min(1).max(100)),
		})
	),
	eventTypes: z.array(z.string().min(1).max(50)).min(1).max(20),
	categories: z.array(z.string().min(1).max(50)).min(1).max(20),
	events: z.array(
		z.object({
			title: z.string().min(1).max(200),
			subtitle: z.string().min(1).max(300),
			description: z.string().min(10).max(2000),
			eventType: z.enum([
				'workshop',
				'networking',
				'conference',
				'panel',
				'demo',
				'social',
				'pitch',
				'exhibition',
				'retreat',
			]),
			targetCapacity: z.number().min(1),
			isPaid: z.boolean(),
			ticketTiers: z.array(
				z.object({
					name: z.string().min(1).max(50),
					description: z.string().min(1).max(200),
					priceCents: z.number().min(0),
					capacity: z.number().nullable(),
				})
			),
			promoCodes: z.array(
				z.object({
					code: z.string().min(1).max(20),
					description: z.string().min(1).max(100),
					discountPercent: z.number().min(1).max(100),
				})
			),
		})
	),
})

// Event schema (for processed batch data)
export const batchEventSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().min(10).max(2000),
	shortDescription: z.string().min(10).max(300).optional(),
	category: z.string().min(1).max(50),
	eventType: z.string().min(1).max(50),
	city: z.string().min(1).max(100),
	locationSlug: slugSchema,
	communityName: z.string().min(1).max(100).optional(),
	targetAudience: z.string().min(5).max(200).optional(),
	learningOutcomes: z.array(z.string().min(5).max(200)).max(5).default([]),
	requiresApproval: z.boolean().default(false),
	isVirtual: z.boolean().default(false),
	price: z.number().min(0).max(10000).default(0),
	capacity: z.number().int().min(1).max(10000).optional(),
	tags: z.array(z.string().min(1).max(30)).max(10).default([]),
})

// =============================================================================
// Batch File Schemas - for validating complete batch files with metadata
// =============================================================================

export const communitiesBatchSchema = z.object({
	communities: z.array(batchCommunitySchema).min(1).max(1000),
	metadata: z
		.object({
			generated: timestampSchema,
			totalCommunities: z.number().int().min(1),
			averageCategories: z.number().min(1),
			model: z.string().optional(),
		})
		.optional(),
})

export const usersBatchSchema = z.object({
	users: z.array(batchUserSchema).min(1).max(10000),
	metadata: z
		.object({
			generated: timestampSchema,
			totalUsers: z.number().int().min(1),
			locationsRepresented: z.number().int().min(1),
			model: z.string().optional(),
		})
		.optional(),
})

export const eventsBatchSchema = z.object({
	eventsByCity: z.record(
		z
			.string()
			.min(1), // city name
		z.array(batchEventSchema).min(1)
	),
	metadata: z.object({
		generated: timestampSchema,
		totalEvents: z.number().int().min(1),
		citiesWithEvents: z.number().int().min(1),
		averageEventsPerCity: z.number().min(1),
		model: z.string().optional(),
	}),
})

// =============================================================================
// Final Pipeline Schema - for validating complete processed data
// =============================================================================

export const processedDataSchema = z.object({
	locations: locationsStaticSchema,
	venues: venuesStaticSchema,
	communities: z.array(batchCommunitySchema).min(1),
	users: z.array(batchUserSchema).min(1),
	eventsByCity: z.record(z.string(), z.array(batchEventSchema)),
	categories: z.array(z.string().min(1).max(50)).min(1),
	metadata: z.object({
		communities: z.object({
			generated: timestampSchema,
			totalCommunities: z.number().int().min(1),
		}),
		users: z.object({
			generated: timestampSchema,
			totalUsers: z.number().int().min(1),
		}),
		events: z.object({
			generated: timestampSchema,
			totalEvents: z.number().int().min(1),
		}),
	}),
})

// =============================================================================
// Environment Config Schemas
// =============================================================================

export const unsplashConfigSchema = z
	.object({
		accessKey: z.string().min(1),
		collectionId: z.string().min(1),
	})
	.optional()

// =============================================================================
// Validation Helper Functions
// =============================================================================

export function validateBatchFile<T>(
	data: unknown,
	schema: z.ZodSchema<T>,
	fileName: string
): T {
	try {
		return schema.parse(data)
	} catch (error) {
		if (error instanceof z.ZodError) {
			const issues = error.issues
				.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
				.join('\n')

			throw new Error(`Invalid ${fileName} structure:\n${issues}`)
		}
		throw error
	}
}

export function validateProcessedData(
	data: unknown
): z.infer<typeof processedDataSchema> {
	return validateBatchFile(data, processedDataSchema, 'processed data')
}

// =============================================================================
// Type Exports
// =============================================================================

// LLM types
export type LLMCommunity = z.infer<typeof LLMCommunitySchema>
export type LLMCommunityBatch = z.infer<typeof LLMCommunityBatchSchema>
export type LLMUserPersona = z.infer<typeof LLMUserPersonaSchema>
export type LLMUserBatch = z.infer<typeof LLMUserBatchSchema>

// Static data types
export type Location = z.infer<typeof locationSchema>
export type Venue = z.infer<typeof venueSchema>

// Processing types
export type BatchUser = z.infer<typeof batchUserSchema>
export type BatchCommunity = z.infer<typeof batchCommunitySchema>
export type BatchEvent = z.infer<typeof batchEventSchema>

// Batch file types
export type CommunitiesBatch = z.infer<typeof communitiesBatchSchema>
export type UsersBatch = z.infer<typeof usersBatchSchema>
export type EventsBatch = z.infer<typeof eventsBatchSchema>

// Final types
export type ProcessedData = z.infer<typeof processedDataSchema>
