'use client'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { Routes } from '@/lib/config/routes'

type TypeTab = 'all' | 'events' | 'users' | 'communities'

interface SearchTabsProps {
	q: string
	type: TypeTab
}

export const SearchTabs = ({ q, type }: SearchTabsProps) => {
	const router = useRouter()
	const onValueChange = (value: string) => {
		const next = (['all', 'events', 'users', 'communities'] as const).includes(
			value as TypeTab
		)
			? (value as TypeTab)
			: 'all'
		router.push(Routes.Main.Stir.Search(q, next))
	}

	return (
		<Tabs value={type} onValueChange={onValueChange}>
			<TabsList>
				<TabsTrigger value="all">All</TabsTrigger>
				<TabsTrigger value="events">Events</TabsTrigger>
				<TabsTrigger value="users">People</TabsTrigger>
				<TabsTrigger value="communities">Communities</TabsTrigger>
			</TabsList>
		</Tabs>
	)
}
