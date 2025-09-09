'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { trpc } from '@/lib/trpc'

export function StirTabsHeader() {
	const router = useRouter()
	const pathname = usePathname()
	const params = useSearchParams()
	const [isPending, startTransition] = useTransition()

	const type = (params.get('type') as 'events' | 'communities') ?? 'events'
	const q = params.get('q') ?? ''

	const { data: eventsHead } = trpc.stir.search.core.useQuery(
		{ query: q, page: 1, size: 1, type: 'events' },
		{ enabled: q.trim().length > 0 }
	)
	const { data: communitiesHead } = trpc.stir.search.core.useQuery(
		{ query: q, page: 1, size: 1, type: 'communities' },
		{ enabled: q.trim().length > 0 }
	)

	const eventsCount = eventsHead?.events.pagination.total ?? 0
	const communitiesCount = communitiesHead?.communities.pagination.total ?? 0

	const setType = (next: 'events' | 'communities') => {
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
					value="events"
					onClick={() => setType('events')}
				>
					{q ? `Events (${eventsCount})` : 'Trending Events'}
				</TabsTrigger>
				<TabsTrigger
					disabled={isPending}
					value="communities"
					onClick={() => setType('communities')}
				>
					{q ? `Communities (${communitiesCount})` : 'Trending Communities'}
				</TabsTrigger>
			</TabsList>
		</Tabs>
	)
}
