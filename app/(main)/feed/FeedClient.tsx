'use client'

import { Activity, Users } from 'lucide-react'
import Link from 'next/link'
import { UserHoverCard } from '@/components/shared'
import { AvatarWithFallback, Skeleton } from '@/components/ui'
import { Routes } from '@/lib/config'
import { ActivityTypeLabels } from '@/lib/constants/labels'
import { trpc } from '@/lib/trpc'

export function FeedClient() {
	const { data, isLoading } = trpc.activity.feed.useQuery({
		page: 1,
		size: 30,
	})

	if (isLoading) {
		return (
			<div className="flex flex-col gap-3">
				{Array.from({ length: 5 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
					<Skeleton key={i} className="h-16 w-full rounded-lg" />
				))}
			</div>
		)
	}

	if (!data || data.data.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4 py-16">
				<Users className="size-12 text-text-tertiary" />
				<p className="text-center text-sm text-text-tertiary">
					No activity from your friends yet.
					<br />
					Add friends to see their activity here.
				</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-2">
			{data.data.map((activity) => (
				<div
					key={activity.id}
					className="flex items-center gap-3 rounded-lg bg-bg-secondary px-4 py-3"
				>
					<UserHoverCard userId={activity.user.id}>
						{activity.user.username ? (
							<Link
								href={Routes.Main.Users.ViewByUsername(activity.user.username)}
							>
								<AvatarWithFallback
									src={activity.user.image}
									name={activity.user.name ?? undefined}
									className="size-8"
								/>
							</Link>
						) : (
							<AvatarWithFallback
								src={activity.user.image}
								name={activity.user.name ?? undefined}
								className="size-8"
							/>
						)}
					</UserHoverCard>
					<div className="flex flex-1 flex-col gap-0.5">
						<p className="text-sm text-text-primary">
							<span className="font-medium">{activity.user.name}</span>{' '}
							<span className="text-text-secondary">
								{ActivityTypeLabels[activity.type].toLowerCase()}
							</span>
						</p>
						<p className="text-xs text-text-tertiary">
							{new Date(activity.createdAt).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric',
							})}
						</p>
					</div>
					<Activity className="size-4 text-text-tertiary" />
				</div>
			))}
		</div>
	)
}
