'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'

interface PeriodTabsProps {
	currentPeriod?: 'upcoming' | 'past'
}

export const PeriodTabs = ({ currentPeriod }: PeriodTabsProps) => {
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()
	const [isPending, startTransition] = useTransition()

	const handleTabChange = (period: string) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams)
			params.set('period', period)
			params.delete('page') // Reset pagination when switching tabs
			router.push(`${pathname}?${params.toString()}`)
		})
	}

	return (
		<Tabs value={currentPeriod}>
			<TabsList>
				<TabsTrigger
					value="upcoming"
					onClick={() => handleTabChange('upcoming')}
					disabled={isPending}
				>
					Upcoming
				</TabsTrigger>
				<TabsTrigger
					value="past"
					onClick={() => handleTabChange('past')}
					disabled={isPending}
				>
					Past
				</TabsTrigger>
			</TabsList>
		</Tabs>
	)
}
