/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import {
	EventStatus,
	EventVisibility,
	LocationType,
	type PrismaClient,
} from '@prisma/client'
import type { BatchProcessedData } from '../utils'
import { logger, timeOperation } from '../utils'
import {
	addHours,
	rand,
	randomDateWithinRange,
	uniqueSlug,
} from '../utils/faker-helpers'

// Helper functions for smart event generation
function generateEventTiming(eventType: string) {
	const start = randomDateWithinRange()

	// Smart duration based on event type
	const durationHours = {
		workshop: { min: 2, max: 8 },
		conference: { min: 6, max: 10 },
		exhibition: { min: 4, max: 12 },
		networking: { min: 2, max: 4 },
		seminar: { min: 1, max: 3 },
		webinar: { min: 1, max: 2 },
		meetup: { min: 2, max: 4 },
	}[eventType?.toLowerCase()] || { min: 2, max: 6 }

	const { faker } = require('@faker-js/faker')
	const end = addHours(start, faker.number.int(durationHours))

	return { start, end }
}

function generateVenueAddress(venueName: string, cityName: string) {
	const { faker } = require('@faker-js/faker')

	// Generate contextual addresses based on venue type
	if (venueName.toLowerCase().includes('convention')) {
		return `${faker.number.int({ min: 100, max: 9999 })} Convention Blvd, ${cityName}`
	}
	if (venueName.toLowerCase().includes('park')) {
		return `${venueName}, ${cityName}`
	}
	if (
		venueName.toLowerCase().includes('university') ||
		venueName.toLowerCase().includes('mit') ||
		venueName.toLowerCase().includes('harvard')
	) {
		return `${venueName} Campus, ${cityName}`
	}

	return `${faker.number.int({ min: 100, max: 9999 })} ${faker.location.street()}, ${cityName}`
}

function generateOnlineUrl(eventType: string) {
	const { faker } = require('@faker-js/faker')

	// Generate contextual URLs based on event type
	const platforms: Record<string, string[]> = {
		webinar: ['zoom.us', 'teams.microsoft.com', 'meet.google.com'],
		online: ['zoom.us', 'discord.gg', 'youtube.com'],
		hybrid: ['zoom.us', 'teams.microsoft.com'],
	}

	const platformList = platforms[eventType?.toLowerCase()] || platforms.online
	const platform = rand(platformList)

	if (platform === 'discord.gg') {
		return `https://discord.gg/${faker.string.alphanumeric(8)}`
	}
	if (platform === 'youtube.com') {
		return `https://youtube.com/watch?v=${faker.string.alphanumeric(11)}`
	}

	return `https://${platform}/j/${faker.string.numeric(9)}`
}

function mapEventTypeToLocationType(eventType: string): LocationType {
	const typeMap: Record<string, LocationType> = {
		virtual: LocationType.ONLINE,
		online: LocationType.ONLINE,
		webinar: LocationType.ONLINE,
		'in-person': LocationType.PHYSICAL,
		physical: LocationType.PHYSICAL,
		meetup: LocationType.PHYSICAL,
		conference: LocationType.PHYSICAL,
		workshop: LocationType.PHYSICAL,
		exhibition: LocationType.PHYSICAL,
		networking: LocationType.PHYSICAL,
		seminar: LocationType.PHYSICAL,
		hybrid: LocationType.HYBRID,
	}

	return typeMap[eventType?.toLowerCase()] || LocationType.PHYSICAL
}

export async function createEventsFromBatchData(
	prisma: PrismaClient,
	batchData: BatchProcessedData,
	communities: any[],
	categories: any[],
	users: any[],
	images: string[],
	locations: any[]
) {
	return await timeOperation('Creating events from batch data', async () => {
		const { faker } = await import('@faker-js/faker')

		const all: any[] = []
		const locationMap = new Map(locations.map((l) => [l.name, l]))
		const communityMap = new Map(communities.map((c) => [c.name, c]))

		// Process events by city from batch data
		for (const [cityName, cityEvents] of Object.entries(
			batchData?.eventsByCity ?? {}
		)) {
			const location = locationMap.get(cityName)
			if (!location) {
				logger.debug(
					`Location not found for city: ${cityName}, skipping events`
				)
				continue
			}

			logger.info(
				`📍 Creating ${(cityEvents as any[]).length} events for ${cityName}`
			)

			// Get venues for this city from static venues data
			const cityVenues = batchData?.venues?.venues?.[cityName] || []
			for (const batchEvent of cityEvents as any[]) {
				const host = rand(users)
				// Find the community for this event
				const community = batchEvent.communityName
					? communityMap.get(batchEvent.communityName)
					: null

				// Use ALL LLM data - title, subtitle, description, eventType, targetCapacity, isPaid
				const { title, subtitle, description, eventType, targetCapacity } =
					batchEvent
				// Smart timing based on event type
				const { start, end } = generateEventTiming(eventType)

				// Venue selection and location handling
				const venue = cityVenues.length > 0 ? rand(cityVenues) : null
				const isOnlineEvent = !venue || eventType === 'webinar'

				const { locationType, onlineUrl, venueAddress, venueName } =
					isOnlineEvent
						? {
								locationType: mapEventTypeToLocationType(eventType),
								onlineUrl: generateOnlineUrl(eventType),
								venueAddress: null,
								venueName: null,
							}
						: {
								locationType: mapEventTypeToLocationType(eventType),
								onlineUrl: null,
								venueAddress: generateVenueAddress(venue, cityName),
								venueName: venue,
							}

				const event = {
					slug: uniqueSlug(title),
					title,
					subtitle: subtitle || faker.company.buzzPhrase(),
					description,
					coverImage: rand(images),
					startDate: start,
					endDate: end,
					timezone: location.timezone || 'UTC',
					locationId: location.id,
					locationType,
					venueName,
					venueAddress,
					onlineUrl,
					capacity: targetCapacity || null,
					isPublished: true,
					status: EventStatus.PUBLISHED,
					visibility: EventVisibility.PUBLIC,
					publishedAt: faker.date.past(),
					requiresApproval: false,
					locationHiddenUntilApproved: false,
					hostId: host.id,
					communityId: community?.id ?? null,

					deletedAt: null,
					rsvpCount: 0,
					paidRsvpCount: 0,
					checkInCount: 0,
					viewCount: 0,
					createdAt: faker.date.past(),
					_llmEvent: batchEvent, // Store for later use
				}

				all.push(event)
			}
		}

		// Create events in database (without _llmEvent)
		const eventsToCreate = all.map(({ _llmEvent, ...rest }) => rest)
		const createdEvents = await prisma.event.createManyAndReturn({
			data: eventsToCreate,
		})

		// Reattach LLM data for later use
		createdEvents.forEach((event: any, index: number) => {
			event._llmEvent = all[index]._llmEvent
		})

		logger.info(`Created ${createdEvents.length} events from batch data`)
		const allEventCategories = []
		// Assign categories to events
		for (const event of createdEvents as any[]) {
			const categoryIds = categories
				.filter((c) => (event?._llmEvent?.categories ?? []).includes(c.name))
				.map((c) => c.id)
			const createdEventCategories =
				await prisma.eventCategory.createManyAndReturn({
					data: categoryIds.map((id) => ({
						eventId: event.id,
						categoryId: id,
					})),
				})
			allEventCategories.push(...createdEventCategories)
		}
		logger.info(`Created ${allEventCategories.length} event categories`)

		return createdEvents
	})
}
