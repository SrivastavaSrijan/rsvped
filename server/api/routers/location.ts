import { TRPCError } from '@trpc/server'
import { cacheLife, cacheTag } from 'next/cache'
import z from 'zod'
import { CacheTags } from '@/lib/config'
import { prisma } from '@/lib/prisma'
import { createTRPCRouter, publicProcedure } from '../trpc'

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

async function listLocations() {
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
				_count: {
					locations: prevContinentCountries._count.locations + 1,
				},
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

export const locationRouter = createTRPCRouter({
	// Get all locations with both continent and country groupings
	list: publicProcedure.query(async () => listLocations()),

	// Get a single location by its unique ID
	byId: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const location = await ctx.prisma.location.findUnique({
				where: { id: input.id },
			})

			if (!location) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Location not found',
				})
			}

			return location
		}),

	// Get the first available location as a system-wide default
	getDefault: publicProcedure.query(async ({ ctx }) => {
		const location = await ctx.prisma.location.findFirst({
			where: {
				events: {
					some: {
						isPublished: true,
						deletedAt: null,
					},
				},
			},
			orderBy: {
				name: 'asc',
			},
		})

		if (!location) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'No default location available',
			})
		}
		return location
	}),

	get: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const location = await ctx.prisma.location.findUnique({
				where: {
					slug: input.slug,
					events: { some: { isPublished: true, deletedAt: null } },
				},
				include: {
					events: true,
				},
			})

			if (!location) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Location not found',
				})
			}

			return location
		}),
})
