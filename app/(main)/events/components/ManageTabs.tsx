'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { useTransition } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ManageTabsProps {
	overview: ReactNode
	guests: ReactNode
	insights: ReactNode
	team: ReactNode
	feedback: ReactNode
	messages: ReactNode
	basePath: string
}

const tabs = [
	{ value: 'overview', label: 'Overview' },
	{ value: 'guests', label: 'Guests' },
	{ value: 'insights', label: 'Insights' },
	{ value: 'team', label: 'Team' },
	{ value: 'feedback', label: 'Feedback' },
	{ value: 'messages', label: 'Messages' },
] as const

export const ManageTabs = ({
	overview,
	guests,
	insights,
	team,
	feedback,
	messages,
	basePath,
}: ManageTabsProps) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()

	const currentTab = searchParams.get('tab') ?? 'overview'

	const handleTabChange = (tab: string) => {
		startTransition(() => {
			const params = new URLSearchParams()
			params.set('tab', tab)
			router.push(`${basePath}?${params.toString()}`)
		})
	}

	return (
		<Tabs value={currentTab} onValueChange={handleTabChange}>
			<TabsList className="w-full overflow-x-auto">
				{tabs.map((t) => (
					<TabsTrigger key={t.value} value={t.value} disabled={isPending}>
						{t.label}
					</TabsTrigger>
				))}
			</TabsList>
			<div
				className={cn(
					'pt-6 lg:pt-8',
					isPending && 'pointer-events-none opacity-60'
				)}
			>
				<TabsContent value="overview">{overview}</TabsContent>
				<TabsContent value="guests">{guests}</TabsContent>
				<TabsContent value="insights">{insights}</TabsContent>
				<TabsContent value="team">{team}</TabsContent>
				<TabsContent value="feedback">{feedback}</TabsContent>
				<TabsContent value="messages">{messages}</TabsContent>
			</div>
		</Tabs>
	)
}
