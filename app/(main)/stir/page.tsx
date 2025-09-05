import type { Metadata } from 'next'
import { Suspense } from 'react'
import { StirSearch } from '@/components/shared/assistant'
import { Skeleton } from '@/components/ui'
import { getAPI } from '@/server/api'
import { StirResults } from './components/StirResults'
import { TrendingSection } from './components/TrendingSection'

export const metadata: Metadata = {
	title: "Stir · RSVP'd",
	description: 'Discover events, people, and communities with AI assistance.',
}

interface StirPageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function StirPage({ searchParams }: StirPageProps) {
	const params = await searchParams

	// Parse query parameter
	const q =
		typeof params.q === 'string'
			? params.q
			: Array.isArray(params.q)
				? (params.q[0] ?? '')
				: ''

	// Parse and validate type parameter
	const typeParam =
		typeof params.type === 'string'
			? params.type
			: Array.isArray(params.type)
				? params.type[0]
				: 'all'

	const validTypes = ['all', 'events', 'users', 'communities'] as const
	type SearchType = (typeof validTypes)[number]
	const type: SearchType = validTypes.includes(typeParam as SearchType)
		? (typeParam as SearchType)
		: 'all'

	const api = await getAPI()

	if (q) {
		// Search results
		const results = await api.stir.search({ query: q, type, limit: 20 })

		return (
			<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
				<div className="flex flex-col gap-3">
					<h1 className="font-bold text-2xl lg:text-4xl">Stir</h1>
					<p className="text-muted-foreground text-sm lg:text-base">
						Ask in your own words. We'll surface the right events, people, and
						communities.
					</p>
					<StirSearch />
				</div>

				<Suspense fallback={<Skeleton className="h-40 w-full" />}>
					<StirResults q={q} type={type} results={results} />
				</Suspense>
			</div>
		)
	}

	// Landing page with trending content
	const [trendingEvents, trendingUsers, trendingCommunities, suggestions] =
		await Promise.all([
			api.stir.trending({ type: 'events', limit: 6 }),
			api.stir.trending({ type: 'users', limit: 6 }),
			api.stir.trending({ type: 'communities', limit: 6 }),
			api.stir.suggestions({ limit: 6 }),
		])

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex flex-col gap-3">
				<h1 className="font-bold text-2xl lg:text-4xl">Stir</h1>
				<p className="text-muted-foreground text-sm lg:text-base">
					Ask in your own words. We'll surface the right events, people, and
					communities.
				</p>
				<StirSearch />
			</div>

			{!q && (
				<Suspense fallback={<Skeleton className="h-48 w-full" />}>
					<TrendingSection
						trendingEvents={
							trendingEvents as { id: string; title: string; startDate: Date }[]
						}
						trendingUsers={
							trendingUsers as {
								id: string
								name: string | null
								profession: string | null
							}[]
						}
						trendingCommunities={
							trendingCommunities as {
								id: string
								name: string
								isPublic: boolean
							}[]
						}
						suggestions={
							suggestions as { id: string; title: string; startDate: Date }[]
						}
					/>
				</Suspense>
			)}
		</div>
	)
}
