/**
 * Seed Data Validation
 *
 * Zod schemas for validating batch data and ensuring data integrity.
 */

import { z } from 'zod'

// Base schemas for common types
const slugSchema = z
	.string()
	.min(1)
	.max(48)
	.regex(/^[a-z0-9-]+$/, 'Invalid slug format')
const emailSchema = z.string().email()
const urlSchema = z.string().url()
const timestampSchema = z.string().datetime()

// Location schema
export const locationSchema = z.object({
	name: z.string().min(1).max(100),
	slug: slugSchema,
	country: z.string().min(2).max(2), // ISO country code
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

// User schema (for batch data)
export const batchUserSchema = z.object({
	firstName: z.string().min(1).max(50),
	lastName: z.string().min(1).max(50),
	email: emailSchema,
	bio: z.string().max(500).optional(),
	company: z.string().max(100).optional(),
	title: z.string().max(100).optional(),
	linkedinUrl: z.string().url().optional(),
	twitterHandle: z.string().max(50).optional(),
	websiteUrl: z.string().url().optional(),
	interests: z.array(z.string().min(1).max(50)).max(10).default([]),
	locationPreference: slugSchema.optional(),
})

// Community schema (for batch data)
export const batchCommunitySchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().min(10).max(1000),
	mission: z.string().min(10).max(500).optional(),
	website: urlSchema.optional(),
	categories: z.array(z.string().min(1).max(50)).min(1).max(5),
	eventTypes: z.array(z.string().min(1).max(50)).min(1).max(10),
	targetAudience: z.string().min(10).max(300).optional(),
	membershipBenefits: z.array(z.string().min(5).max(200)).max(8).default([]),
	primaryLocation: slugSchema.optional(),
})

// Event schema (for batch data)
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

// Batch file schemas
export const communitiesBatchSchema = z.object({
	communities: z.array(batchCommunitySchema).min(1).max(1000),
	metadata: z.object({
		generated: timestampSchema,
		totalCommunities: z.number().int().min(1),
		averageCategories: z.number().min(1),
		model: z.string().optional(),
	}),
})

export const usersBatchSchema = z.object({
	users: z.array(batchUserSchema).min(1).max(10000),
	metadata: z.object({
		generated: timestampSchema,
		totalUsers: z.number().int().min(1),
		locationsRepresented: z.number().int().min(1),
		model: z.string().optional(),
	}),
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

// Static data schemas
export const locationsStaticSchema = z.array(locationSchema).min(1).max(500)
export const venuesStaticSchema = z.array(venueSchema).min(1).max(5000)

// Processed data schemas (final validation before seeding)
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

// Environment validation for API keys
export const unsplashConfigSchema = z
	.object({
		accessKey: z.string().min(1),
		collectionId: z.string().min(1),
	})
	.optional()

// Validation helper functions
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

// Type exports
export type Location = z.infer<typeof locationSchema>
export type Venue = z.infer<typeof venueSchema>
export type BatchUser = z.infer<typeof batchUserSchema>
export type BatchCommunity = z.infer<typeof batchCommunitySchema>
export type BatchEvent = z.infer<typeof batchEventSchema>
export type CommunitiesBatch = z.infer<typeof communitiesBatchSchema>
export type UsersBatch = z.infer<typeof usersBatchSchema>
export type EventsBatch = z.infer<typeof eventsBatchSchema>
export type ProcessedData = z.infer<typeof processedDataSchema>
