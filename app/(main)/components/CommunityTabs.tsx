'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Routes } from '@/lib/config/routes'
import { copy } from '../copy'

interface CommunitiesTabsProps {
	managed: React.ReactNode
	member: React.ReactNode
}

export const CommunityTabs = ({ managed, member }: CommunitiesTabsProps) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()

	// Get current tab from URL, default to 'managed'
	const currentTab = searchParams.get('tab') || 'managed'

	const handleTabChange = (tab: string) => {
		startTransition(() => {
			// Clear all search params when switching tabs by navigating to clean URLs
			if (tab === 'managed') {
				router.push(Routes.Main.Communities.Managed)
			} else {
				router.push(Routes.Main.Communities.Member)
			}
		})
	}

	return (
		<Tabs value={currentTab} onValueChange={handleTabChange}>
			<TabsList>
				<TabsTrigger value="managed" disabled={isPending}>
					{copy.community.home.managed}
				</TabsTrigger>
				<TabsTrigger value="member" disabled={isPending}>
					{copy.community.home.member}
				</TabsTrigger>
			</TabsList>
			<div className="py-4">
				<TabsContent value="managed">{managed}</TabsContent>
				<TabsContent value="member">{member}</TabsContent>
			</div>
		</Tabs>
	)
}
