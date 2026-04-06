/**
 * Seed Profiles
 *
 * Predefined configurations for different seeding scenarios.
 * SEED_PROFILE env var selects the profile; individual env vars override.
 */

import { z } from 'zod'

export interface SeedProfile {
	name: string
	description: string
	numUsers: number
	numCommunities: number
	useLlm: boolean
	estimatedTimeSeconds: number
	estimatedCostUsd: number
}

const profiles: Record<string, SeedProfile> = {
	dev: {
		name: 'dev',
		description: 'Fast local development — no LLM, minimal data',
		numUsers: 20,
		numCommunities: 10,
		useLlm: false,
		estimatedTimeSeconds: 5,
		estimatedCostUsd: 0,
	},
	demo: {
		name: 'demo',
		description: 'Demo environment — LLM-generated, moderate data',
		numUsers: 50,
		numCommunities: 25,
		useLlm: true,
		estimatedTimeSeconds: 60,
		estimatedCostUsd: 0.3,
	},
	full: {
		name: 'full',
		description: 'Production-like — LLM-generated, full dataset',
		numUsers: 600,
		numCommunities: 420,
		useLlm: true,
		estimatedTimeSeconds: 300,
		estimatedCostUsd: 3.5,
	},
	stress: {
		name: 'stress',
		description: 'Stress testing — no LLM, maximum volume',
		numUsers: 5000,
		numCommunities: 2000,
		useLlm: false,
		estimatedTimeSeconds: 900,
		estimatedCostUsd: 0,
	},
}

/**
 * Resolve the active seed profile.
 * Individual env vars (NUM_USERS, NUM_COMMUNITIES, USE_LLM) override profile defaults.
 */
export function resolveProfile(): {
	profile: SeedProfile
	overrides: Record<string, string>
} {
	const profileName = process.env.SEED_PROFILE ?? 'dev'
	const profile = profiles[profileName]

	if (!profile) {
		throw new Error(
			`Unknown SEED_PROFILE="${profileName}". Valid: ${Object.keys(profiles).join(', ')}`
		)
	}

	const overrides: Record<string, string> = {}

	// Check for individual overrides
	if (process.env.NUM_USERS !== undefined) {
		overrides.NUM_USERS = process.env.NUM_USERS
	}
	if (process.env.NUM_COMMUNITIES !== undefined) {
		overrides.NUM_COMMUNITIES = process.env.NUM_COMMUNITIES
	}
	if (process.env.USE_LLM !== undefined) {
		overrides.USE_LLM = process.env.USE_LLM
	}

	return { profile, overrides }
}

/**
 * Apply profile defaults to process.env BEFORE config parsing.
 * Individual env vars take precedence over profile defaults.
 */
export function applyProfileDefaults(): SeedProfile {
	const { profile, overrides } = resolveProfile()

	// Set defaults from profile — only if not already set via env
	if (process.env.NUM_USERS === undefined) {
		process.env.NUM_USERS = String(profile.numUsers)
	}
	if (process.env.NUM_COMMUNITIES === undefined) {
		process.env.NUM_COMMUNITIES = String(profile.numCommunities)
	}
	if (process.env.USE_LLM === undefined) {
		process.env.USE_LLM = String(profile.useLlm)
	}

	if (Object.keys(overrides).length > 0) {
		console.log(
			`Seed profile: ${profile.name} (with overrides: ${Object.entries(
				overrides
			)
				.map(([k, v]) => `${k}=${v}`)
				.join(', ')})`
		)
	} else {
		console.log(`Seed profile: ${profile.name} — ${profile.description}`)
	}

	return profile
}

export { profiles as SEED_PROFILES }
