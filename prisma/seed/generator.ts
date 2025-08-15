/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
/** biome-ignore-all lint/suspicious/noConsole: its fine */
// @ts-nocheck

import fs from 'node:fs'
import path from 'node:path'
import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { Together } from 'together-ai'
import * as z from 'zod'

// --- ENSURE SEED-DATA / SEED-LOGS DIRECTORIES EXIST ---
const SEED_DATA_DIR = './.local/seed-data'
const SEED_LOGS_DIR = '../.local/seed-data'
for (const dir of [SEED_DATA_DIR, SEED_LOGS_DIR]) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

// --- LLM CONFIGURATION -------------------------------------
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY || '' })
const LLM_MODEL = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
const USE_LLM = process.env.USE_LLM !== 'false' // Default to true unless explicitly disabled

// --- CONFIG ---
const NUM_COMMUNITIES = 50
const BATCH_SIZE = 10 // Generate 10 communities per batch for better context
const RETRIES = 3 // Number of retries for LLM calls

// DB client (optional reads for context)
const prisma = new PrismaClient()

// --- SCHEMAS -------------------------------------

// Community schema with nested events
const CommunitySchema = z.object({
	name: z.string(),
	description: z.string(),
	focusArea: z.string(),
	targetAudience: z.string(),
	membershipStyle: z.enum(['open', 'invite-only', 'application-based']),
	homeLocation: z.string(),
	membershipTiers: z.array(
		z.object({
			name: z.string(),
			description: z.string(),
			priceCents: z.number().nullable(),
			benefits: z.array(z.string()),
		})
	),
	eventTypes: z.array(z.string()),
	categories: z.array(z.string()),
	events: z.array(
		z.object({
			title: z.string(),
			subtitle: z.string(),
			description: z.string(),
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
			targetCapacity: z.number(),
			isPaid: z.boolean(),
			ticketTiers: z.array(
				z.object({
					name: z.string(),
					description: z.string(),
					priceCents: z.number(),
					capacity: z.number().nullable(),
				})
			),
			promoCodes: z.array(
				z.object({
					code: z.string(),
					description: z.string(),
					discountPercent: z.number().min(1).max(100),
				})
			),
		})
	),
})

const CommunityBatchSchema = z.object({
	communities: z.array(CommunitySchema),
})

// Users schema (LLM personas)
const UserPersonaSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	profession: z.string(),
	industry: z.string(),
	experienceLevel: z.enum(['junior', 'mid', 'senior', 'executive']),
	interests: z.array(z.string()),
	location: z.string(),
	networkingStyle: z.enum(['active', 'selective', 'casual']),
	spendingPower: z.enum(['low', 'medium', 'high']),
	bio: z.string(),
})
const UserBatchSchema = z.object({ users: z.array(UserPersonaSchema) })

// --- HELPER FUNCTIONS -------------------------------------

// Converts Zod schema to JSON schema for Together API
function zodToJsonSchema(schema) {
	if (!schema) return {}

	try {
		return z.toJSONSchema(schema)
	} catch (e) {
		console.error('Error converting Zod schema to JSON schema:', e)
		return {}
	}
}

// --- LLM CALL WITH RETRIES -------------------------------------
async function callLLMWithRetry(prompt, schema, systemPrompt) {
	if (!USE_LLM) {
		console.log('LLM is disabled. Returning empty result.')
		return null
	}

	const jsonSchema = zodToJsonSchema(schema)

	for (let attempt = 1; attempt <= RETRIES; attempt++) {
		try {
			console.log(`LLM attempt ${attempt}/${RETRIES}`)

			const response = await together.chat.completions.create({
				model: LLM_MODEL,
				messages: [
					{
						role: 'system',
						content:
							systemPrompt ||
							'Only respond in JSON format matching the provided schema.',
					},
					{ role: 'user', content: prompt },
				],
				response_format: { type: 'json_object', schema: jsonSchema },
				max_tokens: 4000,
				temperature: 0.7,
			})

			const content = response.choices[0].message.content
			return JSON.parse(content)
		} catch (error) {
			console.warn(`LLM attempt ${attempt} failed:`, error.message || error)

			if (attempt === RETRIES) {
				throw new Error(`Failed after ${RETRIES} attempts: ${error.message}`)
			}

			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, 2000))
		}
	}
}

// --- MAIN GENERATOR FUNCTIONS -------------------------------------

// Location data to provide context to the LLM (prefer DB)
async function loadLocations() {
	// Prefer richer static JSON for diversity

	try {
		const rows = await prisma.location.findMany({
			select: {
				id: true,
				name: true,
				country: true,
				continent: true,
				timezone: true,
			},
			orderBy: { name: 'asc' },
		})
		if (rows.length) return rows
	} catch (e) {
		console.warn(
			'Could not load locations from DB. Falling back to minimal set.',
			e
		)
	}
	return []
}

// Generate community data with LLM
async function generateCommunitiesWithLLM() {
	console.log('🌱 Generating community data with LLM...')

	const locations = await loadLocations()
	const locationNames = locations.map((l) => l.name)

	// Check for existing cached data
	const allExistingCommunities = loadAllCachedCommunities()
	console.log(
		`Found ${allExistingCommunities.length} existing communities in cache`
	)

	if (allExistingCommunities.length >= NUM_COMMUNITIES) {
		console.log('✅ Using existing cached communities')
		return allExistingCommunities.slice(0, NUM_COMMUNITIES)
	}

	// Generate remaining communities
	const remainingCount = NUM_COMMUNITIES - allExistingCommunities.length
	const batches = Math.ceil(remainingCount / BATCH_SIZE)
	const newCommunities = []

	for (let batch = 0; batch < batches; batch++) {
		const batchSize = Math.min(BATCH_SIZE, remainingCount - batch * BATCH_SIZE)
		console.log(
			`🔄 Generating batch ${batch + 1}/${batches} (${batchSize} communities)...`
		)

		const cacheFile = path.join(
			SEED_LOGS_DIR,
			`communities-batch-${Date.now()}.json`
		)

		// Create a focused prompt for this batch
		const batchLocationNames = faker.helpers.arrayElements(
			locationNames,
			Math.min(batchSize * 2, locationNames.length)
		)
		const prompt = createCommunityPrompt(batchSize, batchLocationNames)
		const systemPrompt = createCommunitySystemPrompt()

		try {
			const result = await callLLMWithRetry(
				prompt,
				CommunityBatchSchema,
				systemPrompt
			)

			if (result?.communities && result.communities.length > 0) {
				// Validate with Zod
				const validation = CommunityBatchSchema.safeParse(result)

				if (validation.success) {
					// Save to cache file
					fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2))
					newCommunities.push(...result.communities)
					console.log(
						`✅ Generated ${result.communities.length} communities in batch ${batch + 1}`
					)
				} else {
					console.error('❌ Validation failed:', validation.error)
					// Create an empty cache file to avoid re-attempting this batch
					fs.writeFileSync(
						cacheFile,
						JSON.stringify({ communities: [] }, null, 2)
					)
				}
			} else {
				console.warn('⚠️ No communities in LLM response')
				// Create an empty cache file to avoid re-attempting this batch
				fs.writeFileSync(
					cacheFile,
					JSON.stringify({ communities: [] }, null, 2)
				)
			}
		} catch (error) {
			console.error(`❌ Failed to generate batch ${batch + 1}:`, error)
			// Create an empty cache file to avoid re-attempting this batch
			fs.writeFileSync(cacheFile, JSON.stringify({ communities: [] }, null, 2))
		}

		// Wait between batches to avoid rate limits
		if (batch < batches - 1) {
			await new Promise((resolve) => setTimeout(resolve, 2000))
		}
	}

	// Combine existing and new communities
	const allCommunities = dedupeCommunitiesByName([
		...allExistingCommunities,
		...newCommunities,
	])
	console.log(`✅ Total communities: ${allCommunities.length}`)

	return allCommunities.slice(0, NUM_COMMUNITIES)
}

// Load all cached communities from disk
function loadAllCachedCommunities() {
	const communities = []

	try {
		for (const dir of [SEED_LOGS_DIR, SEED_DATA_DIR]) {
			if (!fs.existsSync(dir)) continue
			const files = fs.readdirSync(dir)
			for (const file of files) {
				if (file.startsWith('communities-batch-') && file.endsWith('.json')) {
					try {
						const data = JSON.parse(
							fs.readFileSync(path.join(dir, file), 'utf8')
						)
						if (data.communities && Array.isArray(data.communities)) {
							communities.push(...data.communities)
						}
					} catch (e) {
						console.warn(`Could not parse file ${file}:`, e)
					}
				}
			}
		}
	} catch (e) {
		console.warn(`Error reading seed data directory:`, e)
	}

	return dedupeCommunitiesByName(communities)
}

// Create a rich prompt for community generation
function createCommunityPrompt(batchSize, locationNames) {
	return `Generate exactly ${batchSize} DIVERSE and REALISTIC communities for an event management platform.

REQUIREMENTS:
1. Each community MUST have a unique name and focus area
2. Each community must be based in one of these locations: ${locationNames.join(', ')}
3. Create 2-5 events for each community that make sense for their location and focus area
4. Events should have realistic venue names for their cities
5. Include realistic ticket pricing and membership tiers appropriate for the community type
6. Ensure descriptions are detailed but concise (2-3 sentences)

CREATE DIVERSE COMMUNITIES TYPES LIKE:
- Professional networks for specific industries
- Hobby and interest groups (art, music, coding, gaming)
- Educational communities (workshops, courses)
- Cultural/language exchange groups
- Networking groups for specific demographics
- Industry associations and professional development

The response should be a valid JSON object following the provided schema.`
}

// System prompt for community generation
function createCommunitySystemPrompt() {
	return `You are an expert event organizer who understands different community types across the world.
Only respond with a valid JSON object matching the required schema.
Create realistic, diverse communities with appropriate events, pricing, and membership structures.
Each community should feel distinct and authentic to its location and focus area.
Do not use generic placeholder names like "Tech Hub" or "Creative Space".`
}

// --- USERS GENERATION -------------------------------------

function createUserPrompt(batchSize, locationNames) {
	return `Generate exactly ${batchSize} realistic professional personas for an event platform.

REQUIREMENTS:
1. Each person MUST have their location selected from this list: ${locationNames.join(', ')}
2. Create DIVERSE profiles across industries, experiences (junior/mid/senior/executive), and networking styles
3. Use realistic first and last names for the specified locations
4. Keep bio to a single concise sentence

Return a JSON object with a "users" array following the provided schema.`
}

function createUserSystemPrompt() {
	return `You are generating diverse, realistic user personas for an event platform. 
Only respond with a valid JSON object matching the provided schema.`
}

function loadAllCachedUsers() {
	const users = []
	try {
		for (const dir of [SEED_LOGS_DIR, SEED_DATA_DIR]) {
			if (!fs.existsSync(dir)) continue
			const files = fs.readdirSync(dir)
			for (const file of files) {
				if (file.startsWith('users-batch-') && file.endsWith('.json')) {
					try {
						const data = JSON.parse(
							fs.readFileSync(path.join(dir, file), 'utf8')
						)
						if (data.users && Array.isArray(data.users)) {
							users.push(...data.users)
						}
					} catch (e) {
						console.warn(`Could not parse file ${file}:`, e)
					}
				}
			}
		}
	} catch (e) {
		console.warn('Error reading cached users:', e)
	}
	return dedupeUsersByName(users)
}

async function generateUsersWithLLM(targetCount = 300) {
	console.log('🌱 Generating users data with LLM...')
	const locations = await loadLocations()
	const locationNames = locations.map((l) => l.name)

	const existing = loadAllCachedUsers()
	console.log(`Found ${existing.length} existing users in cache`)

	const remaining = Math.max(0, targetCount - existing.length)
	if (remaining <= 0) {
		console.log('✅ No additional users needed')
		return existing.slice(0, targetCount)
	}

	const batches = Math.ceil(remaining / Math.max(10, Math.min(50, remaining)))
	const perBatch = Math.ceil(remaining / batches)
	const newUsers: any[] = []

	for (let i = 0; i < batches; i++) {
		const size = Math.min(
			perBatch,
			targetCount - (existing.length + newUsers.length)
		)
		if (size <= 0) break
		console.log(
			`🔄 Generating user batch ${i + 1}/${batches} (${size} users)...`
		)

		const batchLocationNames = faker.helpers.arrayElements(
			locationNames,
			Math.min(10, locationNames.length)
		)
		const prompt = createUserPrompt(size, batchLocationNames)
		const systemPrompt = createUserSystemPrompt()
		const cacheFile = path.join(SEED_LOGS_DIR, `users-batch-${Date.now()}.json`)

		try {
			const result = await callLLMWithRetry(
				prompt,
				UserBatchSchema,
				systemPrompt
			)
			if (result && Array.isArray(result.users)) {
				const parsed = UserBatchSchema.safeParse(result)
				if (parsed.success) {
					const cleaned = dedupeUsersByName(parsed.data.users)
					fs.writeFileSync(
						cacheFile,
						JSON.stringify({ users: cleaned }, null, 2)
					)
					newUsers.push(...cleaned)
					console.log(`✅ Generated ${cleaned.length} users in batch ${i + 1}`)
				} else {
					console.error('❌ User batch validation failed:', parsed.error)
					fs.writeFileSync(cacheFile, JSON.stringify({ users: [] }, null, 2))
				}
			} else {
				console.warn('⚠️ No users in LLM response')
				fs.writeFileSync(cacheFile, JSON.stringify({ users: [] }, null, 2))
			}
		} catch (e) {
			console.error(
				'❌ Failed generating user batch:',
				(e as any)?.message || e
			)
			fs.writeFileSync(cacheFile, JSON.stringify({ users: [] }, null, 2))
		}

		if (i < batches - 1) {
			await new Promise((r) => setTimeout(r, 1000))
		}
	}

	const all = dedupeUsersByName([...existing, ...newUsers])
	console.log(`✅ Total users cached: ${all.length}`)
	return all.slice(0, targetCount)
}

// --- DEDUPERS -------------------------------------
function dedupeCommunitiesByName(list: any[]) {
	const seen = new Set<string>()
	const out: any[] = []
	for (const c of list) {
		const key = `${(c?.name || '').toLowerCase().trim()}|${(c?.homeLocation || '').toLowerCase().trim()}`
		if (!c?.name || seen.has(key)) continue
		seen.add(key)
		out.push(c)
	}
	return out
}

function dedupeUsersByName(list: any[]) {
	const seen = new Set<string>()
	const out: any[] = []
	for (const u of list) {
		const key = `${(u?.firstName || '').toLowerCase().trim()} ${(u?.lastName || '').toLowerCase().trim()}|${(u?.location || '').toLowerCase().trim()}`
		if (!u?.firstName || !u?.lastName || seen.has(key)) continue
		seen.add(key)
		out.push(u)
	}
	return out
}

// --- MAIN EXECUTION -------------------------------------
async function main() {
	try {
		// Generate all community data
		const communities = await generateCommunitiesWithLLM()
		// Generate users as well
		const users = await generateUsersWithLLM(
			parseInt(process.env.NUM_USERS || '300', 10)
		)

		// Write summary file with all communities
		fs.writeFileSync(
			path.join(SEED_LOGS_DIR, 'all-communities.json'),
			JSON.stringify({ communities }, null, 2)
		)
		fs.writeFileSync(
			path.join(SEED_LOGS_DIR, 'all-users.json'),
			JSON.stringify({ users }, null, 2)
		)

		console.log(
			'✅ Generated community data saved to:',
			path.join(SEED_LOGS_DIR, 'all-communities.json')
		)
		console.log(
			'✅ Generated users data saved to:',
			path.join(SEED_LOGS_DIR, 'all-users.json')
		)
	} catch (error) {
		console.error('❌ Generator failed:', error)
		process.exit(1)
	}
}

// Run if executed directly
if (require.main === module) {
	main().finally(async () => {
		try {
			await prisma.$disconnect()
		} catch {}
	})
}

// Export for use in seed.ts
export {
	generateCommunitiesWithLLM,
	loadAllCachedCommunities,
	generateUsersWithLLM,
	loadAllCachedUsers,
}
