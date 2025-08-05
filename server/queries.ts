import { cacheLife, cacheTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { CacheTags, CookieNames, Routes } from '@/lib/config'
import { getEncryptedCookie } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import type { LocationFormData } from '@/server/actions'

// Helper type for event include is not needed; but we replicate necessary logic.

export async function listNearbyEvents({
	locationId,
	take,
}: {
	locationId: string
	take: number
}) {
	'use cache'
	cacheTag(CacheTags.Event.Nearby(locationId))
	cacheLife('minutes')
	return prisma.event.findMany({
		where: {
			location: { id: locationId },
		},
		take,
		select: {
			id: true,
			title: true,
			slug: true,
			startDate: true,
			endDate: true,
			coverImage: true,
		},
	})
}

export async function getEventRsvps({ slug }: { slug: string }) {
	'use cache'
	cacheTag(CacheTags.Event.Get(slug))
	cacheLife('minutes')
	return prisma.rsvp.findMany({
		where: { event: { slug }, status: 'CONFIRMED' },
		select: {
			name: true,
			email: true,
			user: { select: { id: true, name: true, image: true } },
		},
		take: 5,
		orderBy: { createdAt: 'desc' },
	})
}

export async function listNearbyCommunities({
	locationId,
	take,
}: {
	locationId: string
	take: number
}) {
	'use cache'
	cacheTag(CacheTags.Community.Nearby(locationId))
	cacheLife('minutes')
	const session = await auth()
	const communities = await prisma.community.findMany({
		take,
		orderBy: { events: { _count: 'desc' } },
		select: {
			_count: true,
			description: true,
			slug: true,
			name: true,
			coverImage: true,
			id: true,
		},
		where: {
			events: {
				some: {
					deletedAt: null,
					isPublished: true,
					OR: [{ locationId }, { locationType: { in: ['ONLINE', 'HYBRID'] } }],
				},
			},
		},
	})
	const communityIds = communities.map((c) => c.id)
	const userCommunities = session?.user
		? await prisma.communityMembership.findMany({
				where: { userId: session.user.id, communityId: { in: communityIds } },
				select: { communityId: true, role: true },
			})
		: []
	return communities.map((community) => {
		const membership = userCommunities.find(
			(m) => m.communityId === community.id
		)
		return { ...community, metadata: { role: membership?.role ?? null } }
	})
}

export async function listNearbyCategories({
	locationId,
	take,
}: {
	locationId: string
	take: number
}) {
	'use cache'
	cacheTag(CacheTags.Category.Nearby(locationId))
	cacheLife('minutes')
	return prisma.category.findMany({
		orderBy: { events: { _count: 'desc' } },
		take,
		select: { _count: true, slug: true, name: true, id: true },
		where: {
			events: {
				some: {
					event: {
						deletedAt: null,
						isPublished: true,
						OR: [
							{ locationId },
							{ locationType: { in: ['ONLINE', 'HYBRID'] } },
						],
					},
				},
			},
		},
	})
}

interface LocationEntry {
	id: string
	name: string
	slug: string
	country: string
	continent: string
	iconPath: string | null
	_count: { events: number }
}

interface ContinentsMap {
	[continent: string]: {
		_count: { countries: number; locations: number }
		locations: LocationEntry[]
	}
}

interface CountriesMap {
	[continent: string]: {
		_count: { locations: number }
		countries: {
			[country: string]: {
				_count: { locations: number }
				locations: LocationEntry[]
			}
		}
	}
}

export async function listLocations() {
	'use cache'
	cacheTag(CacheTags.Location.List)
	cacheLife('minutes')
	const locationsData = await prisma.location.findMany({
		where: { events: { some: { isPublished: true, deletedAt: null } } },
		orderBy: [{ continent: 'asc' }, { country: 'asc' }, { name: 'asc' }],
		select: {
			_count: true,
			id: true,
			name: true,
			slug: true,
			country: true,
			iconPath: true,
			continent: true,
		},
	})
	const { continents, countries } = groupLocations(locationsData)
	return { continents, countries }
}

function groupLocations(locations: readonly LocationEntry[]) {
	return locations.reduce<{
		continents: ContinentsMap
		countries: CountriesMap
	}>(
		(acc, loc) => {
			const { continent, country } = loc
			const prevContinent = acc.continents[continent]
			const isNewCountry = !acc.countries[continent]?.countries?.[country]
			const updatedContinent = {
				_count: {
					countries:
						(prevContinent?._count.countries ?? 0) + (isNewCountry ? 1 : 0),
					locations: (prevContinent?._count.locations ?? 0) + 1,
				},
				locations: [...(prevContinent?.locations ?? []), loc],
			}
			const newContinents = { ...acc.continents, [continent]: updatedContinent }
			const prevContinentCountries = acc.countries[continent] ?? {
				_count: { locations: 0 },
				countries: {},
			}
			const prevCountry = prevContinentCountries.countries[country]
			const updatedCountry = {
				_count: { locations: (prevCountry?._count.locations ?? 0) + 1 },
				locations: [...(prevCountry?.locations ?? []), loc],
			}
			const newCountriesForContinent = {
				...prevContinentCountries.countries,
				[country]: updatedCountry,
			}
			const updatedCountriesEntry = {
				_count: { locations: prevContinentCountries._count.locations + 1 },
				countries: newCountriesForContinent,
			}
			const newCountries = {
				...acc.countries,
				[continent]: updatedCountriesEntry,
			}
			return { continents: newContinents, countries: newCountries }
		},
		{ continents: {}, countries: {} }
	)
}

export async function resolveUserLocation() {
	'use cache'
	cacheLife('minutes')
	const api = await (await import('@/server/api')).getAPI()
	const user = await api.user.getCurrentUser()
	if (user?.locationId && user.location) {
		cacheTag(CacheTags.User.Get(user.id))
		cacheTag(CacheTags.Location.Get(user.location.slug))
		return { locationId: user.locationId, location: user.location }
	}
	const { locationId: savedLocationId } =
		(await getEncryptedCookie<Partial<LocationFormData>>(
			CookieNames.PrefillLocation
		)) ?? {}
	if (savedLocationId) {
		try {
			const location = await api.location.byId({ id: savedLocationId })
			if (location) {
				cacheTag(CacheTags.Location.Get(location.slug))
				return { locationId: savedLocationId, location }
			}
		} catch {
			// ignore
		}
	}
	const defaultLocation = await api.location.getDefault()
	if (defaultLocation) {
		cacheTag(CacheTags.Location.Default)
		return { locationId: defaultLocation.id, location: defaultLocation }
	}
	redirect(Routes.Main.Events.DiscoverLocationSelect)
}
