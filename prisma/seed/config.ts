/**
 * Seed Configuration
 *
 * Centralized configuration management for the seed system.
 * All environment variables and constants are defined here.
 */

import { z } from 'zod'

// Environment schema validation
const envSchema = z.object({
	// Database
	DATABASE_URL: z.string().url().optional(),

	// Seed configuration
	NUM_USERS: z.coerce.number().min(1).max(10000).default(300),
	NUM_COMMUNITIES: z.coerce.number().min(1).max(1000).default(50),
	EXTRA_STANDALONE_EVENTS: z.coerce.number().min(0).max(5000).default(100),
	MIN_EVENTS_PER_CITY: z.coerce.number().min(1).max(100).default(15),

	// Feature flags
	USE_LLM: z
		.enum(['true', 'false'])
		.default('true')
		.transform((val) => val === 'true'),
	USE_BATCH_LOADER: z
		.enum(['true', 'false'])
		.default('true')
		.transform((val) => val === 'true'),
	SHOULD_WIPE: z
		.enum(['true', 'false'])
		.default('false')
		.transform((val) => val === 'true'),

	// Logging
	LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

	// External APIs
	UNSPLASH_ACCESS_KEY: z.string().optional(),
	UNSPLASH_COLLECTION_ID: z.string().default('j7hIPPKdCOU'),

	// Performance
	MAX_CONCURRENT_OPERATIONS: z.coerce.number().min(1).max(100).default(10),
	BATCH_SIZE: z.coerce.number().min(1).max(1000).default(100),
})

// Parse and validate environment
function getConfig() {
	try {
		return envSchema.parse(process.env)
	} catch (error) {
		console.error('❌ Invalid environment configuration:')
		if (error instanceof z.ZodError) {
			for (const issue of error.issues) {
				console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
			}
		}
		process.exit(1)
	}
}

// Export validated configuration
export const config = getConfig()

// Seed data paths
export const paths = {
	dataDir: './prisma/.local/seed-data',
	batchesDir: './prisma/.local/seed-data/batches',
	processedDir: './prisma/.local/seed-data/processed',
	staticDir: './prisma/.local/seed-data/static',
	logsDir: './prisma/.local/logs',
} as const

// Event generation limits
export const limits = {
	maxEventsPerCommunity: 15,
	maxTicketTiersPerEvent: 4,
	maxPromoCodesPerEvent: 4,
	maxRegQuestionsPerEvent: 5,
	maxCollaboratorsPerEvent: 4,
	maxCategories: 30,
	maxUnsplashImages: 400,
} as const

// Type exports
export type Config = typeof config
export type Paths = typeof paths
export type Limits = typeof limits
