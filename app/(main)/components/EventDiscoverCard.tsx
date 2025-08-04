'use client'
import Link from 'next/link'
import { Image } from '@/components/ui'
import { Routes } from '@/lib/config'
import { useEventDateTime } from '@/lib/hooks'
import type { RouterOutput } from '@/server/api'

type EventDiscoverCardData = RouterOutput['event']['listNearby'][number]
interface EventDiscoverCardProps extends EventDiscoverCardData {}
export const EventDiscoverCard = ({
	startDate,
	endDate,
	slug,
	title,
	coverImage,
}: EventDiscoverCardProps) => {
	const { range } = useEventDateTime({
		start: startDate,
		end: endDate,
	})
	return (
		<Link href={Routes.Main.Events.ViewBySlug(slug)}>
			<div className="flex flex-row gap-3 lg:gap-3 items-center">
				<div className="shrink-0">
					{coverImage && (
						<Image
							src={coverImage}
							alt={title}
							width={80}
							height={80}
							className="rounded-lg aspect-square object-cover"
						/>
					)}
				</div>
				<div className="flex-1 items-center">
					<h3 className="font-medium lg:text-base text-sm line-clamp-1">
						{title}
					</h3>
					<p className="text-sm text-muted-foreground">{range.date}</p>
					<p className="text-xs text-muted-foreground">{range.time}</p>
				</div>
			</div>
		</Link>
	)
}
