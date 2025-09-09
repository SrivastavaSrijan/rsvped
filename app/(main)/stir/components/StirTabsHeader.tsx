'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { trpc } from '@/lib/trpc'
import { SearchType } from '@/server/api/routers/stir/types'

export function StirTabsHeader() {
	const router = useRouter()
	const pathname = usePathname()
	const params = useSearchParams()
	const [isPending, startTransition] = useTransition()

	const type = (params.get('type') as SearchType) ?? SearchType.EVENTS
	const q = params.get('q') ?? ''

	const { data: eventsResult } = trpc.stir.search.events.useQuery(
		{ query: q, page: 1, size: 1 },
		{ enabled: q.trim().length > 0 }
	)
	const { data: communitiesResult } = trpc.stir.search.communities.useQuery(
		{ query: q, page: 1, size: 1 },
		{ enabled: q.trim().length > 0 }
	)

	const eventsCount = eventsResult?.pagination.total ?? 0
	const communitiesCount = communitiesResult?.pagination.total ?? 0

	const setType = (next: SearchType) => {
		const sp = new URLSearchParams(params)
		sp.set('type', next)
		sp.set('page', '1')
		startTransition(() => router.replace(`${pathname}?${sp.toString()}`))
	}

	return (
		<Tabs value={type} className="w-full">
			<TabsList>
				<TabsTrigger
					disabled={isPending}
					value={SearchType.EVENTS}
					onClick={() => setType(SearchType.EVENTS)}
				>
					{q ? `Events (${eventsCount})` : 'Trending Events'}
				</TabsTrigger>
				<TabsTrigger
					disabled={isPending}
					value={SearchType.COMMUNITIES}
					onClick={() => setType(SearchType.COMMUNITIES)}
				>
					{q ? `Communities (${communitiesCount})` : 'Trending Communities'}
				</TabsTrigger>
			</TabsList>
		</Tabs>
	)
}
