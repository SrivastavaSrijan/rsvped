/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
/** biome-ignore-all lint/suspicious/noConsole: its fine */
// @ts-nocheck
// prisma/seed.ts

import { writeFileSync } from 'node:fs'
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

const prisma = new PrismaClient()

// --- CONFIG ----------------------------------------------------
const NUM_USERS = 300
const NUM_COMMUNITIES = 50
const MAX_EVENTS_PER_COMMUNITY = 15
const EXTRA_STANDALONE_EVENTS = 100 // events without a community
const MAX_TICKET_TIERS_PER_EVENT = 4
const MAX_PROMO_CODES_PER_EVENT = 4
const MAX_REG_QUESTIONS_PER_EVENT = 5
const MAX_COLLABORATORS_PER_EVENT = 4
const MAX_CATEGORIES = 30

const ACCESS_KEY = 'YVL2f8WFV8VyM_htL_6t9IadGgTufVB6WgATOiA72jE'
const COLLECTION_ID = 'j7hIPPKdCOU'

// If you want to reset DB each run:
const SHOULD_WIPE = true

// --- UTILITIES -------------------------------------------------
const rand = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const sampleSize = <T>(arr: T[], n: number) =>
	faker.helpers.arrayElements(arr, Math.min(n, arr.length))
const slug = (s: string) =>
	slugify(s, { lower: true, strict: true }).substring(0, 48) || faker.string.alphanumeric(8)

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function randomDateWithinRange({ startDaysAgo = 120, endDaysAhead = 120 } = {}) {
	const start = faker.date.soon({ days: endDaysAhead })
	const end = faker.date.recent({ days: startDaysAgo })
	return faker.date.between({ from: end, to: start })
}

function addHours(date: Date, hours = 2) {
	return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

async function fetchUnsplashImages(count = 400): Promise<string[]> {
	try {
		const maxPerPage = 10
		const totalPages = Math.ceil(count / maxPerPage)
		const allImages: string[] = []

		for (let page = 1; page <= totalPages; page++) {
			const perPage = Math.min(maxPerPage, count - allImages.length)
			const url = `https://api.unsplash.com/collections/${COLLECTION_ID}/photos?per_page=${perPage}&page=${page}&client_id=${ACCESS_KEY}`

			const res = await fetch(url)
			if (!res.ok) throw new Error(`Unsplash error ${res.status} on page ${page}`)

			const data: any[] = await res.json()
			const pageImages = data.map((p) => p.urls?.regular).filter(Boolean)
			allImages.push(...pageImages)

			// If we got fewer images than requested, we've reached the end
			if (pageImages.length < perPage) {
				break
			}

			// Add a small delay to be respectful to the API
			await new Promise((resolve) => setTimeout(resolve, 100))
		}

		return allImages
	} catch (e) {
		console.warn('Unsplash failed, using placeholders.', e)
		return Array.from({ length: count }, () =>
			faker.image.urlPicsumPhotos({ width: 1200, height: 630 })
		)
	}
}

async function wipeDb() {
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
		prisma.location.deleteMany(), // Add location cleanup
		prisma.membershipTier.deleteMany(),
		prisma.communityMembership.deleteMany(),
		prisma.community.deleteMany(),
		prisma.session.deleteMany(),
		prisma.account.deleteMany(),
		prisma.verificationToken.deleteMany(),
		prisma.user.deleteMany(),
	])
}

// --- SEED MAIN -------------------------------------------------
async function main() {
	if (SHOULD_WIPE) {
		console.log('Wiping DB…')
		await wipeDb()
	}

	console.log('Fetching Unsplash images…')
	const images = await fetchUnsplashImages(400)
	console.log('Fetched images:', images.length)

	console.log('Creating locations…')
	const locations = await createLocations()

	console.log('Creating users…')
	const users = await createUsers(NUM_USERS)

	console.log('Creating communities…')
	const { communities } = await createCommunities(users, images)

	const categories = await createCategories(MAX_CATEGORIES)
	console.log('Creating categories…')

	console.log('Creating events…')
	const events = [
		...(await createEventsForCommunities(communities, users, categories, images, locations)),
		...(await createStandaloneEvents(
			EXTRA_STANDALONE_EVENTS,
			users,
			categories,
			images,
			locations
		)),
	]

	console.log('Backfilling daily stats…')
	await backfillDailyStats(events)

	console.log('Done!')
}

// --- CREATORS --------------------------------------------------
async function createLocations() {
	// Map of location data based on your icon files
	const locationData = [
		// North America
		{
			name: 'New York City',
			slug: 'nyc',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/New_York',
			iconPath: 'nyc-icon.png',
		},
		{
			name: 'Los Angeles',
			slug: 'la',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Los_Angeles',
			iconPath: 'la-icon.png',
		},
		{
			name: 'San Francisco',
			slug: 'sf',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Los_Angeles',
			iconPath: 'sf-icon.png',
		},
		{
			name: 'Chicago',
			slug: 'chicago',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Chicago',
			iconPath: 'chicago-icon.png',
		},
		{
			name: 'Boston',
			slug: 'boston',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/New_York',
			iconPath: 'boston-icon.png',
		},
		{
			name: 'Washington DC',
			slug: 'dc',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/New_York',
			iconPath: 'dc-icon.png',
		},
		{
			name: 'Seattle',
			slug: 'seattle',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Los_Angeles',
			iconPath: 'seattle-icon.png',
		},
		{
			name: 'Austin',
			slug: 'austin',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Chicago',
			iconPath: 'austin-icon.png',
		},
		{
			name: 'Miami',
			slug: 'miami',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/New_York',
			iconPath: 'miami-icon.png',
		},
		{
			name: 'Denver',
			slug: 'denver',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Denver',
			iconPath: 'denver-icon.png',
		},
		{
			name: 'Las Vegas',
			slug: 'vegas',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Los_Angeles',
			iconPath: 'vegas-icon.png',
		},
		{
			name: 'Philadelphia',
			slug: 'philly',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/New_York',
			iconPath: 'philly-icon.png',
		},
		{
			name: 'Phoenix',
			slug: 'phx',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Phoenix',
			iconPath: 'phx-icon.png',
		},
		{
			name: 'San Diego',
			slug: 'sd',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Los_Angeles',
			iconPath: 'sd-icon.png',
		},
		{
			name: 'Portland',
			slug: 'portland',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Los_Angeles',
			iconPath: 'portland-icon.png',
		},
		{
			name: 'Salt Lake City',
			slug: 'slc',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Denver',
			iconPath: 'slc-icon.png',
		},
		{
			name: 'Atlanta',
			slug: 'atlanta',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/New_York',
			iconPath: 'atlanta-icon.png',
		},
		{
			name: 'Dallas',
			slug: 'dallas',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Chicago',
			iconPath: 'dallas-icon.png',
		},
		{
			name: 'Houston',
			slug: 'houston',
			country: 'United States',
			continent: 'North America',
			timezone: 'America/Chicago',
			iconPath: 'houston-icon.png',
		},
		{
			name: 'Toronto',
			slug: 'toronto',
			country: 'Canada',
			continent: 'North America',
			timezone: 'America/Toronto',
			iconPath: 'toronto-icon.png',
		},
		{
			name: 'Vancouver',
			slug: 'vancouver',
			country: 'Canada',
			continent: 'North America',
			timezone: 'America/Vancouver',
			iconPath: 'vancouver-icon.png',
		},
		{
			name: 'Montreal',
			slug: 'montreal',
			country: 'Canada',
			continent: 'North America',
			timezone: 'America/Montreal',
			iconPath: 'montreal-icon.png',
		},
		{
			name: 'Calgary',
			slug: 'calgary',
			country: 'Canada',
			continent: 'North America',
			timezone: 'America/Edmonton',
			iconPath: 'calgary-icon.png',
		},
		{
			name: 'Waterloo',
			slug: 'waterloo',
			country: 'Canada',
			continent: 'North America',
			timezone: 'America/Toronto',
			iconPath: 'waterloo-icon.png',
		},
		{
			name: 'Mexico City',
			slug: 'cdmx',
			country: 'Mexico',
			continent: 'North America',
			timezone: 'America/Mexico_City',
			iconPath: 'cdmx-icon.png',
		},
		{
			name: 'Honolulu',
			slug: 'hnl',
			country: 'United States',
			continent: 'North America',
			timezone: 'Pacific/Honolulu',
			iconPath: 'hnl-icon.png',
		},

		// Europe
		{
			name: 'London',
			slug: 'london',
			country: 'United Kingdom',
			continent: 'Europe',
			timezone: 'Europe/London',
			iconPath: 'london-icon.png',
		},
		{
			name: 'Paris',
			slug: 'paris',
			country: 'France',
			continent: 'Europe',
			timezone: 'Europe/Paris',
			iconPath: 'paris-icon.png',
		},
		{
			name: 'Berlin',
			slug: 'berlin',
			country: 'Germany',
			continent: 'Europe',
			timezone: 'Europe/Berlin',
			iconPath: 'berlin-icon.png',
		},
		{
			name: 'Amsterdam',
			slug: 'ams',
			country: 'Netherlands',
			continent: 'Europe',
			timezone: 'Europe/Amsterdam',
			iconPath: 'ams-icon.png',
		},
		{
			name: 'Barcelona',
			slug: 'bcn',
			country: 'Spain',
			continent: 'Europe',
			timezone: 'Europe/Madrid',
			iconPath: 'bcn-icon.png',
		},
		{
			name: 'Madrid',
			slug: 'madrid',
			country: 'Spain',
			continent: 'Europe',
			timezone: 'Europe/Madrid',
			iconPath: 'madrid-icon.png',
		},
		{
			name: 'Milan',
			slug: 'milan',
			country: 'Italy',
			continent: 'Europe',
			timezone: 'Europe/Rome',
			iconPath: 'milan-icon.png',
		},
		{
			name: 'Stockholm',
			slug: 'stockholm',
			country: 'Sweden',
			continent: 'Europe',
			timezone: 'Europe/Stockholm',
			iconPath: 'stockholm-icon.png',
		},
		{
			name: 'Copenhagen',
			slug: 'cph',
			country: 'Denmark',
			continent: 'Europe',
			timezone: 'Europe/Copenhagen',
			iconPath: 'cph-icon.png',
		},
		{
			name: 'Dublin',
			slug: 'dublin',
			country: 'Ireland',
			continent: 'Europe',
			timezone: 'Europe/Dublin',
			iconPath: 'dublin-icon.png',
		},
		{
			name: 'Helsinki',
			slug: 'helsinki',
			country: 'Finland',
			continent: 'Europe',
			timezone: 'Europe/Helsinki',
			iconPath: 'helsinki-icon.png',
		},
		{
			name: 'Brussels',
			slug: 'brussels',
			country: 'Belgium',
			continent: 'Europe',
			timezone: 'Europe/Brussels',
			iconPath: 'brussels-icon.png',
		},
		{
			name: 'Zurich',
			slug: 'zurich',
			country: 'Switzerland',
			continent: 'Europe',
			timezone: 'Europe/Zurich',
			iconPath: 'zurich-icon.png',
		},
		{
			name: 'Geneva',
			slug: 'geneva',
			country: 'Switzerland',
			continent: 'Europe',
			timezone: 'Europe/Zurich',
			iconPath: 'geneva-icon.png',
		},
		{
			name: 'Lausanne',
			slug: 'lausanne',
			country: 'Switzerland',
			continent: 'Europe',
			timezone: 'Europe/Zurich',
			iconPath: 'lausanne-icon.png',
		},
		{
			name: 'Munich',
			slug: 'munich',
			country: 'Germany',
			continent: 'Europe',
			timezone: 'Europe/Berlin',
			iconPath: 'munich-icon.png',
		},
		{
			name: 'Prague',
			slug: 'prague',
			country: 'Czech Republic',
			continent: 'Europe',
			timezone: 'Europe/Prague',
			iconPath: 'prague-icon.png',
		},
		{
			name: 'Lisbon',
			slug: 'lisbon',
			country: 'Portugal',
			continent: 'Europe',
			timezone: 'Europe/Lisbon',
			iconPath: 'lisbon-icon.png',
		},
		{
			name: 'Istanbul',
			slug: 'istanbul',
			country: 'Turkey',
			continent: 'Europe',
			timezone: 'Europe/Istanbul',
			iconPath: 'istanbul-icon.png',
		},
		{
			name: 'Tel Aviv',
			slug: 'telaviv',
			country: 'Israel',
			continent: 'Europe',
			timezone: 'Asia/Jerusalem',
			iconPath: 'telaviv-icon.png',
		},

		// Asia & Pacific
		{
			name: 'Tokyo',
			slug: 'tokyo',
			country: 'Japan',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Tokyo',
			iconPath: 'tokyo-icon.png',
		},
		{
			name: 'Singapore',
			slug: 'sg',
			country: 'Singapore',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Singapore',
			iconPath: 'sg-icon.png',
		},
		{
			name: 'Hong Kong',
			slug: 'hk',
			country: 'Hong Kong',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Hong_Kong',
			iconPath: 'hk-icon.png',
		},
		{
			name: 'Seoul',
			slug: 'seoul',
			country: 'South Korea',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Seoul',
			iconPath: 'seoul-icon.png',
		},
		{
			name: 'Sydney',
			slug: 'sydney',
			country: 'Australia',
			continent: 'Asia & Pacific',
			timezone: 'Australia/Sydney',
			iconPath: 'sydney-icon.png',
		},
		{
			name: 'Melbourne',
			slug: 'mel',
			country: 'Australia',
			continent: 'Asia & Pacific',
			timezone: 'Australia/Melbourne',
			iconPath: 'mel-icon.png',
		},
		{
			name: 'Mumbai',
			slug: 'mumbai',
			country: 'India',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Kolkata',
			iconPath: 'mumbai-icon.png',
		},
		{
			name: 'Bangalore',
			slug: 'bangalore',
			country: 'India',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Kolkata',
			iconPath: 'bangalore-icon.png',
		},
		{
			name: 'New Delhi',
			slug: 'newdelhi',
			country: 'India',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Kolkata',
			iconPath: 'newdelhi-icon.png',
		},
		{
			name: 'Bangkok',
			slug: 'bangkok',
			country: 'Thailand',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Bangkok',
			iconPath: 'bangkok-icon.png',
		},
		{
			name: 'Jakarta',
			slug: 'jakarta',
			country: 'Indonesia',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Jakarta',
			iconPath: 'jakarta-icon.png',
		},
		{
			name: 'Kuala Lumpur',
			slug: 'kl',
			country: 'Malaysia',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Kuala_Lumpur',
			iconPath: 'kl-icon.png',
		},
		{
			name: 'Manila',
			slug: 'manila',
			country: 'Philippines',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Manila',
			iconPath: 'manila-icon.png',
		},
		{
			name: 'Ho Chi Minh City',
			slug: 'hcm',
			country: 'Vietnam',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Ho_Chi_Minh',
			iconPath: 'hcm-icon.png',
		},
		{
			name: 'Taipei',
			slug: 'taipei',
			country: 'Taiwan',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Taipei',
			iconPath: 'taipei-icon.png',
		},
		{
			name: 'Dubai',
			slug: 'dubai',
			country: 'United Arab Emirates',
			continent: 'Asia & Pacific',
			timezone: 'Asia/Dubai',
			iconPath: 'dubai-icon.png',
		},

		// South America
		{
			name: 'São Paulo',
			slug: 'sp',
			country: 'Brazil',
			continent: 'South America',
			timezone: 'America/Sao_Paulo',
			iconPath: 'sp-icon.png',
		},
		{
			name: 'Rio de Janeiro',
			slug: 'rio',
			country: 'Brazil',
			continent: 'South America',
			timezone: 'America/Sao_Paulo',
			iconPath: 'rio-icon.png',
		},
		{
			name: 'Buenos Aires',
			slug: 'ba',
			country: 'Argentina',
			continent: 'South America',
			timezone: 'America/Argentina/Buenos_Aires',
			iconPath: 'ba-icon.png',
		},
		{
			name: 'Bogotá',
			slug: 'bogota',
			country: 'Colombia',
			continent: 'South America',
			timezone: 'America/Bogota',
			iconPath: 'bogota-icon.png',
		},
		{
			name: 'Medellín',
			slug: 'medellin',
			country: 'Colombia',
			continent: 'South America',
			timezone: 'America/Bogota',
			iconPath: 'medellin-icon.png',
		},

		// Africa
		{
			name: 'Lagos',
			slug: 'lagos',
			country: 'Nigeria',
			continent: 'Africa',
			timezone: 'Africa/Lagos',
			iconPath: 'lagos-icon.png',
		},
		{
			name: 'Nairobi',
			slug: 'nairobi',
			country: 'Kenya',
			continent: 'Africa',
			timezone: 'Africa/Nairobi',
			iconPath: 'nairobi-icon.png',
		},
	]

	console.log(`Creating ${locationData.length} locations...`)

	const locations =
		'createManyAndReturn' in prisma.location
			? await (prisma.location as any).createManyAndReturn({ data: locationData })
			: await prisma.$transaction(locationData.map((l) => prisma.location.create({ data: l })))

	console.log(`✅ ${locations.length} locations created`)
	return locations
}

async function createUsers(count: number) {
	const testCredentials: { email: string; password: string; name: string; id?: string }[] = []
	const data = []

	console.log(`Creating ${count} users with hashed passwords...`)

	for (let i = 0; i < count; i++) {
		const name = faker.person.fullName()
		const email = faker.internet.email().toLowerCase()
		const plainPassword = faker.internet.password({ length: 12 })
		const hashedPassword = await bcrypt.hash(plainPassword, 12)

		// Store credentials for JSON file
		testCredentials.push({ email, password: plainPassword, name })

		data.push({
			name,
			email,
			image: getAvatarURL(name), // Use Dicebear with name as seed
			password: hashedPassword,
			emailVerified: faker.datatype.boolean() ? faker.date.past() : null,
		})

		// Log progress every 50 users
		if ((i + 1) % 50 === 0) {
			console.log(`  Hashed passwords for ${i + 1}/${count} users...`)
		}
	}

	// Create users
	const users =
		'createManyAndReturn' in prisma.user
			? await (prisma.user as any).createManyAndReturn({ data })
			: await prisma.$transaction(data.map((u) => prisma.user.create({ data: u })))

	// Add user IDs to credentials
	users.forEach((user: any, index: number) => {
		testCredentials[index].id = user.id
	})

	// Write credentials to JSON file for testing
	writeFileSync('test-accounts.json', JSON.stringify(testCredentials, null, 2), 'utf-8')
	console.log(`📁 Test credentials saved to test-accounts.json`)
	console.log(`✅ ${users.length} users created with hashed passwords`)

	return users
}

async function createCommunities(users: any[], images: any[]) {
	const ownerPool = sampleSize(users, Math.ceil(NUM_COMMUNITIES * 0.8))
	const data = Array.from({ length: NUM_COMMUNITIES }).map(() => {
		const owner = rand(ownerPool)
		const name = faker.company.name()
		return {
			name,
			slug: slug(name),
			description: faker.lorem.paragraph(),
			coverImage: rand(images),
			isPublic: faker.datatype.boolean(),
			ownerId: owner.id,
		}
	})

	const communities =
		'createManyAndReturn' in prisma.community
			? await (prisma.community as any).createManyAndReturn({ data })
			: await prisma.$transaction(data.map((c) => prisma.community.create({ data: c })))

	// Membership tiers
	const tiersToCreate: any[] = []
	for (const c of communities) {
		const tierCount = faker.number.int({ min: 0, max: 3 })
		for (let i = 0; i < tierCount; i++) {
			const name = faker.commerce.productName()
			tiersToCreate.push({
				communityId: c.id,
				name,
				slug: slug(name),
				description: faker.commerce.productDescription(),
				priceCents: faker.datatype.boolean() ? faker.number.int({ min: 500, max: 5000 }) : null,
				currency: 'USD',
				billingInterval: rand([BillingInterval.MONTHLY, BillingInterval.YEARLY]),
				stripePriceId: null,
				isActive: true,
			})
		}
	}
	const membershipTiers = tiersToCreate.length
		? 'createManyAndReturn' in prisma.membershipTier
			? await (prisma.membershipTier as any).createManyAndReturn({ data: tiersToCreate })
			: await prisma.$transaction(
					tiersToCreate.map((t) => prisma.membershipTier.create({ data: t }))
				)
		: []

	// Memberships
	const membershipsToCreate: any[] = []
	for (const c of communities) {
		const communityUsers = sampleSize(users, faker.number.int({ min: 5, max: 25 }))
		for (const u of communityUsers) {
			const role = faker.helpers.weightedArrayElement([
				{ weight: 80, value: MembershipRole.MEMBER },
				{ weight: 15, value: MembershipRole.MODERATOR },
				{ weight: 5, value: MembershipRole.ADMIN },
			])
			const tier = membershipTiers.filter((t) => t.communityId === c.id)
			const pickTier = tier.length ? rand(tier) : null
			membershipsToCreate.push({
				userId: u.id,
				communityId: c.id,
				role,
				membershipTierId: pickTier?.id ?? null,
				subscriptionStatus: pickTier ? rand(Object.values(SubscriptionStatus)) : null,
				expiresAt: pickTier && faker.datatype.boolean() ? faker.date.soon({ days: 180 }) : null,
				joinedAt: faker.date.past(),
			})
		}
	}
	if (membershipsToCreate.length) {
		if (prisma.communityMembership.createMany) {
			await prisma.communityMembership.createMany({ data: membershipsToCreate })
		} else {
			await prisma.$transaction(
				membershipsToCreate.map((m) => prisma.communityMembership.create({ data: m }))
			)
		}
	}

	return { communities, membershipTiers }
}

async function createCategories(count: number) {
	const usedNames = new Set<string>()
	const data = Array.from({ length: count }).map(() => {
		let name = capitalize(faker.word.noun())
		// Ensure unique names
		while (usedNames.has(name)) {
			name = capitalize(faker.word.noun())
		}
		usedNames.add(name)

		return {
			name,
			slug: slug(name),
		}
	})

	// Use createManyAndReturn if available, otherwise fall back to individual creates
	if ('createManyAndReturn' in prisma.category) {
		return (prisma.category as any).createManyAndReturn({ data })
	}
	return prisma.$transaction(data.map((c) => prisma.category.create({ data: c })))
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
		const eventCount = faker.number.int({ min: 2, max: MAX_EVENTS_PER_COMMUNITY })
		const hostCandidates = users.filter(
			(u: any) => u.id === community.ownerId || faker.datatype.boolean()
		)
		const communityEvents = await createEvents(eventCount, {
			hostCandidates,
			categories,
			communityId: community.id,
			images,
			locations,
		})
		all.push(...communityEvents)
	}
	return all
}

async function createStandaloneEvents(
	count: number,
	users: any[],
	categories: any[],
	images: string[],
	locations: any[]
) {
	const hostCandidates = users
	return createEvents(count, { hostCandidates, categories, images, communityId: null, locations })
}

async function createEvents(
	count: number,
	opts: {
		hostCandidates: any[]
		categories: any[]
		communityId: string | null
		images: string[]
		locations: any[]
	}
) {
	const { hostCandidates, categories, communityId, images, locations } = opts

	const events: any[] = []
	for (let i = 0; i < count; i++) {
		const title = faker.company.catchPhrase()
		const start = randomDateWithinRange()
		const end = addHours(start, faker.number.int({ min: 1, max: 6 }))
		const locationType = rand([LocationType.PHYSICAL, LocationType.ONLINE, LocationType.HYBRID])
		const coverImage = rand(images)

		// Assign a random location for physical/hybrid events
		const location = locationType !== LocationType.ONLINE ? rand(locations) : null

		events.push({
			slug: uniqueSlug(title),
			title,
			subtitle: faker.company.buzzPhrase(),
			description: Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () =>
				faker.lorem.paragraph()
			).join('\n\n'),
			coverImage,
			startDate: start,
			endDate: end,
			timezone:
				location?.timezone ||
				rand(['America/New_York', 'Asia/Kolkata', 'Europe/London', 'Asia/Tokyo', 'UTC']),
			locationId: location?.id || null,
			locationType,
			venueName:
				locationType !== LocationType.ONLINE ? `${faker.location.city()} Convention Center` : null,
			venueAddress: locationType !== LocationType.ONLINE ? faker.location.streetAddress() : null,
			onlineUrl: locationType !== LocationType.PHYSICAL ? faker.internet.url() : null,
			capacity: faker.datatype.boolean() ? faker.number.int({ min: 30, max: 300 }) : null,
			isPublished: faker.datatype.boolean(),
			status: rand([EventStatus.DRAFT, EventStatus.PUBLISHED, EventStatus.CANCELLED]),
			visibility: rand([
				EventVisibility.PUBLIC,
				EventVisibility.PRIVATE,
				EventVisibility.MEMBER_ONLY,
			]),
			publishedAt: faker.datatype.boolean() ? faker.date.past() : null,
			requiresApproval: faker.datatype.boolean(),
			locationHiddenUntilApproved: faker.datatype.boolean(),
			hostId: rand(hostCandidates).id,
			communityId,
			deletedAt: faker.datatype.boolean({ probability: 0.05 }) ? faker.date.recent() : null,
			rsvpCount: 0,
			paidRsvpCount: 0,
			checkInCount: 0,
			viewCount: 0,
			createdAt: faker.date.past(),
		})
	}

	// Create events
	const createdEvents =
		'createManyAndReturn' in prisma.event
			? await (prisma.event as any).createManyAndReturn({ data: events })
			: await prisma.$transaction(events.map((e) => prisma.event.create({ data: e })))

	// Categories relation
	const eventCategoryRows: any[] = []
	for (const e of createdEvents) {
		const catCount = faker.number.int({ min: 1, max: 3 })
		const cats = sampleSize(categories, catCount)
		for (const c of cats) {
			eventCategoryRows.push({ eventId: e.id, categoryId: c.id })
		}
	}
	if (eventCategoryRows.length) {
		if (prisma.eventCategory.createMany) {
			await prisma.eventCategory.createMany({ data: eventCategoryRows, skipDuplicates: true })
		} else {
			await prisma.$transaction(
				eventCategoryRows.map((r) => prisma.eventCategory.create({ data: r }))
			)
		}
	}

	// Ticket tiers
	const ticketRows: any[] = []
	for (const e of createdEvents) {
		const countTiers = faker.number.int({ min: 1, max: MAX_TICKET_TIERS_PER_EVENT })
		for (let i = 0; i < countTiers; i++) {
			const name = faker.commerce.productName()
			ticketRows.push({
				eventId: e.id,
				name,
				description: faker.commerce.productDescription(),
				priceCents: faker.number.int({ min: 0, max: 15000 }),
				currency: 'USD',
				quantityTotal: faker.datatype.boolean() ? faker.number.int({ min: 20, max: 200 }) : null,
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
	const ticketTiers = ticketRows.length
		? 'createManyAndReturn' in prisma.ticketTier
			? await (prisma.ticketTier as any).createManyAndReturn({ data: ticketRows })
			: await prisma.$transaction(ticketRows.map((t) => prisma.ticketTier.create({ data: t })))
		: []

	// Promo codes
	const promoRows: any[] = []
	const promoTiersRows: any[] = []
	for (const e of createdEvents) {
		const promoCount = faker.number.int({ min: 0, max: MAX_PROMO_CODES_PER_EVENT })
		for (let i = 0; i < promoCount; i++) {
			const appliesToAll = faker.datatype.boolean()
			const pc = {
				eventId: e.id,
				code: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
				discountType: rand([DiscountType.AMOUNT, DiscountType.PERCENT]),
				amountOffCents: null as number | null,
				percentOff: null as number | null,
				maxRedemptions: faker.datatype.boolean() ? faker.number.int({ min: 5, max: 100 }) : null,
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
				const tiers = ticketTiers.filter((t) => t.eventId === e.id)
				const chosen = sampleSize(tiers, faker.number.int({ min: 1, max: tiers.length || 1 }))
				chosen.forEach((t) => {
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
	const createdPromoCodes = promoRows.length
		? 'createManyAndReturn' in prisma.promoCode
			? await (prisma.promoCode as any).createManyAndReturn({ data: promoRows })
			: await prisma.$transaction(promoRows.map((p) => prisma.promoCode.create({ data: p })))
		: []

	// Fix promoCodeTier references
	if (promoTiersRows.length) {
		let idx = 0
		for (const p of createdPromoCodes) {
			// attach each temp row until we hit another promoCode entry? We'll just greedily assign.
			while (idx < promoTiersRows.length && promoTiersRows[idx].promoCodeId === 'TEMP') {
				promoTiersRows[idx].promoCodeId = p.id
				idx++
			}
		}
		if (prisma.promoCodeTier.createMany) {
			await prisma.promoCodeTier.createMany({ data: promoTiersRows, skipDuplicates: true })
		} else {
			await prisma.$transaction(promoTiersRows.map((r) => prisma.promoCodeTier.create({ data: r })))
		}
	}

	// Registration questions
	const questionRows: any[] = []
	for (const e of createdEvents) {
		const qCount = faker.number.int({ min: 0, max: MAX_REG_QUESTIONS_PER_EVENT })
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
					type === QuestionType.SINGLE_SELECT || type === QuestionType.MULTI_SELECT
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
			? await (prisma.registrationQuestion as any).createManyAndReturn({ data: questionRows })
			: await prisma.$transaction(
					questionRows.map((q) => prisma.registrationQuestion.create({ data: q }))
				)
		: []

	// Event collaborators
	const collabRows: any[] = []
	for (const e of createdEvents) {
		const countCollabs = faker.number.int({ min: 0, max: MAX_COLLABORATORS_PER_EVENT })
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
			await prisma.eventCollaborator.createMany({ data: collabRows, skipDuplicates: true })
		} else {
			await prisma.$transaction(collabRows.map((c) => prisma.eventCollaborator.create({ data: c })))
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
			? await (prisma.eventReferral as any).createManyAndReturn({ data: referralRows })
			: await prisma.$transaction(referralRows.map((r) => prisma.eventReferral.create({ data: r })))
		: []

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
		// generate some views
		const viewsCount = faker.number.int({ min: 5, max: 200 })
		for (let v = 0; v < viewsCount; v++) {
			const viewer = faker.datatype.boolean() ? rand(hostCandidates) : null
			viewRows.push({
				eventId: e.id,
				userId: viewer?.id ?? null,
				ipAddress: faker.internet.ip(),
				userAgent: faker.internet.userAgent(),
				referrer: faker.internet.url(),
				viewedAt: faker.date.past(),
			})
		}

		const tiers = ticketTiers.filter((t) => t.eventId === e.id)
		const hasPaidTiers = tiers.some((t) => t.priceCents > 0)

		const capacity = e.capacity ?? Infinity
		const rsvpTarget = faker.number.int({ min: 10, max: 150 })
		let confirmedCount = 0
		let waitlistPosition = 1

		// Create orders for paid tickets
		if (hasPaidTiers) {
			const orderCount = faker.number.int({ min: 5, max: 40 })
			for (let i = 0; i < orderCount; i++) {
				const buyer = rand(hostCandidates)
				const itemsForOrder = sampleSize(
					tiers.filter((t) => t.priceCents > 0),
					faker.number.int({ min: 1, max: Math.min(2, tiers.length) })
				)

				const quantities = itemsForOrder.map(() => faker.number.int({ min: 1, max: 4 }))
				const totalCents = itemsForOrder.reduce(
					(sum, t, idx) => sum + t.priceCents * quantities[idx],
					0
				)

				const status = rand([OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.CANCELLED])
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
						? (rand(createdPromoCodes.filter((pc) => pc.eventId === e.id))?.id ?? null)
						: null,
					idempotencyKey: faker.string.uuid(),
					createdAt: faker.date.past(),
					updatedAt: faker.date.recent(),
				})

				itemsForOrder.forEach((t, idx) => {
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
							: rand([PaymentStatus.PENDING, PaymentStatus.FAILED, PaymentStatus.CANCELLED]),
						amountCents: totalCents,
						currency: 'USD',
						createdAt: faker.date.past(),
						updatedAt: faker.date.recent(),
					})

					// occasional refunds
					if (succeeded && faker.datatype.boolean({ probability: 0.05 })) {
						const refundAmount = faker.number.int({ min: 0, max: totalCents })
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
					orderRows.filter((o) => o.eventId === e.id && o.status === OrderStatus.PAID)
				)
				if (paidOrder) {
					orderId = paidOrder.id
					const items = orderItemsRows.filter((oi) => oi.orderId === paidOrder.id)
					if (items.length) {
						ticketTierId = rand(items).ticketTierId
						paymentState = PaymentState.PAID
					}
				}
			} else {
				// free tier if present
				const freeTiers = tiers.filter((t) => t.priceCents === 0)
				if (freeTiers.length) ticketTierId = rand(freeTiers).id
			}

			// capacity handling
			let currentWaitlistPosition: number | null = null
			if (confirmedCount >= capacity) {
				status = RsvpStatus.WAITLIST
				currentWaitlistPosition = waitlistPosition++
			} else {
				confirmedCount++
			}

			const referral = faker.datatype.boolean()
				? (rand(referrals.filter((r) => r.eventId === e.id))?.id ?? null)
				: null

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
			const qs = questions.filter((q) => q.eventId === e.id)
			for (const q of qs) {
				if (!q.required && faker.datatype.boolean({ probability: 0.4 })) continue
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
							sampleSize(q.options, faker.number.int({ min: 1, max: q.options.length }))
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
			if (status === RsvpStatus.CONFIRMED && faker.datatype.boolean({ probability: 0.6 })) {
				checkInRows.push({
					id: faker.string.uuid(),
					rsvpId,
					scannedAt: faker.date.recent(),
				})
			}

			// Feedback
			if (status === RsvpStatus.CONFIRMED && faker.datatype.boolean({ probability: 0.3 })) {
				feedbackRows.push({
					id: faker.string.uuid(),
					eventId: e.id,
					rsvpId,
					rating: faker.number.int({ min: 1, max: 5 }),
					comment: faker.datatype.boolean() ? faker.lorem.sentences({ min: 1, max: 3 }) : null,
					createdAt: faker.date.recent(),
				})
			}
		}

		// Update counters later after inserts
	}

	// Bulk inserts
	if (viewRows.length) {
		if (prisma.eventView.createMany) await prisma.eventView.createMany({ data: viewRows })
		else await prisma.$transaction(viewRows.map((r) => prisma.eventView.create({ data: r })))
	}

	if (orderRows.length) {
		if (prisma.order.createMany) await prisma.order.createMany({ data: orderRows })
		else await prisma.$transaction(orderRows.map((o) => prisma.order.create({ data: o })))
	}
	if (orderItemsRows.length) {
		if (prisma.orderItem.createMany) await prisma.orderItem.createMany({ data: orderItemsRows })
		else
			await prisma.$transaction(orderItemsRows.map((oi) => prisma.orderItem.create({ data: oi })))
	}
	if (paymentRows.length) {
		if (prisma.payment.createMany) await prisma.payment.createMany({ data: paymentRows })
		else await prisma.$transaction(paymentRows.map((p) => prisma.payment.create({ data: p })))
	}
	if (refundRows.length) {
		if (prisma.refund.createMany) await prisma.refund.createMany({ data: refundRows })
		else await prisma.$transaction(refundRows.map((r) => prisma.refund.create({ data: r })))
	}
	if (rsvpRows.length) {
		if (prisma.rsvp.createMany) await prisma.rsvp.createMany({ data: rsvpRows })
		else await prisma.$transaction(rsvpRows.map((r) => prisma.rsvp.create({ data: r })))
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
		if (prisma.checkIn.createMany) await prisma.checkIn.createMany({ data: checkInRows })
		else await prisma.$transaction(checkInRows.map((c) => prisma.checkIn.create({ data: c })))
	}
	if (feedbackRows.length) {
		if (prisma.eventFeedback.createMany)
			await prisma.eventFeedback.createMany({ data: feedbackRows })
		else
			await prisma.$transaction(feedbackRows.map((f) => prisma.eventFeedback.create({ data: f })))
	}

	// Update counters on events
	await Promise.all(
		createdEvents.map(async (e) => {
			const [rsvpCount, paidRsvpCount, checkInCount, viewCount] = await Promise.all([
				prisma.rsvp.count({ where: { eventId: e.id } }),
				prisma.rsvp.count({ where: { eventId: e.id, paymentState: PaymentState.PAID } }),
				prisma.checkIn.count({ where: { rsvp: { eventId: e.id } } }),
				prisma.eventView.count({ where: { eventId: e.id } }),
			])
			return prisma.event.update({
				where: { id: e.id },
				data: { rsvpCount, paidRsvpCount, checkInCount, viewCount },
			})
		})
	)

	return createdEvents
}

async function backfillDailyStats(events: any[]) {
	const rows: any[] = []
	for (const e of events) {
		const dayCount = faker.number.int({ min: 3, max: 20 })
		const base = faker.date.past({ years: 1 })
		for (let i = 0; i < dayCount; i++) {
			const date = new Date(base.getTime() + i * 24 * 60 * 60 * 1000)
			rows.push({
				eventId: e.id,
				date,
				views: faker.number.int({ min: 0, max: 200 }),
				uniqueViews: faker.number.int({ min: 0, max: 180 }),
				rsvps: faker.number.int({ min: 0, max: 50 }),
				paidRsvps: faker.number.int({ min: 0, max: 40 }),
			})
		}
	}
	if (rows.length) {
		if (prisma.eventDailyStat.createMany) await prisma.eventDailyStat.createMany({ data: rows })
		else await prisma.$transaction(rows.map((r) => prisma.eventDailyStat.create({ data: r })))
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
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})