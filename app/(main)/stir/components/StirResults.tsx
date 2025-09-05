import { Suspense } from 'react'
import { Skeleton } from '@/components/ui'
import type { RouterOutput } from '@/server/api'
import { CommunityResults } from './CommunityResults'
import { EventResults } from './EventResults'
import { SearchInterpretation } from './SearchInterpretation'
import { SearchTabs } from './SearchTabs'
import { UserResults } from './UserResults'

type TypeTab = 'all' | 'events' | 'users' | 'communities'

interface StirResultsProps {
	q: string
	type: TypeTab
	results: RouterOutput['stir']['search']
}

export const StirResults = ({ q, type, results }: StirResultsProps) => {
	const interpretation = results.searchSummary?.interpretation ?? ''
	const suggestions = results.searchSummary?.suggestions ?? []

	return (
		<div className="flex flex-col gap-4 lg:gap-6">
			{interpretation && (
				<SearchInterpretation
					interpretation={interpretation}
					suggestions={suggestions}
				/>
			)}

			<SearchTabs q={q} type={type} />

			<Suspense fallback={<Skeleton className="h-20 w-full" />}>
				{type === 'all' && (
					<div className="flex flex-col gap-6">
						<EventResults events={results.events?.slice(0, 6)} />
						<UserResults users={results.users?.slice(0, 6)} />
						<CommunityResults communities={results.communities?.slice(0, 6)} />
					</div>
				)}
				{type === 'events' && <EventResults events={results.events} />}
				{type === 'users' && <UserResults users={results.users} />}
				{type === 'communities' && (
					<CommunityResults communities={results.communities} />
				)}
			</Suspense>
		</div>
	)
}
