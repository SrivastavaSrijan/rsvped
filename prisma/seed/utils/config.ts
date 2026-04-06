/**
 * Seed Configuration
 *
 * Centralized configuration management for the seed system.
 * All environment variables and constants are defined here.
 */

import { z } from 'zod'
import { applyProfileDefaults } from './profiles'

// Apply profile defaults BEFORE config parsing
applyProfileDefaults()

// Environment schema validation
const envSchema = z.object({
	// Database
	DATABASE_URL: z.string().url().optional(),

	// Seed configuration
	NUM_USERS: z.coerce.number().min(1).max(10000).default(600),
	NUM_COMMUNITIES: z.coerce.number().min(1).max(1000).default(420),
	EXTRA_STANDALONE_EVENTS: z.coerce.number().min(0).max(5000).default(0),
	MIN_EVENTS_PER_CITY: z.coerce.number().min(1).max(100).default(8),
	MAX_COLLABORATORS: z.coerce.number().min(0).max(10).default(4),

	// Feature flags
	USE_LLM: z
		.enum(['true', 'false'])
		.default('true')
		.transform((val) => val === 'true'),
	SHOULD_WIPE: z
		.enum(['true', 'false'])
		.default('true')
		.transform((val) => val === 'true'),

	// Seed profiles
	SEED_PROFILE: z.enum(['dev', 'demo', 'full', 'stress']).default('dev'),

	// Cost budget
	SEED_BUDGET_USD: z.coerce.number().min(0).default(5),

	// Dry run mode — validates output without DB writes
	SEED_DRY_RUN: z
		.enum(['true', 'false'])
		.default('false')
		.transform((val) => val === 'true'),

	// Logging
	LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

	// External APIs
	ANTHROPIC_API_KEY: z.string().optional(),
	UNSPLASH_ACCESS_KEY: z.string().optional(),
	UNSPLASH_COLLECTION_ID: z.string().default('j7hIPPKdCOU'),

	// Performance
	MAX_CONCURRENT_OPERATIONS: z.coerce.number().min(1).max(100).default(10),
	BATCH_SIZE: z.coerce.number().min(1).max(1000).default(100),
})

// Parse and validate environment
function getConfig() {
	try {
		const parsed = envSchema.parse(process.env)

		// Validate ANTHROPIC_API_KEY when LLM is enabled
		if (parsed.USE_LLM && !parsed.ANTHROPIC_API_KEY) {
			console.warn(
				'Warning: USE_LLM=true but ANTHROPIC_API_KEY is not set. LLM generation will be skipped.'
			)
		}

		return parsed
	} catch (error) {
		console.error('Invalid environment configuration:')
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
	staticDir: './prisma/seed/data',
	cacheDir: './prisma/.local/seed-data/cache',
	logsDir: './prisma/.local/logs',
	testAccountsFile: './prisma/.local/test-accounts.json',
	pipelineStateFile: './prisma/.local/pipeline-state.json',
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
