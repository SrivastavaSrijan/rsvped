import { Activity, Users } from 'lucide-react'
import Link from 'next/link'
import { AvatarWithFallback } from '@/components/ui'
import { Routes } from '@/lib/config'
import { ActivityTypeLabels } from '@/lib/constants/labels'
import type { RouterOutput } from '@/server/api'

type FeedData = RouterOutput['activity']['feed']

interface FeedClientProps {
	data: FeedData
}

export const FeedClient = ({ data }: FeedClientProps) => {
	if (data.data.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4 py-16">
				<Users className="size-12 text-muted-foreground" />
				<p className="text-center text-sm text-muted-foreground">
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
					className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3"
				>
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
					<div className="flex flex-1 flex-col gap-0.5">
						<p className="text-sm text-foreground">
							<span className="font-medium">{activity.user.name}</span>{' '}
							<span className="text-muted-foreground">
								{ActivityTypeLabels[activity.type].toLowerCase()}
							</span>
						</p>
						<p className="text-xs text-muted-foreground">
							{new Date(activity.createdAt).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric',
							})}
						</p>
					</div>
					<Activity className="size-4 text-muted-foreground" />
				</div>
			))}
		</div>
	)
}
