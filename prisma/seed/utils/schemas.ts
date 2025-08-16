/**
 * Seed Data Schemas
 *
 * Zod schemas for validating all seed data types:
 * - LLM-generated content validation
 * - Static data validation
 * - Pipeline processing validation
 */

import { z } from 'zod'
import type { loadProcessedBatchData } from './data-loaders'

// =============================================================================
// Base schemas for common types
// =============================================================================

const slugSchema = z
	.string()
	.min(1)
	.max(48)
	.regex(/^[a-z0-9-]+$/, 'Invalid slug format')
const timestampSchema = z.string().datetime()

// =============================================================================
// LLM Output Schemas - for validating raw LLM-generated data
// =============================================================================

export const LLMEventSchema = z.object({
	title: z.string().min(1),
	subtitle: z.string().min(1),
	description: z.string().min(10),
	eventType: z.string().min(1),
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
			discountPercent: z.number().min(0.1).max(100),
		})
	),
})

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
	events: z.array(LLMEventSchema),
})

export const ProcessedEventSchema = z.object({
	...LLMEventSchema.shape,
	categories: z.array(z.string().min(1)),
	communityName: z.string(),
	communityFocusArea: z.string(),
	homeLocation: z.string(),
	originalLocation: z.string().optional(),
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
	interests: z.array(z.string().min(1)).min(1).max(5),
	location: z.string().min(1),
	networkingStyle: z.enum(['active', 'selective', 'casual']),
	spendingPower: z.enum(['low', 'medium', 'high']),
	bio: z.string().min(5),
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

// Category schema
export const categorySchema = z.object({
	name: z.string().min(1).max(100),
	slug: slugSchema,
	description: z.string().min(10).max(500).optional(),
	// subcategories: z.array(z.string().min(1).max(100)).min(1).max(20),
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
export const categoriesStaticSchema = z.array(categorySchema).min(1).max(100)
export const venuesStaticSchema = z.record(
	z
		.string()
		.min(1), // city name
	z
		.array(z.string().min(1).max(200))
		.min(1) // array of venue names
)

// =============================================================================
// Final Pipeline Schema - for validating complete processed data
// =============================================================================

export const processedDataSchema = z.object({
	locations: locationsStaticSchema,
	venues: venuesStaticSchema,
	categories: categoriesStaticSchema,
	communities: z.array(LLMCommunitySchema).min(1),
	users: z.array(LLMUserPersonaSchema).min(1),
	eventsByCity: z.record(z.string(), z.array(ProcessedEventSchema)),
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

export type Category = z.infer<typeof categorySchema>

export type ProcessedData = z.infer<typeof processedDataSchema>
export type BatchProcessedData = ReturnType<typeof loadProcessedBatchData>
