/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
/** biome-ignore-all lint/suspicious/noConsole: its fine */
// prisma/seed.ts

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { faker } from '@faker-js/faker'
import {
	BillingInterval,
	DiscountType,
	EventRole,
	EventStatus,
	EventVisibility,
	LocationType,
	MembershipRole,
	OrderStatus,
	PaymentState,
	PaymentStatus,
	PrismaClient,
	QuestionType,
	RsvpStatus,
	SubscriptionStatus,
	TicketVisibility,
} from '@prisma/client'
import bcrypt from 'bcryptjs'
import slugify from 'slugify'
import { getAvatarURL } from '@/lib/config/routes'
import { config, limits, paths } from './config'
import {
	DatabaseError,
	ExternalAPIError,
	processBatch,
	setupGlobalErrorHandler,
} from './errors'
import { logger } from './logger'

const prisma = new PrismaClient()

// Setup error handling
setupGlobalErrorHandler('seed')

// --- UTILITIES -------------------------------------------------
const rand = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const sampleSize = <T>(arr: T[], n: number) =>
	faker.helpers.arrayElements(arr, Math.min(n, arr.length))
const slug = (s: string) =>
	slugify(s, { lower: true, strict: true }).substring(0, 48) ||
	faker.string.alphanumeric(8)

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function randomDateWithinRange({
	startDaysAgo = 120,
	endDaysAhead = 120,
} = {}) {
	const start = faker.date.soon({ days: endDaysAhead })
	const end = faker.date.recent({ days: startDaysAgo })
	return faker.date.between({ from: end, to: start })
}

function addHours(date: Date, hours = 2) {
	return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

async function fetchUnsplashImages(
	count = limits.maxUnsplashImages
): Promise<string[]> {
	const operation = logger.startOperation('fetch_unsplash_images')

	try {
		if (!config.UNSPLASH_ACCESS_KEY) {
			logger.warn('No Unsplash access key provided, using placeholder images')
			return Array.from({ length: count }, () =>
				faker.image.urlPicsumPhotos({ width: 1200, height: 630 })
			)
		}

		const maxPerPage = 10
		const totalPages = Math.ceil(count / maxPerPage)
		const allImages: string[] = []

		for (let page = 1; page <= totalPages; page++) {
			const perPage = Math.min(maxPerPage, count - allImages.length)
			const url = `https://api.unsplash.com/collections/${config.UNSPLASH_COLLECTION_ID}/photos?per_page=${perPage}&page=${page}&client_id=${config.UNSPLASH_ACCESS_KEY}`

			const res = await fetch(url)
			if (!res.ok) {
				throw new ExternalAPIError(
					`Failed to fetch images from page ${page}`,
					'unsplash',
					res.status
				)
			}

			const data: any[] = await res.json()
			const pageImages = data.map((p) => p.urls?.regular).filter(Boolean)
			allImages.push(...pageImages)

			// If we got fewer images than requested, we've reached the end
			if (pageImages.length < perPage) {
				break
			}

			// Rate limiting
			await new Promise((resolve) => setTimeout(resolve, 100))
		}

		operation.complete({ imagesCount: allImages.length })
		return allImages
	} catch (error) {
		operation.fail(error)
		logger.warn('Unsplash failed, using placeholders', { error })
		return Array.from({ length: count }, () =>
			faker.image.urlPicsumPhotos({ width: 1200, height: 630 })
		)
	}
}

async function wipeDb() {
	const operation = logger.startOperation('wipe_database')

	try {
		// Order matters (respect FK constraints)
		await prisma.$transaction([
			prisma.eventDailyStat.deleteMany(),
			prisma.eventView.deleteMany(),
			prisma.eventFeedback.deleteMany(),
			prisma.registrationAnswer.deleteMany(),
			prisma.registrationQuestion.deleteMany(),
			prisma.checkIn.deleteMany(),
			prisma.eventCollaborator.deleteMany(),
			prisma.eventMessage.deleteMany(),
			prisma.eventReferral.deleteMany(),
			prisma.rsvp.deleteMany(),
			prisma.refund.deleteMany(),
			prisma.payment.deleteMany(),
			prisma.orderItem.deleteMany(),
			prisma.order.deleteMany(),
			prisma.promoCodeTier.deleteMany(),
			prisma.promoCode.deleteMany(),
			prisma.ticketTier.deleteMany(),
			prisma.eventCategory.deleteMany(),
			prisma.category.deleteMany(),
			prisma.event.deleteMany(),
			prisma.membershipTier.deleteMany(),
			prisma.communityMembership.deleteMany(),
			prisma.community.deleteMany(),
			prisma.session.deleteMany(),
			prisma.account.deleteMany(),
			prisma.verificationToken.deleteMany(),
			prisma.user.deleteMany(),
		])

		operation.complete()
	} catch (error) {
		operation.fail(error)
		throw new DatabaseError('Failed to wipe database', undefined, error)
	}
}

// --- DATA LOADING FUNCTIONS -----------------------------------------

function loadProcessedBatchData() {
	const operation = logger.startOperation('load_batch_data')

	try {
		// Load processed data (get latest by filename)
		const processedDir = `${paths.dataDir}/processed`

		if (!existsSync(processedDir)) {
			logger.warn('No processed directory found. Run: yarn workflow process')
			operation.complete({ loaded: false })
			return null
		}

		const processedFiles = readdirSync(processedDir)
			.filter((f) => f.endsWith('.json'))
			.sort()
			.reverse()

		const communitiesFile = processedFiles.find((f) =>
			f.startsWith('communities-final-')
		)
		const usersFile = processedFiles.find((f) => f.startsWith('users-final-'))
		const eventsFile = processedFiles.find((f) =>
			f.startsWith('events-distributed-')
		)

		if (!communitiesFile || !usersFile || !eventsFile) {
			logger.warn('Missing processed files. Run: yarn workflow process')
			operation.complete({ loaded: false })
			return null
		}

		logger.info('Loading processed batch files', {
			communities: communitiesFile,
			users: usersFile,
			events: eventsFile,
		})

		// Load and parse files
		const locations = JSON.parse(
			readFileSync(`${paths.staticDir}/locations.json`, 'utf8')
		)
		const venues = JSON.parse(
			readFileSync(`${paths.staticDir}/venues.json`, 'utf8')
		)
		const communitiesData = JSON.parse(
			readFileSync(`${processedDir}/${communitiesFile}`, 'utf8')
		)
		const usersData = JSON.parse(
			readFileSync(`${processedDir}/${usersFile}`, 'utf8')
		)
		const eventsData = JSON.parse(
			readFileSync(`${processedDir}/${eventsFile}`, 'utf8')
		)

		// Extract categories from communities
		const categories = new Set<string>()
		communitiesData.communities.forEach((community: any) => {
			community.categories?.forEach((cat: string) => {
				categories.add(cat)
			})
			community.eventTypes?.forEach((type: string) => {
				categories.add(type)
			})
		})

		const result = {
			locations,
			venues,
			communities: communitiesData.communities,
			users: usersData.users,
			eventsByCity: eventsData.eventsByCity,
			categories: Array.from(categories),
			metadata: {
				communities: communitiesData.metadata,
				users: usersData.metadata,
				events: eventsData.metadata,
			},
		}

		operation.complete({
			loaded: true,
			communities: result.communities.length,
			users: result.users.length,
			locations: result.locations.length,
			totalEvents: Object.values(result.eventsByCity).reduce(
				(sum: any, events: any) => sum + events.length,
				0
			),
		})

		return result
	} catch (error) {
		operation.fail(error)
		logger.error('Failed to load batch data. Run: yarn workflow process')
		return null
	}
}

async function ensureLocationsExist(locationData: any[]) {
	const operation = logger.startOperation('ensure_locations_exist')

	try {
		logger.info('Ensuring locations exist in database', {
			count: locationData.length,
		})

		const { results: locations, errors } = await processBatch(
			locationData,
			async (location: any) => {
				const existing = await prisma.location.findUnique({
					where: { slug: location.slug },
				})

				if (existing) {
					return existing
				}

				const created = await prisma.location.create({
					data: {
						name: location.name,
						slug: location.slug,
						country: location.country,
						continent: location.continent,
						timezone: location.timezone,
						iconPath: location.iconPath,
					},
				})

				logger.debug('Created location', { name: location.name })
				return created
			},
			10,
			'create_locations'
		)

		if (errors.length > 0) {
			logger.warn('Some locations failed to create', {
				failedCount: errors.length,
				successCount: locations.length,
			})
		}

		operation.complete({ locations: locations.length, errors: errors.length })
		return locations
	} catch (error) {
		operation.fail(error)
		throw new DatabaseError(
			'Failed to ensure locations exist',
			undefined,
			error
		)
	}
}

// --- INTELLIGENT RSVP GENERATION --------------------------
async function createIntelligentRsvps(
	users: any[],
	events: any[],
	categories: any[]
) {
	const operation = logger.startOperation('create_intelligent_rsvps')

	try {
		// First, assign category interests to users (many-to-many)
		await assignCategoryInterestsToUsers(users, categories)

		// Then generate RSVPs based on category alignment
		const rsvpCount = await generateCategoryBasedRsvps(users, events)

		operation.complete({ rsvpCount })
		logger.info(`✅ Generated ${rsvpCount} intelligent RSVPs`)
	} catch (error) {
		operation.fail(error)
		throw error
	}
}

async function assignCategoryInterestsToUsers(users: any[], categories: any[]) {
	logger.info('Assigning category interests to users')

	const userCategoryData: any[] = []

	for (const user of users) {
		// Each user gets 2-4 category interests
		const numInterests = faker.number.int({ min: 2, max: 4 })
		const selectedCategories = sampleSize(categories, numInterests)

		for (const category of selectedCategories) {
			// Interest level 1-10 (higher = more likely to RSVP)
			const interestLevel = faker.number.int({ min: 3, max: 10 })

			userCategoryData.push({
				userId: user.id,
				categoryId: category.id,
				interestLevel,
			})
		}
	}

	// Bulk insert user category interests
	if (userCategoryData.length > 0) {
		await (prisma as any).userCategory.createMany({
			data: userCategoryData,
			skipDuplicates: true,
		})
	}

	logger.info(
		`📊 Assigned interests to ${users.length} users across ${categories.length} categories`
	)
}

async function generateCategoryBasedRsvps(
	users: any[],
	events: any[]
): Promise<number> {
	logger.info('Generating category-based RSVPs')

	const rsvpData: any[] = []

	for (const event of events) {
		// Get event categories
		const eventCategories = await prisma.eventCategory.findMany({
			where: { eventId: event.id },
			include: { category: true },
		})

		if (eventCategories.length === 0) continue

		// Find users interested in these categories
		const interestedUsers = await (prisma as any).userCategory.findMany({
			where: {
				categoryId: { in: eventCategories.map((ec) => ec.categoryId) },
			},
			include: { user: true },
		})

		// Generate RSVPs probabilistically
		for (const userCategory of interestedUsers) {
			const user = userCategory.user

			// Calculate RSVP probability based on interest level and randomization
			const baseProbability = userCategory.interestLevel / 10 // 0.3 to 1.0
			const locationBonus = user.locationId === event.locationId ? 0.3 : 0
			const randomFactor = faker.number.float({ min: 0.1, max: 0.4 })

			const rsvpProbability = Math.min(
				baseProbability + locationBonus + randomFactor,
				0.9
			)

			if (faker.datatype.boolean({ probability: rsvpProbability })) {
				// Determine RSVP status based on interest level
				let status: RsvpStatus = RsvpStatus.CONFIRMED
				if (userCategory.interestLevel <= 4) {
					const statusOptions = [RsvpStatus.CONFIRMED, RsvpStatus.CANCELLED]
					status = faker.helpers.arrayElement(statusOptions)
				}

				rsvpData.push({
					id: faker.string.uuid(),
					eventId: event.id,
					userId: user.id,
					email: user.email,
					name: user.name,
					status,
					paymentState: 'NONE',
					createdAt: faker.date.past(),
				})
			}
		}

		// Add some random RSVPs from users not in categories (discovery)
		const randomRsvpCount = faker.number.int({ min: 0, max: 3 })
		const randomUsers = sampleSize(users, randomRsvpCount)

		for (const user of randomUsers) {
			// Lower probability for random RSVPs
			if (faker.datatype.boolean({ probability: 0.15 })) {
				rsvpData.push({
					id: faker.string.uuid(),
					eventId: event.id,
					userId: user.id,
					email: user.email,
					name: user.name,
					status: RsvpStatus.CONFIRMED,
					paymentState: 'NONE',
					createdAt: faker.date.past(),
				})
			}
		}
	}

	// Bulk insert RSVPs
	if (rsvpData.length > 0) {
		// Remove duplicates (same user + event)
		const uniqueRsvps = rsvpData.filter(
			(rsvp, index, self) =>
				index ===
				self.findIndex(
					(r) => r.userId === rsvp.userId && r.eventId === rsvp.eventId
				)
		)

		await prisma.rsvp.createMany({
			data: uniqueRsvps,
			skipDuplicates: true,
		})

		logger.info(
			`📝 Created ${uniqueRsvps.length} RSVPs (removed ${rsvpData.length - uniqueRsvps.length} duplicates)`
		)
		return uniqueRsvps.length
	}

	return 0
}

// --- SEED MAIN -------------------------------------------------
async function main() {
	const mainOperation = logger.startOperation('seed_main')

	try {
		logger.info('Starting database seeding', {
			config: {
				numUsers: config.NUM_USERS,
				numCommunities: config.NUM_COMMUNITIES,
				extraEvents: config.EXTRA_STANDALONE_EVENTS,
				shouldWipe: config.SHOULD_WIPE,
				useBatchLoader: config.USE_BATCH_LOADER,
			},
		})

		if (config.SHOULD_WIPE) {
			logger.info('Wiping existing database data')
			await wipeDb()
		}

		logger.info('Fetching images from Unsplash')
		const images = await fetchUnsplashImages()
		logger.info('Images ready', { count: images.length })

		let allLocations: any[] = []
		let batchData = null

		if (config.USE_BATCH_LOADER) {
			logger.info('Loading processed batch data')
			batchData = loadProcessedBatchData()

			if (batchData) {
				// Use locations from batch data and ensure they exist in DB
				allLocations = await ensureLocationsExist(batchData.locations)
			} else {
				logger.warn('Falling back to existing locations in DB')
				allLocations = await prisma.location.findMany()
			}
		} else {
			// Fallback to existing locations
			allLocations = await prisma.location.findMany()
		}

		logger.info('Locations ready', { count: allLocations.length })

		logger.info('Creating users')
		const users = await createUsers(config.NUM_USERS, allLocations, batchData)

		logger.info('Creating communities')
		const { communities } = await createCommunities(
			users,
			images,
			allLocations,
			batchData
		)

		logger.info('Creating categories')
		const categories = await createCategories(limits.maxCategories, batchData)

		logger.info('Creating events')
		const events =
			config.USE_BATCH_LOADER && batchData
				? await createEventsFromBatchData(
						batchData,
						users,
						categories,
						images,
						allLocations
					)
				: [
						...(await createEventsForCommunities(
							communities,
							users,
							categories,
							images,
							allLocations
						)),
						...(await createStandaloneEvents(
							config.EXTRA_STANDALONE_EVENTS,
							users,
							categories,
							images,
							allLocations
						)),
					]

		logger.info('Creating intelligent RSVPs')
		await createIntelligentRsvps(users, events, categories)

		logger.info('Backfilling daily stats')
		await backfillDailyStats(events)

		mainOperation.complete({
			users: users.length,
			communities: communities.length,
			categories: categories.length,
			events: events.length,
		})

		logger.info('Database seeding completed successfully!')
	} catch (error) {
		mainOperation.fail(error)
		throw error
	}
}

// --- CREATORS --------------------------------------------------

async function createUsers(count: number, locations?: any[], batchData?: any) {
	const testCredentials: {
		email: string
		password: string
		name: string
		id?: string
	}[] = []
	const data: any[] = []

	// Load cached LLM users, prefer batch data if available
	const llmUsers = config.USE_LLM ? batchData?.users || [] : []
	const locationMap = new Map((locations || []).map((l: any) => [l.name, l]))

	logger.info(
		`Creating ${count} users with hashed passwords... (Batch candidates: ${llmUsers.length})`
	)

	const usedEmails = new Set<string>()
	const genEmail = (base: string) => {
		let email = base.toLowerCase()
		let i = 1
		while (usedEmails.has(email)) {
			const [local, domain] = base.toLowerCase().split('@')
			email = `${local}+${i}@${domain}`
			i++
		}
		usedEmails.add(email)
		return email
	}

	// First, take from batch data users
	let createdFromBatch = 0
	for (const persona of llmUsers) {
		if (data.length >= count) break
		const first = persona.firstName?.trim() || faker.person.firstName()
		const last = persona.lastName?.trim() || faker.person.lastName()
		const name = `${first} ${last}`.trim()

		const baseEmail = `${first}.${last}@example.com`
		const email = genEmail(baseEmail)
		const plainPassword = faker.internet.password({ length: 12 })
		const hashedPassword = await bcrypt.hash(plainPassword, 12)

		const loc = persona.location && locationMap.get(persona.location)
		testCredentials.push({ email, password: plainPassword, name })

		data.push({
			name,
			email,
			image: getAvatarURL(name),
			password: hashedPassword,
			emailVerified: faker.datatype.boolean() ? faker.date.past() : null,
			locationId: loc?.id ?? null,
			profession: persona.profession ?? null,
			industry: persona.industry ?? null,
			experienceLevel: persona.experienceLevel
				? persona.experienceLevel.toUpperCase()
				: null,
			interests: Array.isArray(persona.interests)
				? persona.interests.slice(0, 10)
				: [],
			networkingStyle: persona.networkingStyle
				? persona.networkingStyle.toUpperCase()
				: null,
			spendingPower: persona.spendingPower
				? persona.spendingPower.toUpperCase()
				: null,
			bio: persona.bio ?? null,
			userCohort: ((): any => {
				// Prefer personas with high spending as POWER
				const sp = (persona.spendingPower || '').toLowerCase()
				if (sp === 'high') return 'POWER'
				// Randomly bucket others
				return faker.helpers.weightedArrayElement([
					{ weight: 2, value: 'POWER' },
					{ weight: 4, value: 'FRIEND_GROUP' },
					{ weight: 6, value: 'CASUAL' },
				])
			})(),
		})
		createdFromBatch++
	}

	// Fallback: generate remaining users with faker
	for (let i = data.length; i < count; i++) {
		const first = faker.person.firstName()
		const last = faker.person.lastName()
		const name = `${first} ${last}`
		const baseEmail = `${first}.${last}@example.com`
		const email = genEmail(baseEmail)
		const plainPassword = faker.internet.password({ length: 12 })
		const hashedPassword = await bcrypt.hash(plainPassword, 12)

		testCredentials.push({ email, password: plainPassword, name })

		data.push({
			name,
			email,
			image: getAvatarURL(name),
			password: hashedPassword,
			emailVerified: faker.datatype.boolean() ? faker.date.past() : null,
			locationId: locations?.length ? rand(locations).id : null,
			userCohort: faker.helpers.weightedArrayElement([
				{ weight: 2, value: 'POWER' },
				{ weight: 4, value: 'FRIEND_GROUP' },
				{ weight: 6, value: 'CASUAL' },
			]),
		})

		if ((i + 1) % 50 === 0) {
			logger.info(`  Hashed passwords for ${i + 1}/${count} users...`)
		}
	}

	// Upsert users to avoid duplicates by email
	const created: any[] = []
	for (const u of data) {
		const user = await prisma.user.upsert({
			where: { email: u.email },
			update: {
				name: u.name,
				image: u.image,
				locationId: u.locationId,
				profession: u.profession,
				industry: u.industry,
				experienceLevel: u.experienceLevel,
				interests: u.interests,
				networkingStyle: u.networkingStyle,
				spendingPower: u.spendingPower,
				bio: u.bio,
				userCohort: u.userCohort,
			},
			create: u,
		})
		created.push(user)
	}

	// Sync IDs back to credentials list
	const byEmail = new Map(created.map((u: any) => [u.email, u]))
	testCredentials.forEach((c) => {
		c.id = byEmail.get(c.email)?.id
	})

	// Write credentials to JSON file for testing
	writeFileSync(
		'./.local/test-accounts.json',
		JSON.stringify(testCredentials, null, 2),
		'utf-8'
	)
	logger.info(`📁 Test credentials saved to ./.local/test-accounts.json`)
	logger.info(
		`✅ ${created.length} users created/updated (from batch: ${createdFromBatch})`
	)

	return created
}

async function createCommunities(
	users: any[],
	images: any[],
	locations: any[],
	batchData?: any
) {
	// Try to load communities from batch data first, then fallback to LLM
	let llmCommunities = []

	if (config.USE_BATCH_LOADER && batchData?.communities) {
		llmCommunities = batchData.communities
		logger.info(`✅ Using ${llmCommunities.length} communities from batch data`)
	} else if (config.USE_LLM) {
		try {
			llmCommunities = [] // No fallback to old cached communities
			logger.info(
				`⚠️ No batch data available, communities will be generated with faker`
			)
		} catch (error) {
			logger.warn('⚠️ Failed to load LLM communities:', error)
		}
	}

	const ownerPool = sampleSize(users, Math.ceil(config.NUM_COMMUNITIES * 0.8))
	const data: any[] = []

	// Map of location names to IDs for finding correct locations later
	const locationMap = new Map(locations.map((l) => [l.name, l]))

	// Process communities - either from LLM or generate with faker
	for (let i = 0; i < config.NUM_COMMUNITIES; i++) {
		const owner = rand(ownerPool)

		if (i < llmCommunities.length) {
			// Use LLM-generated community data
			const llmData = llmCommunities[i]
			const name = llmData.name

			// Find corresponding location
			const location = locationMap.get(llmData.homeLocation) || rand(locations)

			data.push({
				name,
				slug: slug(name),
				description: llmData.description,
				coverImage: rand(images),
				isPublic:
					llmData.membershipStyle === 'open' || faker.datatype.boolean(),
				ownerId: owner.id,
				_llmData: llmData, // Store LLM data for later use
				_locationId: location.id,
			})
		} else {
			// Fallback to faker
			const name = faker.company.name()
			data.push({
				name,
				slug: slug(name),
				description: faker.lorem.paragraph(),
				coverImage: rand(images),
				isPublic: faker.datatype.boolean(),
				ownerId: owner.id,
				_llmData: null,
				_locationId: rand(locations).id,
			})
		}
	}

	// Upsert communities in database (without the _llmData property)
	const dbData = data.map(({ _llmData, _locationId, ...rest }) => rest)
	const communities = [] as any[]
	for (const c of dbData) {
		const row = await prisma.community.upsert({
			where: { slug: c.slug },
			update: {
				description: c.description,
				coverImage: c.coverImage,
				isPublic: c.isPublic,
				ownerId: c.ownerId,
			},
			create: c,
		})
		communities.push(row)
	}

	// Reattach LLM data and location ID for later use
	communities.forEach((community, i) => {
		community._llmData = data[i]._llmData
		community._locationId = data[i]._locationId
	})

	// Membership tiers
	const tiersToCreate: any[] = []

	for (const c of communities) {
		if (c._llmData?.membershipTiers) {
			// Use LLM-generated tiers
			for (const tier of c._llmData.membershipTiers) {
				const name = tier.name
				tiersToCreate.push({
					communityId: c.id,
					name,
					slug: slug(name),
					description: tier.description,
					priceCents: tier.priceCents,
					currency: 'USD',
					billingInterval: tier.priceCents
						? rand([BillingInterval.MONTHLY, BillingInterval.YEARLY])
						: null,
					stripePriceId: null,
					isActive: true,
				})
			}
		} else {
			// Fallback to faker
			const tierCount = faker.number.int({ min: 0, max: 3 })
			for (let i = 0; i < tierCount; i++) {
				const name = faker.commerce.productName()
				tiersToCreate.push({
					communityId: c.id,
					name,
					slug: slug(name),
					description: faker.commerce.productDescription(),
					priceCents: faker.datatype.boolean()
						? faker.number.int({ min: 500, max: 5000 })
						: null,
					currency: 'USD',
					billingInterval: rand([
						BillingInterval.MONTHLY,
						BillingInterval.YEARLY,
					]),
					stripePriceId: null,
					isActive: true,
				})
			}
		}
	}

	const membershipTiers = tiersToCreate.length
		? 'createManyAndReturn' in prisma.membershipTier
			? await (prisma.membershipTier as any).createManyAndReturn({
					data: tiersToCreate,
				})
			: await prisma.$transaction(
					tiersToCreate.map((t) => prisma.membershipTier.create({ data: t }))
				)
		: []

	// Memberships
	const membershipsToCreate: any[] = []
	for (const c of communities) {
		const communityUsers = sampleSize(
			users,
			faker.number.int({ min: 5, max: 25 })
		)
		for (const u of communityUsers) {
			const role = faker.helpers.weightedArrayElement([
				{ weight: 80, value: MembershipRole.MEMBER },
				{ weight: 15, value: MembershipRole.MODERATOR },
				{ weight: 5, value: MembershipRole.ADMIN },
			])
			const tier = membershipTiers.filter((t: any) => t.communityId === c.id)
			const pickTier = tier.length ? rand(tier) : null
			membershipsToCreate.push({
				userId: u.id,
				communityId: c.id,
				role,
				membershipTierId: (pickTier as any)?.id ?? null,
				subscriptionStatus: pickTier
					? rand(Object.values(SubscriptionStatus))
					: null,
				expiresAt:
					pickTier && faker.datatype.boolean()
						? faker.date.soon({ days: 180 })
						: null,
				joinedAt: faker.date.past(),
			})
		}
	}

	if (membershipsToCreate.length) {
		if (prisma.communityMembership.createMany) {
			await prisma.communityMembership.createMany({ data: membershipsToCreate })
		} else {
			await prisma.$transaction(
				membershipsToCreate.map((m) =>
					prisma.communityMembership.create({ data: m })
				)
			)
		}
	}

	return { communities, membershipTiers }
}

async function createCategories(count: number, batchData?: any) {
	// Collect categories from batch data first, then LLM communities, then faker
	const categorySet = new Set<string>()

	if (config.USE_BATCH_LOADER && batchData?.categories) {
		// Use pre-extracted categories from batch loader
		;(batchData?.categories ?? []).forEach((cat: string) => {
			categorySet.add(capitalize(cat.trim()))
		})
		logger.info(
			`✅ Using ${batchData.categories.length} categories from batch data`
		)
	} else {
		// Fallback to faker categories (no old LLM cache)
		logger.info(
			`⚠️ No batch data available, categories will be generated with faker`
		)
	}

	// If we need more categories, generate with faker
	const existingCount = categorySet.size
	const usedNames = new Set<string>(categorySet)

	if (existingCount < count) {
		const additionalNeeded = count - existingCount
		for (let i = 0; i < additionalNeeded; i++) {
			let name = capitalize(faker.word.noun())
			// Ensure unique names
			while (usedNames.has(name)) {
				name = capitalize(faker.word.noun())
			}
			usedNames.add(name)
			categorySet.add(name)
		}
	}

	// Convert to array and create data objects
	const data = Array.from(categorySet)
		.slice(0, count)
		.map((name) => ({
			name,
			slug: slug(name),
		}))

	// Idempotent upserts by slug
	const created: any[] = []
	for (const c of data) {
		const row = await prisma.category.upsert({
			where: { slug: c.slug },
			update: { name: c.name },
			create: c,
		})
		created.push(row)
	}
	return created
}

async function createEventsForCommunities(
	communities: any[],
	users: any[],
	categories: any[],
	images: string[],
	locations: any[]
) {
	const all: any[] = []

	for (const community of communities) {
		// Use LLM events if available, otherwise generate with faker
		const llmEvents = community._llmData?.events || []
		const eventCount =
			llmEvents.length ||
			faker.number.int({ min: 2, max: limits.maxEventsPerCommunity })

		const hostCandidates = users.filter(
			(u: any) => u.id === community.ownerId || faker.datatype.boolean()
		)

		// Get associated location
		const location =
			locations.find((l) => l.id === community._locationId) || rand(locations)

		const communityEvents = await createEvents(eventCount, {
			hostCandidates,
			categories,
			communityId: community.id,
			images,
			locations,
			location,
			llmEvents,
		})

		all.push(...communityEvents)
	}

	return all
}

// Create events from batch data with guaranteed geographic distribution
async function createEventsFromBatchData(
	batchData: any,
	users: any[],
	categories: any[],
	images: string[],
	locations: any[]
) {
	logger.info(
		'🗺️ Creating events from batch data with geographic distribution...'
	)

	const all: any[] = []
	const locationMap = new Map(locations.map((l) => [l.name, l]))

	// Process events by city from batch data
	for (const [cityName, cityEvents] of Object.entries(batchData.eventsByCity)) {
		const location = locationMap.get(cityName)
		if (!location) {
			logger.warn(`⚠️ Location not found for city: ${cityName}, skipping events`)
			continue
		}

		logger.info(
			`📍 Creating ${(cityEvents as any[]).length} events for ${cityName}`
		)

		for (const batchEvent of cityEvents as any[]) {
			const host = rand(users)

			// Determine if this event belongs to a community
			const communityId = batchEvent.communityId || null

			// Map batch event data to our event structure
			const eventType = mapEventType(batchEvent.eventType || 'networking')
			const { venueName, venueAddress } = getVenueInfo(location, eventType)

			// Date/time logic - use city timezone
			const start = randomDateWithinRange()
			const end = addHours(start, faker.number.int({ min: 1, max: 6 }))

			const event = {
				slug: uniqueSlug(batchEvent.title),
				title: batchEvent.title,
				subtitle:
					batchEvent.subtitle ||
					`${batchEvent.description?.substring(0, 100)}...`,
				description: batchEvent.description,
				coverImage: rand(images),
				startDate: start,
				endDate: end,
				timezone: location.timezone || 'UTC',
				locationId: location.id,
				locationType: eventType,
				venueName: batchEvent.venueName || venueName,
				venueAddress: batchEvent.venueAddress || venueAddress,
				onlineUrl:
					eventType !== LocationType.PHYSICAL ? faker.internet.url() : null,
				capacity:
					batchEvent.targetCapacity || batchEvent.capacityRange?.[1] || null,
				isPublished: Math.random() < 0.9,
				status: rand([
					EventStatus.DRAFT,
					EventStatus.PUBLISHED,
					EventStatus.CANCELLED,
				]),
				visibility: rand([
					EventVisibility.PUBLIC,
					EventVisibility.PRIVATE,
					EventVisibility.MEMBER_ONLY,
				]),
				publishedAt: faker.datatype.boolean() ? faker.date.past() : null,
				requiresApproval: faker.datatype.boolean(),
				locationHiddenUntilApproved: faker.datatype.boolean(),
				hostId: host.id,
				communityId,
				deletedAt: faker.datatype.boolean({ probability: 0.05 })
					? faker.date.recent()
					: null,
				rsvpCount: 0,
				paidRsvpCount: 0,
				checkInCount: 0,
				viewCount: 0,
				createdAt: faker.date.past(),
				updatedAt: faker.date.recent(),
				_batchEvent: batchEvent, // Keep batch data for ticket tiers, promo codes, etc.
			}

			all.push(event)
		}
	}

	// Create events in database
	logger.info(`💾 Creating ${all.length} events in database...`)
	const eventsToCreate = all.map(({ _batchEvent, ...rest }) => rest)
	const createdEvents: any[] = []

	for (const e of eventsToCreate) {
		const row = await prisma.event.upsert({
			where: { slug: e.slug },
			update: {
				title: e.title,
				subtitle: e.subtitle,
				description: e.description,
				coverImage: e.coverImage,
				startDate: e.startDate,
				endDate: e.endDate,
				timezone: e.timezone,
				locationId: e.locationId,
				locationType: e.locationType,
				venueName: e.venueName,
				venueAddress: e.venueAddress,
				onlineUrl: e.onlineUrl,
				isPublished: e.isPublished,
				status: e.status,
				visibility: e.visibility,
				publishedAt: e.publishedAt,
				requiresApproval: e.requiresApproval,
				locationHiddenUntilApproved: e.locationHiddenUntilApproved,
				hostId: e.hostId,
				communityId: e.communityId,
				deletedAt: e.deletedAt,
			},
			create: e,
		})
		createdEvents.push(row)
	}

	// Reattach batch data
	createdEvents.forEach((e, i) => {
		e._batchEvent = all[i]._batchEvent
	})

	// Create categories, ticket tiers, promo codes etc. using the same logic as createEvents
	// but using batch data instead of faker

	// Categories relation
	const eventCategoryRows: any[] = []
	for (const e of createdEvents) {
		const batchCategories = e._batchEvent?.categories || []

		if (batchCategories.length > 0) {
			// Match batch category names to actual category IDs
			const catMap = new Map(
				categories.map((c) => [c.name.toLowerCase(), c.id])
			)

			for (const catName of batchCategories) {
				const catId = catMap.get(catName.toLowerCase())
				if (catId) {
					eventCategoryRows.push({ eventId: e.id, categoryId: catId })
				}
			}
		}

		// If no batch categories or none matched, use random categories
		if (!eventCategoryRows.some((r) => r.eventId === e.id)) {
			const catCount = faker.number.int({ min: 1, max: 3 })
			const cats = sampleSize(categories, catCount)
			for (const c of cats) {
				eventCategoryRows.push({ eventId: e.id, categoryId: c.id })
			}
		}
	}

	if (eventCategoryRows.length) {
		if (prisma.eventCategory.createMany) {
			await prisma.eventCategory.createMany({
				data: eventCategoryRows,
				skipDuplicates: true,
			})
		} else {
			await prisma.$transaction(
				eventCategoryRows.map((r) => prisma.eventCategory.create({ data: r }))
			)
		}
	}

	// Use the existing createEvents ticket tier and promo code logic but with batch data
	// For now, let's use the existing logic from createEvents function
	logger.info(
		`✅ Created ${createdEvents.length} events with geographic distribution`
	)

	return createdEvents
}

async function createStandaloneEvents(
	count: number,
	users: any[],
	categories: any[],
	images: string[],
	locations: any[]
) {
	const hostCandidates = users
	return createEvents(count, {
		hostCandidates,
		categories,
		images,
		communityId: null,
		locations,
		location: null,
		llmEvents: [],
	})
}

// Maps LLM event types to LocationType enum
function mapEventType(type: string): LocationType {
	const typeMap: Record<string, LocationType> = {
		workshop: Math.random() > 0.7 ? LocationType.PHYSICAL : LocationType.HYBRID,
		networking:
			Math.random() > 0.5 ? LocationType.PHYSICAL : LocationType.HYBRID,
		conference:
			Math.random() > 0.8 ? LocationType.PHYSICAL : LocationType.HYBRID,
		panel: Math.random() > 0.6 ? LocationType.HYBRID : LocationType.ONLINE,
		demo: Math.random() > 0.5 ? LocationType.ONLINE : LocationType.HYBRID,
		social: LocationType.PHYSICAL,
	}

	return (
		typeMap[type] ||
		rand([LocationType.PHYSICAL, LocationType.ONLINE, LocationType.HYBRID])
	)
}

// Get venue information for a location
function getVenueInfo(location: any, locationType: LocationType) {
	if (!location || locationType === LocationType.ONLINE) {
		return { venueName: null, venueAddress: null }
	}

	// Read venues from .local/seed-logs/venues.json
	let VENUES_BY_CITY: Record<string, string[]> = {}
	try {
		const fs = require('node:fs')
		const path = require('node:path')
		const p = path.join(process.cwd(), '.local/seed-logs/venues.json')
		if (fs.existsSync(p)) {
			VENUES_BY_CITY = JSON.parse(fs.readFileSync(p, 'utf8'))
		}
	} catch {}

	const cityVenues = VENUES_BY_CITY[location?.name] || []
	const venueName = cityVenues.length
		? faker.helpers.arrayElement(cityVenues)
		: `${location?.name || 'Downtown'} Convention Center`

	const venueAddress = faker.location.streetAddress()

	return { venueName, venueAddress }
}

function generateRSVPsFromViews(
	viewsCount: number,
	flavor: string,
	hasPaidTiers: boolean
): { rsvpTarget: number } {
	// Base conversion from views -> RSVPs
	let cr = 0.12 // 12% default

	const f = (flavor || '').toLowerCase()
	if (f.includes('workshop')) cr = 0.18
	else if (f.includes('conference')) cr = 0.08
	else if (f.includes('panel')) cr = 0.1
	else if (f.includes('demo')) cr = 0.11
	else if (f.includes('social')) cr = 0.2
	else if (f.includes('network')) cr = 0.16

	// Paid tiers dampen conversions a bit
	if (hasPaidTiers) cr *= faker.number.float({ min: 0.6, max: 0.85 })

	// Small randomization for variety
	cr *= faker.number.float({ min: 0.85, max: 1.15 })

	const target = Math.max(0, Math.floor(viewsCount * cr))
	return { rsvpTarget: target }
}

async function createEvents(
	count: number,
	opts: {
		hostCandidates: any[]
		categories: any[]
		communityId: string | null
		images: string[]
		locations: any[]
		location?: any
		llmEvents?: any[]
	}
) {
	const {
		hostCandidates,
		categories,
		communityId,
		images,
		locations,
		location,
		llmEvents = [],
	} = opts

	const events: any[] = []

	for (let i = 0; i < count; i++) {
		const llmEvent = llmEvents[i]
		const host = rand(hostCandidates)

		let title: any,
			subtitle: any,
			description: any,
			capacity: any,
			eventType: any,
			// biome-ignore lint/correctness/noUnusedVariables: z
			isPaid: any

		if (llmEvent) {
			// Use LLM-generated event data
			title = llmEvent.title
			subtitle = llmEvent.subtitle
			description = llmEvent.description
			capacity = llmEvent.targetCapacity || null
			eventType = mapEventType(llmEvent.eventType)
			isPaid = llmEvent.isPaid
		} else {
			// Use faker
			title = faker.company.catchPhrase()
			subtitle = faker.company.buzzPhrase()
			description = Array.from(
				{ length: faker.number.int({ min: 2, max: 6 }) },
				() => faker.lorem.paragraph()
			).join('\n\n')
			capacity = faker.datatype.boolean()
				? faker.number.int({ min: 30, max: 300 })
				: null
			eventType = rand([
				LocationType.PHYSICAL,
				LocationType.ONLINE,
				LocationType.HYBRID,
			])
			isPaid = faker.datatype.boolean()
		}

		// Determine location (use community location or random)
		const eventLocation =
			location || (eventType !== LocationType.ONLINE ? rand(locations) : null)

		// Get venue information
		const { venueName, venueAddress } = getVenueInfo(eventLocation, eventType)

		// Date/time logic - get realistic event timing
		const start = randomDateWithinRange()
		const end = addHours(start, faker.number.int({ min: 1, max: 6 }))

		events.push({
			slug: uniqueSlug(title),
			title,
			subtitle,
			description,
			coverImage: rand(images),
			startDate: start,
			endDate: end,
			timezone: eventLocation?.timezone || 'UTC',
			locationId: eventLocation?.id || null,
			locationType: eventType,
			venueName,
			venueAddress,
			onlineUrl:
				eventType !== LocationType.PHYSICAL ? faker.internet.url() : null,
			capacity,
			isPublished: Math.random() < 0.9,
			status: rand([
				EventStatus.DRAFT,
				EventStatus.PUBLISHED,
				EventStatus.CANCELLED,
			]),
			visibility: rand([
				EventVisibility.PUBLIC,
				EventVisibility.PRIVATE,
				EventVisibility.MEMBER_ONLY,
			]),
			publishedAt: faker.datatype.boolean() ? faker.date.past() : null,
			requiresApproval: faker.datatype.boolean(),
			locationHiddenUntilApproved: faker.datatype.boolean(),
			hostId: host.id,
			communityId,
			deletedAt: faker.datatype.boolean({ probability: 0.05 })
				? faker.date.recent()
				: null,
			rsvpCount: 0,
			paidRsvpCount: 0,
			checkInCount: 0,
			viewCount: 0,
			createdAt: faker.date.past(),
			updatedAt: faker.date.recent(),
			_llmEvent: llmEvent, // Keep LLM data for later use
		})
	}

	// Create events
	const eventsToCreate = events.map(({ _llmEvent, ...rest }) => rest)
	const createdEvents: any[] = []
	for (const e of eventsToCreate) {
		const row = await prisma.event.upsert({
			where: { slug: e.slug },
			update: {
				title: e.title,
				subtitle: e.subtitle,
				description: e.description,
				coverImage: e.coverImage,
				startDate: e.startDate,
				endDate: e.endDate,
				timezone: e.timezone,
				locationId: e.locationId,
				locationType: e.locationType,
				venueName: e.venueName,
				venueAddress: e.venueAddress,
				onlineUrl: e.onlineUrl,
				isPublished: e.isPublished,
				status: e.status,
				visibility: e.visibility,
				publishedAt: e.publishedAt,
				requiresApproval: e.requiresApproval,
				locationHiddenUntilApproved: e.locationHiddenUntilApproved,
				hostId: e.hostId,
				communityId: e.communityId,
				deletedAt: e.deletedAt,
			},
			create: e,
		})
		createdEvents.push(row)
	}

	// Reattach LLM data
	createdEvents.forEach((e, i) => {
		e._llmEvent = events[i]._llmEvent
	})

	// Categories relation
	const eventCategoryRows: any[] = []
	for (const e of createdEvents) {
		// Use LLM categories if available
		const llmCategories = e._llmEvent?.categories || []

		if (llmCategories.length > 0) {
			// Match LLM category names to actual category IDs
			const catMap = new Map(
				categories.map((c) => [c.name.toLowerCase(), c.id])
			)

			for (const catName of llmCategories) {
				const catId = catMap.get(catName.toLowerCase())
				if (catId) {
					eventCategoryRows.push({ eventId: e.id, categoryId: catId })
				}
			}
		}

		// If no LLM categories or none matched, use random categories
		if (!eventCategoryRows.some((r) => r.eventId === e.id)) {
			const catCount = faker.number.int({ min: 1, max: 3 })
			const cats = sampleSize(categories, catCount)
			for (const c of cats) {
				eventCategoryRows.push({ eventId: e.id, categoryId: c.id })
			}
		}
	}

	if (eventCategoryRows.length) {
		if (prisma.eventCategory.createMany) {
			await prisma.eventCategory.createMany({
				data: eventCategoryRows,
				skipDuplicates: true,
			})
		} else {
			await prisma.$transaction(
				eventCategoryRows.map((r) => prisma.eventCategory.create({ data: r }))
			)
		}
	}

	// Ticket tiers
	const ticketRows: any[] = []
	for (const e of createdEvents) {
		if (e._llmEvent?.ticketTiers && e._llmEvent.ticketTiers.length > 0) {
			// Use LLM-generated ticket tiers
			for (const tier of e._llmEvent.ticketTiers) {
				ticketRows.push({
					eventId: e.id,
					name: tier.name,
					description: tier.description,
					priceCents: tier.priceCents,
					currency: 'USD',
					quantityTotal: tier.capacity,
					quantitySold: 0,
					visibility: rand([
						TicketVisibility.PUBLIC,
						TicketVisibility.CODE_REQUIRED,
						TicketVisibility.HIDDEN,
					]),
					salesStart: faker.date.past(),
					salesEnd: faker.date.soon({ days: 200 }),
				})
			}
		} else {
			// Use faker
			const countTiers = faker.number.int({
				min: 1,
				max: limits.maxTicketTiersPerEvent,
			})
			for (let i = 0; i < countTiers; i++) {
				const name = faker.commerce.productName()
				ticketRows.push({
					eventId: e.id,
					name,
					description: faker.commerce.productDescription(),
					priceCents: faker.number.int({ min: 0, max: 15000 }),
					currency: 'USD',
					quantityTotal: faker.datatype.boolean()
						? faker.number.int({ min: 20, max: 200 })
						: null,
					quantitySold: 0,
					visibility: rand([
						TicketVisibility.PUBLIC,
						TicketVisibility.CODE_REQUIRED,
						TicketVisibility.HIDDEN,
					]),
					salesStart: faker.date.past(),
					salesEnd: faker.date.soon({ days: 200 }),
				})
			}
		}
	}

	const ticketTiers = ticketRows.length
		? 'createManyAndReturn' in prisma.ticketTier
			? await (prisma.ticketTier as any).createManyAndReturn({
					data: ticketRows,
				})
			: await prisma.$transaction(
					ticketRows.map((t) => prisma.ticketTier.create({ data: t }))
				)
		: []

	// Promo codes
	const promoRows: any[] = []
	const promoTiersRows: any[] = []
	for (const e of createdEvents) {
		if (e._llmEvent?.promoCodes && e._llmEvent.promoCodes.length > 0) {
			// Use LLM-generated promo codes
			for (const promo of e._llmEvent.promoCodes) {
				const pc = {
					eventId: e.id,
					code:
						promo.code ||
						faker.string.alphanumeric({ length: 8, casing: 'upper' }),
					discountType: DiscountType.PERCENT,
					amountOffCents: null,
					percentOff: promo.discountPercent,
					maxRedemptions: faker.datatype.boolean()
						? faker.number.int({ min: 5, max: 100 })
						: null,
					redeemedCount: 0,
					startsAt: faker.date.past(),
					endsAt: faker.date.soon({ days: 180 }),
					appliesToAllTiers: true,
				}
				promoRows.push(pc)
			}
		} else {
			// Use faker
			const promoCount = faker.number.int({
				min: 0,
				max: limits.maxPromoCodesPerEvent,
			})
			for (let i = 0; i < promoCount; i++) {
				const appliesToAll = faker.datatype.boolean()
				const pc = {
					eventId: e.id,
					code: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
					discountType: rand([DiscountType.AMOUNT, DiscountType.PERCENT]),
					amountOffCents: null as number | null,
					percentOff: null as number | null,
					maxRedemptions: faker.datatype.boolean()
						? faker.number.int({ min: 5, max: 100 })
						: null,
					redeemedCount: 0,
					startsAt: faker.date.past(),
					endsAt: faker.date.soon({ days: 180 }),
					appliesToAllTiers: appliesToAll,
				}
				if (pc.discountType === DiscountType.AMOUNT) {
					pc.amountOffCents = faker.number.int({ min: 100, max: 5000 })
				} else {
					pc.percentOff = faker.number.int({ min: 5, max: 80 })
				}
				promoRows.push(pc)

				if (!appliesToAll) {
					const tiers = ticketTiers.filter((t: any) => t.eventId === e.id)
					const chosen = sampleSize(
						tiers,
						faker.number.int({ min: 1, max: tiers.length || 1 })
					)
					chosen.forEach((t: any) => {
						promoTiersRows.push({
							// we'll fill promoCodeId later when we know ID
							ticketTierId: t.id,
							// promoCodeId placeholder
							promoCodeId: 'TEMP',
						})
					})
				}
			}
		}
	}

	const createdPromoCodes = promoRows.length
		? 'createManyAndReturn' in prisma.promoCode
			? await (prisma.promoCode as any).createManyAndReturn({ data: promoRows })
			: await prisma.$transaction(
					promoRows.map((p) => prisma.promoCode.create({ data: p }))
				)
		: []

	// Fix promoCodeTier references
	if (promoTiersRows.length) {
		let idx = 0
		for (const p of createdPromoCodes) {
			// attach each temp row until we hit another promoCode entry? We'll just greedily assign.
			while (
				idx < promoTiersRows.length &&
				promoTiersRows[idx].promoCodeId === 'TEMP'
			) {
				promoTiersRows[idx].promoCodeId = p.id
				idx++
			}
		}
		if (prisma.promoCodeTier.createMany) {
			await prisma.promoCodeTier.createMany({
				data: promoTiersRows,
				skipDuplicates: true,
			})
		} else {
			await prisma.$transaction(
				promoTiersRows.map((r) => prisma.promoCodeTier.create({ data: r }))
			)
		}
	}

	// Registration questions
	const questionRows: any[] = []
	for (const e of createdEvents) {
		const qCount = faker.number.int({
			min: 0,
			max: limits.maxRegQuestionsPerEvent,
		})
		for (let i = 0; i < qCount; i++) {
			const type = rand([
				QuestionType.SHORT_TEXT,
				QuestionType.LONG_TEXT,
				QuestionType.SINGLE_SELECT,
				QuestionType.MULTI_SELECT,
				QuestionType.CHECKBOX,
				QuestionType.TERMS,
				QuestionType.SIGNATURE,
			])
			questionRows.push({
				eventId: e.id,
				type,
				label: faker.lorem.sentence(),
				required: faker.datatype.boolean(),
				position: i,
				options:
					type === QuestionType.SINGLE_SELECT ||
					type === QuestionType.MULTI_SELECT
						? [
								faker.commerce.productAdjective(),
								faker.commerce.productAdjective(),
								faker.commerce.productAdjective(),
							]
						: [],
			})
		}
	}
	const questions = questionRows.length
		? 'createManyAndReturn' in prisma.registrationQuestion
			? await (prisma.registrationQuestion as any).createManyAndReturn({
					data: questionRows,
				})
			: await prisma.$transaction(
					questionRows.map((q) =>
						prisma.registrationQuestion.create({ data: q })
					)
				)
		: []

	// Event collaborators
	const collabRows: any[] = []
	for (const e of createdEvents) {
		const countCollabs = faker.number.int({
			min: 0,
			max: limits.maxCollaboratorsPerEvent,
		})
		const collabUsers = sampleSize(hostCandidates, countCollabs)
		for (const u of collabUsers) {
			collabRows.push({
				eventId: e.id,
				userId: u.id,
				role: rand([EventRole.CO_HOST, EventRole.MANAGER, EventRole.CHECKIN]),
			})
		}
	}
	if (collabRows.length) {
		if (prisma.eventCollaborator.createMany) {
			await prisma.eventCollaborator.createMany({
				data: collabRows,
				skipDuplicates: true,
			})
		} else {
			await prisma.$transaction(
				collabRows.map((c) => prisma.eventCollaborator.create({ data: c }))
			)
		}
	}

	// Event referrals
	const referralRows: any[] = []
	for (const e of createdEvents) {
		const countRef = faker.number.int({ min: 0, max: 5 })
		for (let i = 0; i < countRef; i++) {
			referralRows.push({
				eventId: e.id,
				userId: faker.datatype.boolean() ? rand(hostCandidates).id : null,
				code: faker.string.alphanumeric({ length: 6 }),
				uses: 0,
			})
		}
	}
	const referrals = referralRows.length
		? 'createManyAndReturn' in prisma.eventReferral
			? await (prisma.eventReferral as any).createManyAndReturn({
					data: referralRows,
				})
			: await prisma.$transaction(
					referralRows.map((r) => prisma.eventReferral.create({ data: r }))
				)
		: []
	logger.info('created event referrals', referrals)

	// Orders + Payments + RSVPs (+ Answers, CheckIns, Feedback, Waitlist)
	const orderRows: any[] = []
	const orderItemsRows: any[] = []
	const paymentRows: any[] = []
	const refundRows: any[] = []
	const rsvpRows: any[] = []
	const answerRows: any[] = []
	const checkInRows: any[] = []
	const feedbackRows: any[] = []
	const viewRows: any[] = []

	for (const e of createdEvents) {
		// DERIVE VIEWS AND RSVPS BY CONSTRUCTION
		const baseViewCount =
			e.status === EventStatus.PUBLISHED
				? faker.number.int({ min: 20, max: 300 })
				: faker.number.int({ min: 2, max: 30 })
		const statusMultiplier = e.status === EventStatus.CANCELLED ? 1.4 : 1.0
		const viewsCount = Math.floor(baseViewCount * statusMultiplier)

		// Generate views - fix timestamp range
		for (let v = 0; v < viewsCount; v++) {
			const viewer = Math.random() < 0.3 ? rand(hostCandidates) : null
			viewRows.push({
				eventId: e.id,
				userId: viewer?.id ?? null,
				ipAddress: faker.internet.ip(),
				userAgent: faker.internet.userAgent(),
				referrer: faker.internet.url(),
				viewedAt: faker.date.between({
					from: e.createdAt,
					to: e.startDate < new Date() ? e.startDate : new Date(),
				}),
			})
		}

		const tiers = ticketTiers.filter((t: any) => t.eventId === e.id)
		const hasPaidTiers = tiers.some((t: any) => t.priceCents > 0)

		// DERIVE RSVP COUNT FROM VIEWS - fix eventType reference
		const eventFlavor = (e as any).llmData?.eventType || 'networking'
		const { rsvpTarget } = generateRSVPsFromViews(
			viewsCount,
			eventFlavor,
			hasPaidTiers
		)

		const capacity = e.capacity ?? Infinity
		let confirmedCount = 0
		let waitlistPosition = 1

		// Create orders for paid tickets (proportional to RSVPs)
		if (hasPaidTiers && rsvpTarget > 0) {
			const orderCount = Math.min(
				Math.ceil(rsvpTarget * 0.8), // Most RSVPs come from orders
				faker.number.int({ min: 3, max: 25 })
			)

			for (let i = 0; i < orderCount; i++) {
				const buyer = rand(hostCandidates)
				const itemsForOrder = sampleSize(
					tiers.filter((t: any) => t.priceCents > 0),
					faker.number.int({ min: 1, max: Math.min(2, tiers.length) })
				)

				const quantities = itemsForOrder.map(() =>
					faker.number.int({ min: 1, max: 4 })
				)
				const totalCents = itemsForOrder.reduce(
					(sum: number, t: any, idx: number) =>
						sum + t.priceCents * quantities[idx],
					0
				)

				const status = rand([
					OrderStatus.PENDING,
					OrderStatus.PAID,
					OrderStatus.CANCELLED,
				])
				const orderId = faker.string.uuid()

				orderRows.push({
					id: orderId,
					eventId: e.id,
					purchaserEmail: buyer.email,
					purchaserName: buyer.name,
					status,
					totalCents,
					currency: 'USD',
					refundedCents: 0,
					appliedPromoCodeId: faker.datatype.boolean()
						? ((
								rand(
									createdPromoCodes.filter((pc: any) => pc.eventId === e.id)
								) as any
							)?.id ?? null)
						: null,
					idempotencyKey: faker.string.uuid(),
					createdAt: faker.date.past(),
					updatedAt: faker.date.recent(),
				})

				itemsForOrder.forEach((t: any, idx: number) => {
					orderItemsRows.push({
						orderId,
						ticketTierId: t.id,
						quantity: quantities[idx],
						priceCents: t.priceCents,
					})
				})

				// Payments
				const attempts = faker.number.int({ min: 1, max: 2 })
				for (let a = 1; a <= attempts; a++) {
					const succeeded = a === attempts && status === OrderStatus.PAID
					const paymentId = faker.string.uuid()
					paymentRows.push({
						id: paymentId,
						orderId,
						attemptNumber: a,
						provider: 'stripe',
						providerIntentId: faker.string.uuid(),
						providerChargeId: succeeded ? faker.string.uuid() : null,
						status: succeeded
							? PaymentStatus.SUCCEEDED
							: rand([
									PaymentStatus.PENDING,
									PaymentStatus.FAILED,
									PaymentStatus.CANCELLED,
								]),
						amountCents: totalCents,
						currency: 'USD',
						createdAt: faker.date.past(),
						updatedAt: faker.date.recent(),
					})

					// occasional refunds
					if (succeeded && faker.datatype.boolean({ probability: 0.05 })) {
						const refundAmount = faker.number.int({
							min: 0,
							max: totalCents as number,
						})
						refundRows.push({
							id: faker.string.uuid(),
							paymentId,
							amountCents: refundAmount,
							reason: faker.lorem.sentence(),
							providerRefundId: faker.string.alphanumeric(12),
							createdAt: faker.date.recent(),
						})
					}
				}
			}
		}

		// RSVPs (paid + free)
		for (let i = 0; i < rsvpTarget; i++) {
			const user = faker.datatype.boolean() ? rand(hostCandidates) : null
			const email = user?.email ?? faker.internet.email()
			const name = user?.name ?? faker.person.fullName()

			let status = RsvpStatus.CONFIRMED
			let paymentState: PaymentState = PaymentState.NONE
			let ticketTierId: string | null = null
			let orderId: string | null = null

			if (hasPaidTiers && faker.datatype.boolean({ probability: 0.7 })) {
				// tie to an order item if exists
				const paidOrder = rand(
					orderRows.filter(
						(o) => o.eventId === e.id && o.status === OrderStatus.PAID
					)
				)
				if (paidOrder) {
					orderId = paidOrder.id
					const items = orderItemsRows.filter(
						(oi) => oi.orderId === paidOrder.id
					)
					if (items.length) {
						ticketTierId = rand(items).ticketTierId
						paymentState = PaymentState.PAID
					}
				}
			} else {
				// free tier if present
				const freeTiers = tiers.filter((t: any) => t.priceCents === 0)
				if (freeTiers.length) ticketTierId = (rand(freeTiers) as any).id
			}

			// capacity handling
			let currentWaitlistPosition: number | null = null
			if (confirmedCount >= capacity) {
				status = RsvpStatus.CONFIRMED // Fix: use valid enum value
				currentWaitlistPosition = waitlistPosition++
			} else {
				confirmedCount++
			}

			// Link to a referral only after we have IDs; keep null here to avoid TDZ/undefined
			const referral = null

			const rsvpId = faker.string.uuid()
			rsvpRows.push({
				id: rsvpId,
				eventId: e.id,
				ticketTierId,
				userId: user?.id ?? null,
				orderId,
				email,
				name,
				status,
				paymentState,
				waitlistPosition: currentWaitlistPosition,
				referralId: referral,
				createdAt: faker.date.past(),
			})

			// Registration answers
			const qs = questions.filter((q: any) => q.eventId === e.id)
			for (const q of qs) {
				if (!q.required && faker.datatype.boolean({ probability: 0.4 }))
					continue
				let value: string
				switch (q.type) {
					case QuestionType.SHORT_TEXT:
					case QuestionType.LONG_TEXT:
						value = faker.lorem.sentence()
						break
					case QuestionType.SINGLE_SELECT:
						value = rand(q.options)
						break
					case QuestionType.MULTI_SELECT:
						value = JSON.stringify(
							sampleSize(
								q.options,
								faker.number.int({ min: 1, max: q.options.length })
							)
						)
						break
					case QuestionType.CHECKBOX:
						value = faker.datatype.boolean().toString()
						break
					case QuestionType.TERMS:
					case QuestionType.SIGNATURE:
						value = 'true'
						break
					default:
						value = ''
				}
				answerRows.push({
					id: faker.string.uuid(),
					rsvpId,
					questionId: q.id,
					value,
				})
			}

			// Check-in
			if (
				status === RsvpStatus.CONFIRMED &&
				faker.datatype.boolean({ probability: 0.6 })
			) {
				checkInRows.push({
					id: faker.string.uuid(),
					rsvpId,
					scannedAt: faker.date.recent(),
				})
			}

			// Feedback
			if (
				status === RsvpStatus.CONFIRMED &&
				faker.datatype.boolean({ probability: 0.3 })
			) {
				feedbackRows.push({
					id: faker.string.uuid(),
					eventId: e.id,
					rsvpId,
					rating: faker.number.int({ min: 1, max: 5 }),
					comment: faker.datatype.boolean()
						? faker.lorem.sentences({ min: 1, max: 3 })
						: null,
					createdAt: faker.date.recent(),
				})
			}
		}

		// Update counters later after inserts
	}

	// Bulk inserts
	if (viewRows.length) {
		if (prisma.eventView.createMany)
			await prisma.eventView.createMany({ data: viewRows })
		else
			await prisma.$transaction(
				viewRows.map((r) => prisma.eventView.create({ data: r }))
			)
	}

	if (orderRows.length) {
		if (prisma.order.createMany)
			await prisma.order.createMany({ data: orderRows })
		else
			await prisma.$transaction(
				orderRows.map((o) => prisma.order.create({ data: o }))
			)
	}
	if (orderItemsRows.length) {
		if (prisma.orderItem.createMany)
			await prisma.orderItem.createMany({ data: orderItemsRows })
		else
			await prisma.$transaction(
				orderItemsRows.map((oi) => prisma.orderItem.create({ data: oi }))
			)
	}
	if (paymentRows.length) {
		if (prisma.payment.createMany)
			await prisma.payment.createMany({ data: paymentRows })
		else
			await prisma.$transaction(
				paymentRows.map((p) => prisma.payment.create({ data: p }))
			)
	}
	if (refundRows.length) {
		if (prisma.refund.createMany)
			await prisma.refund.createMany({ data: refundRows })
		else
			await prisma.$transaction(
				refundRows.map((r) => prisma.refund.create({ data: r }))
			)
	}
	if (rsvpRows.length) {
		if (prisma.rsvp.createMany) await prisma.rsvp.createMany({ data: rsvpRows })
		else
			await prisma.$transaction(
				rsvpRows.map((r) => prisma.rsvp.create({ data: r }))
			)
	}
	if (answerRows.length) {
		if (prisma.registrationAnswer.createMany)
			await prisma.registrationAnswer.createMany({ data: answerRows })
		else
			await prisma.$transaction(
				answerRows.map((a) => prisma.registrationAnswer.create({ data: a }))
			)
	}
	if (checkInRows.length) {
		if (prisma.checkIn.createMany)
			await prisma.checkIn.createMany({ data: checkInRows })
		else
			await prisma.$transaction(
				checkInRows.map((c) => prisma.checkIn.create({ data: c }))
			)
	}
	if (feedbackRows.length) {
		if (prisma.eventFeedback.createMany)
			await prisma.eventFeedback.createMany({ data: feedbackRows })
		else
			await prisma.$transaction(
				feedbackRows.map((f) => prisma.eventFeedback.create({ data: f }))
			)
	}

	// --- Recompute per-event counters from inserted rows (consistency by construction)
	type Counter = {
		views: number
		rsvps: number
		paid: number
		checkins: number
	}
	const counters = new Map<string, Counter>()
	const bump = (id: string, field: keyof Counter, inc = 1) => {
		const base = counters.get(id) || {
			views: 0,
			rsvps: 0,
			paid: 0,
			checkins: 0,
		}
		base[field] += inc
		counters.set(id, base)
	}
	for (const v of viewRows) bump(v.eventId, 'views')
	for (const r of rsvpRows) {
		bump(r.eventId, 'rsvps')
		if (r.paymentState === PaymentState.PAID) bump(r.eventId, 'paid')
	}
	for (const c of checkInRows) {
		const r = rsvpRows.find((rr) => rr.id === c.rsvpId)
		if (r) bump(r.eventId, 'checkins')
	}

	const updates = Array.from(counters.entries()).map(([eventId, c]) =>
		prisma.event.update({
			where: { id: eventId },
			data: {
				viewCount: c.views,
				rsvpCount: c.rsvps,
				paidRsvpCount: c.paid,
				checkInCount: c.checkins,
			},
		})
	)
	if (updates.length) await prisma.$transaction(updates)

	return createdEvents
}

async function backfillDailyStats(events: any[]) {
	const rows: any[] = []
	for (const e of events) {
		const [viewCount, rsvpCount, paidRsvpCount] = await Promise.all([
			prisma.eventView.count({ where: { eventId: e.id } }),
			prisma.rsvp.count({ where: { eventId: e.id } }),
			prisma.rsvp.count({
				where: { eventId: e.id, paymentState: PaymentState.PAID },
			}),
		])
		const dayCount = faker.number.int({ min: 6, max: 18 })
		const weights = Array.from({ length: dayCount }, () => Math.random() + 0.4)
		const bumpIdx1 = Math.max(0, dayCount - 7)
		const bumpIdx2 = Math.max(0, dayCount - 3)
		if (dayCount > 4) {
			weights[bumpIdx1] *= 1.8
			weights[bumpIdx2] *= 1.5
		}
		const sumW = weights.reduce((a, b) => a + b, 0)
		const alloc = (total: number) => {
			const a = weights.map((w) => Math.floor((w / sumW) * total))
			let left = total - a.reduce((x, y) => x + y, 0)
			for (let i = 0; left > 0; i = (i + 1) % dayCount) {
				a[i]++
				left--
			}
			return a
		}
		const viewsA = alloc(viewCount)
		const uniqA = viewsA.map((v) =>
			Math.max(0, Math.floor(v * faker.number.float({ min: 0.6, max: 0.95 })))
		)
		const rsvpA = alloc(rsvpCount)
		const paidA = alloc(paidRsvpCount)

		const base = e.createdAt ?? faker.date.past({ years: 1 })
		for (let i = 0; i < dayCount; i++) {
			const date = new Date(base.getTime() + i * 24 * 60 * 60 * 1000)
			rows.push({
				eventId: e.id,
				date,
				views: viewsA[i],
				uniqueViews: Math.min(uniqA[i], viewsA[i]),
				rsvps: rsvpA[i],
				paidRsvps: Math.min(paidA[i], rsvpA[i]),
			})
		}
	}
	if (rows.length) {
		if (prisma.eventDailyStat.createMany)
			await prisma.eventDailyStat.createMany({ data: rows })
		else
			await prisma.$transaction(
				rows.map((r) => prisma.eventDailyStat.create({ data: r }))
			)
	}
}

// To ensure uniqueness beyond slugify collisions:
const usedSlugs = new Set<string>()
function uniqueSlug(base: string): string {
	let s = slug(base)
	while (usedSlugs.has(s)) {
		s = `${s}-${faker.string.alphanumeric(4).toLowerCase()}`
	}
	usedSlugs.add(s)
	return s
}

// --- RUN -------------------------------------------------------
main()
	.catch((e) => {
		logger.error('Seeding failed', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
