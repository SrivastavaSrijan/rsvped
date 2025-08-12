import type { Prisma, PrismaClient } from '@prisma/client'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

// Type for a location with event counts
const locationSelect = {
	id: true,
	name: true,
	slug: true,
	country: true,
	continent: true,
	iconPath: true,
	timezone: true,
	_count: {
		select: { events: { where: { isPublished: true, deletedAt: null } } },
	},
} satisfies Prisma.LocationSelect

type Location = Prisma.LocationGetPayload<{ select: typeof locationSelect }>

interface ContinentsMap {
	[continent: string]: {
		_count: { countries: number; locations: number }
		locations: Location[]
	}
}

interface CountriesMap {
	[continent: string]: {
		_count: { locations: number }
		countries: {
			[country: string]: {
				_count: { locations: number }
				locations: Location[]
			}
		}
	}
}

const groupLocations = (locations: readonly Location[]) =>
	locations.reduce<{
		continents: ContinentsMap
		countries: CountriesMap
	}>(
		(acc, loc) => {
			const { continent, country } = loc
			const prevContinent = acc.continents[continent]
			const isNewCountry = !acc.countries[continent]?.countries?.[country]

			const updatedContinent: ContinentsMap[string] = {
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
				_count: {
					locations: (prevCountry?._count.locations ?? 0) + 1,
				},
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

const fetchGroupedLocations = async (prisma: PrismaClient) => {
	const locationsData = await prisma.location.findMany({
		where: {
			events: {
				some: { isPublished: true, deletedAt: null },
			},
		},
		orderBy: [{ continent: 'asc' }, { country: 'asc' }, { name: 'asc' }],
		select: locationSelect,
	})
	return groupLocations(locationsData)
}

export const locationListRouter = createTRPCRouter({
	core: publicProcedure.query(async ({ ctx }) =>
		fetchGroupedLocations(ctx.prisma)
	),
	enhanced: publicProcedure.query(async ({ ctx }) =>
		fetchGroupedLocations(ctx.prisma)
	),
})
