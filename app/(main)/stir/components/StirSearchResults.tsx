'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { trpc } from '@/lib/trpc'
import { CommunityResults } from './CommunityResults'
import { EventResults } from './EventResults'
import { SearchInterpretation } from './SearchInterpretation'
import { UserResults } from './UserResults'

const VALID_TYPES = ['all', 'events', 'users', 'communities'] as const
type TypeTab = (typeof VALID_TYPES)[number]

export const StirSearchResults = () => {
	const params = useSearchParams()
	const router = useRouter()
	const q = (params.get('q') ?? '').trim()
	const typeParam = (params.get('type') ?? 'all').toLowerCase()
	const type = (
		VALID_TYPES.includes(typeParam as TypeTab) ? typeParam : 'all'
	) as TypeTab

	const { data, isLoading, isError } = trpc.stir.search.useQuery(
		{ query: q, type, limit: 20 },
		{ enabled: q.length > 0 }
	)

	const onTabChange = (value: string) => {
		const nextType = VALID_TYPES.includes(value as TypeTab)
			? (value as TypeTab)
			: 'all'
		const base = `/stir?q=${encodeURIComponent(q)}`
		router.push(nextType === 'all' ? base : `${base}&type=${nextType}`)
	}

	const interpretation = useMemo(
		() => data?.searchSummary?.interpretation ?? '',
		[data]
	)
	const suggestions = useMemo(
		() => data?.searchSummary?.suggestions ?? [],
		[data]
	)

	if (!q) return null
	if (isError) {
		return (
			<div className="text-sm text-destructive">
				Search is unavailable right now. Please try again.
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4 lg:gap-6">
			{interpretation && (
				<SearchInterpretation
					interpretation={interpretation}
					suggestions={suggestions}
				/>
			)}

			<Tabs value={type} onValueChange={onTabChange}>
				<TabsList>
					<TabsTrigger value="all">All</TabsTrigger>
					<TabsTrigger value="events">Events</TabsTrigger>
					<TabsTrigger value="users">People</TabsTrigger>
					<TabsTrigger value="communities">Communities</TabsTrigger>
				</TabsList>

				<TabsContent value="all">
					<div className="flex flex-col gap-6">
						<EventResults
							events={data?.events?.slice(0, 6)}
							isLoading={isLoading}
						/>
						<UserResults
							users={data?.users?.slice(0, 6)}
							isLoading={isLoading}
						/>
						<CommunityResults
							communities={data?.communities?.slice(0, 6)}
							isLoading={isLoading}
						/>
					</div>
				</TabsContent>
				<TabsContent value="events">
					<EventResults events={data?.events} isLoading={isLoading} />
				</TabsContent>
				<TabsContent value="users">
					<UserResults users={data?.users} isLoading={isLoading} />
				</TabsContent>
				<TabsContent value="communities">
					<CommunityResults
						communities={data?.communities}
						isLoading={isLoading}
					/>
				</TabsContent>
			</Tabs>
		</div>
	)
}
