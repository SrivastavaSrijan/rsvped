'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'

interface PeriodTabsProps {
	currentPeriod?: 'upcoming' | 'past'
}

export const PeriodTabs = ({ currentPeriod }: PeriodTabsProps) => {
	const searchParams = useSearchParams()

	const createTabUrl = (period: string) => {
		const params = new URLSearchParams(searchParams)
		params.set('period', period)
		params.delete('page') // Reset pagination when switching tabs
		return `?${params.toString()}`
	}

	return (
		<Tabs value={currentPeriod}>
			<TabsList>
				<Link href={createTabUrl('upcoming')}>
					<TabsTrigger value="upcoming" asChild>
						<span>Upcoming</span>
					</TabsTrigger>
				</Link>
				<Link href={createTabUrl('past')}>
					<TabsTrigger value="past" asChild>
						<span>Past</span>
					</TabsTrigger>
				</Link>
			</TabsList>
		</Tabs>
	)
}
