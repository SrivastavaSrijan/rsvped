'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { SearchType } from '@/server/api/routers/stir/types'

export const StirTabsHeader = () => {
	const router = useRouter()
	const pathname = usePathname()
	const params = useSearchParams()
	const [isPending, startTransition] = useTransition()

	const type = (params.get('type') as SearchType) ?? SearchType.EVENTS
	const q = params.get('q') ?? ''

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
					{q ? 'Events' : 'Trending Events'}
				</TabsTrigger>
				<TabsTrigger
					disabled={isPending}
					value={SearchType.COMMUNITIES}
					onClick={() => setType(SearchType.COMMUNITIES)}
				>
					{q ? 'Communities' : 'Trending Communities'}
				</TabsTrigger>
			</TabsList>
		</Tabs>
	)
}
