import type { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { unstable_cache } from 'next/cache'
import z from 'zod'
import { CacheTags } from '@/lib/config'
import { createTRPCRouter, publicProcedure } from '../trpc'

type Location = Prisma.LocationGetPayload<{
	select: {
		id: true
		name: true
		slug: true
		country: true
		continent: true
		iconPath: true
		_count: true
	}
}>

// ────────────────────────────────────────────────────────────────────────────
// Strongly‑typed structures with counts
// continents → { _count, locations[] }
// countries  → continent → { _count, countries }
// countries[c].countries[country] → { _count, locations[] }

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

export const groupLocations = (locations: readonly Location[]) =>
	locations.reduce<{
		continents: ContinentsMap
		countries: CountriesMap
	}>(
		(acc, loc) => {
			const { continent, country } = loc

			/* ── CONTINENTS ─────────────────────── */
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

			/* ── COUNTRIES ──────────────────────── */
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

const Tags = CacheTags.Location

export const locationRouter = createTRPCRouter({
	// Get all locations with both continent and country groupings
	list: publicProcedure.query(async ({ ctx }) =>
		unstable_cache(
			async () => {
				const locationsData = await ctx.prisma.location.findMany({
					where: {
						events: {
							some: {
								isPublished: true,
								deletedAt: null,
							},
						},
					},
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
			},
			[Tags.List],
			{ revalidate: 3600, tags: [Tags.List] }
		)()
	),

	listSlugs: publicProcedure.query(async ({ ctx }) => {
		const cacheKey = [Tags.List, 'slugs']
		return unstable_cache(
			async () =>
				ctx.prisma.location.findMany({
					where: {
						events: {
							some: {
								isPublished: true,
								deletedAt: null,
							},
						},
					},
					select: { slug: true },
					take: 50,
				}),
			cacheKey,
			{ revalidate: 3600, tags: [Tags.List] }
		)()
	}),

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
	getDefault: publicProcedure.query(async ({ ctx }) =>
		unstable_cache(
			async () => {
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
			},
			[Tags.Default],
			{ revalidate: 3600, tags: [Tags.Default] }
		)()
	),

	get: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const cacheKey = [Tags.Get(input.slug)]
			const location = await unstable_cache(
				async () =>
					ctx.prisma.location.findUnique({
						where: {
							slug: input.slug,
							events: { some: { isPublished: true, deletedAt: null } },
						},
						include: {
							events: true,
						},
					}),
				cacheKey,
				{ revalidate: 3600, tags: [Tags.Get(input.slug)] }
			)()

			if (!location) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Location not found',
				})
			}

			return location
		}),
})
